import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from './task.entity';

describe('TasksService', () => {
  let service: TasksService;

  const mockTask: Task = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Test Task',
    description: 'Test Description',
    completed: false
  };

  const mockTasks: Task[] = [
    mockTask,
    {
      id: '223e4567-e89b-12d3-a456-426614174001',
      title: 'Second Task',
      description: 'Second Description',
      completed: true
    }
  ];

  const mockTaskRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getRepositoryToken(Task), useValue: mockTaskRepo },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTask', () => {
    const taskData = {
      title: 'New Task',
      description: 'New Task Description'
    };

    it('should create a task successfully', async () => {
      // Arrange
      const expectedTask: Task = {
        id: '123',
        title: taskData.title,
        description: taskData.description,
        completed: false
      };
      mockTaskRepo.create.mockReturnValue(expectedTask);
      mockTaskRepo.save.mockResolvedValue(expectedTask);

      // Act
      const result = await service.createTask(taskData.title, taskData.description);

      // Assert
      expect(mockTaskRepo.create).toHaveBeenCalledTimes(1);
      expect(mockTaskRepo.create).toHaveBeenCalledWith({
        title: taskData.title,
        description: taskData.description
      });
      expect(mockTaskRepo.save).toHaveBeenCalledTimes(1);
      expect(mockTaskRepo.save).toHaveBeenCalledWith(expectedTask);
      expect(result).toEqual(expectedTask);
    });

    it('should handle repository create error', async () => {
      // Arrange
      mockTaskRepo.create.mockImplementation(() => {
        throw new Error('Repository create failed');
      });

      // Act & Assert
      await expect(service.createTask(taskData.title, taskData.description))
        .rejects.toThrow('Repository create failed');
      expect(mockTaskRepo.create).toHaveBeenCalledTimes(1);
      expect(mockTaskRepo.save).not.toHaveBeenCalled();
    });

    it('should handle repository save error', async () => {
      // Arrange
      const taskToCreate = { ...mockTask };
      mockTaskRepo.create.mockReturnValue(taskToCreate);
      mockTaskRepo.save.mockRejectedValue(new Error('Database save failed'));

      // Act & Assert
      await expect(service.createTask(taskData.title, taskData.description))
        .rejects.toThrow('Database save failed');
      expect(mockTaskRepo.create).toHaveBeenCalledTimes(1);
      expect(mockTaskRepo.save).toHaveBeenCalledTimes(1);
    });

    it('should create task with empty description', async () => {
      // Arrange
      const taskWithEmptyDesc = {
        id: '123',
        title: 'Task with empty desc',
        description: '',
        completed: false
      };
      mockTaskRepo.create.mockReturnValue(taskWithEmptyDesc);
      mockTaskRepo.save.mockResolvedValue(taskWithEmptyDesc);

      // Act
      const result = await service.createTask('Task with empty desc', '');

      // Assert
      expect(mockTaskRepo.create).toHaveBeenCalledWith({
        title: 'Task with empty desc',
        description: ''
      });
      expect(result).toEqual(taskWithEmptyDesc);
    });
  });

  describe('getAllTasks', () => {
    it('should return all tasks', async () => {
      // Arrange
      mockTaskRepo.find.mockResolvedValue(mockTasks);

      // Act
      const result = await service.getAllTasks();

      // Assert
      expect(mockTaskRepo.find).toHaveBeenCalledTimes(1);
      expect(mockTaskRepo.find).toHaveBeenCalledWith();
      expect(result).toEqual(mockTasks);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no tasks exist', async () => {
      // Arrange
      mockTaskRepo.find.mockResolvedValue([]);

      // Act
      const result = await service.getAllTasks();

      // Assert
      expect(mockTaskRepo.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle repository find error', async () => {
      // Arrange
      mockTaskRepo.find.mockRejectedValue(new Error('Database connection failed'));

      // Act & Assert
      await expect(service.getAllTasks()).rejects.toThrow('Database connection failed');
      expect(mockTaskRepo.find).toHaveBeenCalledTimes(1);
    });

    it('should return tasks with different completion states', async () => {
      // Arrange
      const mixedTasks: Task[] = [
        { ...mockTask, completed: false },
        { ...mockTask, id: '2', completed: true },
        { ...mockTask, id: '3', completed: false }
      ];
      mockTaskRepo.find.mockResolvedValue(mixedTasks);

      // Act
      const result = await service.getAllTasks();

      // Assert
      expect(result).toHaveLength(3);
      expect(result.filter(task => task.completed)).toHaveLength(1);
      expect(result.filter(task => !task.completed)).toHaveLength(2);
    });
  });

  describe('getTaskById', () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';

    it('should return a task by id', async () => {
      // Arrange
      mockTaskRepo.findOne.mockResolvedValue(mockTask);

      // Act
      const result = await service.getTaskById(taskId);

      // Assert
      expect(mockTaskRepo.findOne).toHaveBeenCalledTimes(1);
      expect(mockTaskRepo.findOne).toHaveBeenCalledWith({ where: { id: taskId } });
      expect(result).toEqual(mockTask);
    });

    it('should return null when task is not found', async () => {
      // Arrange
      mockTaskRepo.findOne.mockResolvedValue(null);

      // Act
      const result = await service.getTaskById('non-existent-id');

      // Assert
      expect(mockTaskRepo.findOne).toHaveBeenCalledTimes(1);
      expect(mockTaskRepo.findOne).toHaveBeenCalledWith({ where: { id: 'non-existent-id' } });
      expect(result).toBeNull();
    });

    it('should handle repository findOne error', async () => {
      // Arrange
      mockTaskRepo.findOne.mockRejectedValue(new Error('Database query failed'));

      // Act & Assert
      await expect(service.getTaskById(taskId)).rejects.toThrow('Database query failed');
      expect(mockTaskRepo.findOne).toHaveBeenCalledTimes(1);
    });

    it('should handle invalid UUID format', async () => {
      // Arrange
      const invalidId = 'invalid-uuid';
      mockTaskRepo.findOne.mockResolvedValue(null);

      // Act
      const result = await service.getTaskById(invalidId);

      // Assert
      expect(mockTaskRepo.findOne).toHaveBeenCalledWith({ where: { id: invalidId } });
      expect(result).toBeNull();
    });
  });

  describe('updateTask', () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';
    const updateData = {
      title: 'Updated Title',
      description: 'Updated Description',
      completed: true
    };

    it('should update a task successfully', async () => {
      // Arrange
      const existingTask = { ...mockTask };
      const updatedTask: Task = {
        ...existingTask,
        title: updateData.title,
        description: updateData.description,
        completed: updateData.completed
      };
      
      // Mock the service's own getTaskById method
      jest.spyOn(service, 'getTaskById').mockResolvedValue(existingTask);
      mockTaskRepo.save.mockResolvedValue(updatedTask);

      // Act
      const result = await service.updateTask(
        taskId,
        updateData.title,
        updateData.description,
        updateData.completed
      );

      // Assert
      expect(service.getTaskById).toHaveBeenCalledTimes(1);
      expect(service.getTaskById).toHaveBeenCalledWith(taskId);
      expect(mockTaskRepo.save).toHaveBeenCalledTimes(1);
      expect(mockTaskRepo.save).toHaveBeenCalledWith(existingTask);
      expect(existingTask.title).toBe(updateData.title);
      expect(existingTask.description).toBe(updateData.description);
      expect(existingTask.completed).toBe(updateData.completed);
      expect(result).toEqual(updatedTask);
    });

    it('should return null when task is not found', async () => {
      // Arrange
      jest.spyOn(service, 'getTaskById').mockResolvedValue(null as any);

      // Act
      const result = await service.updateTask(
        'non-existent-id',
        updateData.title,
        updateData.description,
        updateData.completed
      );

      // Assert
      expect(service.getTaskById).toHaveBeenCalledTimes(1);
      expect(service.getTaskById).toHaveBeenCalledWith('non-existent-id');
      expect(mockTaskRepo.save).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should handle partial updates with null values', async () => {
      // Arrange
      const existingTask = { ...mockTask };
      const partiallyUpdatedTask = { ...existingTask };
      
      jest.spyOn(service, 'getTaskById').mockResolvedValue(existingTask);
      mockTaskRepo.save.mockResolvedValue(partiallyUpdatedTask);

      // Act
      const result = await service.updateTask(taskId, null as any, null as any, false);

      // Assert
      expect(existingTask.title).toBe(mockTask.title); // Should retain original title
      expect(existingTask.description).toBe(mockTask.description); // Should retain original description
      expect(existingTask.completed).toBe(false); // Should update completed status
      expect(mockTaskRepo.save).toHaveBeenCalledWith(existingTask);
    });

    it('should handle partial updates with undefined values', async () => {
      // Arrange
      const existingTask = { ...mockTask };
      
      jest.spyOn(service, 'getTaskById').mockResolvedValue(existingTask);
      mockTaskRepo.save.mockResolvedValue(existingTask);

      // Act
      const result = await service.updateTask(
        taskId,
        undefined as any,
        undefined as any,
        true
      );

      // Assert
      expect(existingTask.title).toBe(mockTask.title); // Should retain original
      expect(existingTask.description).toBe(mockTask.description); // Should retain original
      expect(existingTask.completed).toBe(true); // Should update
    });

    it('should handle repository save error during update', async () => {
      // Arrange
      const existingTask = { ...mockTask };
      jest.spyOn(service, 'getTaskById').mockResolvedValue(existingTask);
      mockTaskRepo.save.mockRejectedValue(new Error('Update failed'));

      // Act & Assert
      await expect(service.updateTask(
        taskId,
        updateData.title,
        updateData.description,
        updateData.completed
      )).rejects.toThrow('Update failed');
      
      expect(service.getTaskById).toHaveBeenCalledTimes(1);
      expect(mockTaskRepo.save).toHaveBeenCalledTimes(1);
    });

    it('should handle getTaskById error during update', async () => {
      // Arrange
      jest.spyOn(service, 'getTaskById').mockRejectedValue(new Error('Task lookup failed'));

      // Act & Assert
      await expect(service.updateTask(
        taskId,
        updateData.title,
        updateData.description,
        updateData.completed
      )).rejects.toThrow('Task lookup failed');
      
      expect(service.getTaskById).toHaveBeenCalledTimes(1);
      expect(mockTaskRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('deleteTask', () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';

    it('should delete a task successfully', async () => {
      // Arrange
      mockTaskRepo.delete.mockResolvedValue({ affected: 1 });

      // Act
      const result = await service.deleteTask(taskId);

      // Assert
      expect(mockTaskRepo.delete).toHaveBeenCalledTimes(1);
      expect(mockTaskRepo.delete).toHaveBeenCalledWith(taskId);
      expect(result).toBe('Task Deleted Successfully!');
    });

    it('should return success message even when task does not exist', async () => {
      // Arrange
      mockTaskRepo.delete.mockResolvedValue({ affected: 0 }); // No rows affected

      // Act
      const result = await service.deleteTask('non-existent-id');

      // Assert
      expect(mockTaskRepo.delete).toHaveBeenCalledTimes(1);
      expect(mockTaskRepo.delete).toHaveBeenCalledWith('non-existent-id');
      expect(result).toBe('Task Deleted Successfully!');
    });

    it('should handle repository delete error', async () => {
      // Arrange
      mockTaskRepo.delete.mockRejectedValue(new Error('Delete operation failed'));

      // Act & Assert
      await expect(service.deleteTask(taskId)).rejects.toThrow('Delete operation failed');
      expect(mockTaskRepo.delete).toHaveBeenCalledTimes(1);
      expect(mockTaskRepo.delete).toHaveBeenCalledWith(taskId);
    });

    it('should handle deletion with invalid UUID format', async () => {
      // Arrange
      const invalidId = 'invalid-uuid-format';
      mockTaskRepo.delete.mockResolvedValue({ affected: 0 });

      // Act
      const result = await service.deleteTask(invalidId);

      // Assert
      expect(mockTaskRepo.delete).toHaveBeenCalledWith(invalidId);
      expect(result).toBe('Task Deleted Successfully!');
    });

    it('should handle database constraint errors', async () => {
      // Arrange
      mockTaskRepo.delete.mockRejectedValue(new Error('Foreign key constraint violation'));

      // Act & Assert
      await expect(service.deleteTask(taskId)).rejects.toThrow('Foreign key constraint violation');
      expect(mockTaskRepo.delete).toHaveBeenCalledTimes(1);
    });
  });
});
