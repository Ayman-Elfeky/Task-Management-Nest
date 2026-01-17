import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { updateTaskDto } from './dto/update-task.dto';
import { Task } from './task.entity';

describe('TasksController', () => {
  let controller: TasksController;
  let service: TasksService;

  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    completed: false
  };

  const mockTasks: Task[] = [
    mockTask,
    {
      id: '2',
      title: 'Second Task',
      description: 'Second Description', 
      completed: true
    }
  ];

  const mockTasksService = {
    createTask: jest.fn(),
    getAllTasks: jest.fn(),
    getTaskById: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {provide: TasksService, useValue: mockTasksService}
      ]
    }).compile();

    controller = module.get<TasksController>(TasksController);
    service = module.get<TasksService>(TasksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createTask', () => {
    const createTaskDto: CreateTaskDto = {
      title: 'New Task',
      description: 'New Task Description'
    };

    it('should create a task successfully', async () => {
      // Arrange
      const expectedTask: Task = {
        id: '123',
        title: 'New Task',
        description: 'New Task Description',
        completed: false
      };
      mockTasksService.createTask.mockResolvedValue(expectedTask);

      // Act
      const result = await controller.createTask(createTaskDto);

      // Assert
      expect(mockTasksService.createTask).toHaveBeenCalledTimes(1);
      expect(mockTasksService.createTask).toHaveBeenCalledWith(
        createTaskDto.title,
        createTaskDto.description
      );
      expect(result).toEqual(expectedTask);
    });

    it('should handle service errors when creating task', async () => {
      // Arrange
      mockTasksService.createTask.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(controller.createTask(createTaskDto)).rejects.toThrow('Database error');
      expect(mockTasksService.createTask).toHaveBeenCalledTimes(1);
    });
  });

  describe('getAllTasks', () => {
    it('should return all tasks', async () => {
      // Arrange
      mockTasksService.getAllTasks.mockResolvedValue(mockTasks);

      // Act
      const result = await controller.getAllTasks();

      // Assert
      expect(mockTasksService.getAllTasks).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockTasks);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no tasks exist', async () => {
      // Arrange
      mockTasksService.getAllTasks.mockResolvedValue([]);

      // Act
      const result = await controller.getAllTasks();

      // Assert
      expect(mockTasksService.getAllTasks).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle service errors when getting all tasks', async () => {
      // Arrange
      mockTasksService.getAllTasks.mockRejectedValue(new Error('Database connection failed'));

      // Act & Assert
      await expect(controller.getAllTasks()).rejects.toThrow('Database connection failed');
      expect(mockTasksService.getAllTasks).toHaveBeenCalledTimes(1);
    });
  });

  describe('getTaskById', () => {
    it('should return a task by id', async () => {
      // Arrange
      const taskId = '1';
      mockTasksService.getTaskById.mockResolvedValue(mockTask);

      // Act
      const result = await controller.getTaskById(taskId);

      // Assert
      expect(mockTasksService.getTaskById).toHaveBeenCalledTimes(1);
      expect(mockTasksService.getTaskById).toHaveBeenCalledWith(taskId);
      expect(result).toEqual(mockTask);
    });

    it('should handle case when task is not found', async () => {
      // Arrange
      const taskId = 'non-existent';
      mockTasksService.getTaskById.mockResolvedValue(null);

      // Act
      const result = await controller.getTaskById(taskId);

      // Assert
      expect(mockTasksService.getTaskById).toHaveBeenCalledTimes(1);
      expect(mockTasksService.getTaskById).toHaveBeenCalledWith(taskId);
      expect(result).toBeNull();
    });

    it('should handle service errors when getting task by id', async () => {
      // Arrange
      const taskId = '1';
      mockTasksService.getTaskById.mockRejectedValue(new Error('Task not found'));

      // Act & Assert
      await expect(controller.getTaskById(taskId)).rejects.toThrow('Task not found');
      expect(mockTasksService.getTaskById).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateTask', () => {
    const updateDto: updateTaskDto = {
      title: 'Updated Task',
      description: 'Updated Description',
      completed: true
    };

    const updatedTask: Task = {
      id: '1',
      title: 'Updated Task',
      description: 'Updated Description',
      completed: true
    };

    it('should update a task successfully', async () => {
      // Arrange
      const taskId = '1';
      mockTasksService.updateTask.mockResolvedValue(updatedTask);

      // Act
      const result = await controller.updateTask(taskId, updateDto);

      // Assert
      expect(mockTasksService.updateTask).toHaveBeenCalledTimes(1);
      expect(mockTasksService.updateTask).toHaveBeenCalledWith(
        taskId,
        updateDto.title,
        updateDto.description,
        updateDto.completed
      );
      expect(result).toEqual(updatedTask);
    });

    it('should return error message when task not found', async () => {
      // Arrange
      const taskId = 'non-existent';
      mockTasksService.updateTask.mockResolvedValue(null);

      // Act
      const result = await controller.updateTask(taskId, updateDto);

      // Assert
      expect(mockTasksService.updateTask).toHaveBeenCalledTimes(1);
      expect(mockTasksService.updateTask).toHaveBeenCalledWith(
        taskId,
        updateDto.title,
        updateDto.description,
        updateDto.completed
      );
      expect(result).toBe("No task was found with this id");
    });

    it('should handle partial updates', async () => {
      // Arrange
      const taskId = '1';
      const partialUpdateDto: updateTaskDto = {
        title: 'Only Title Updated',
        completed: false
      };
      const partiallyUpdatedTask: Task = {
        ...mockTask,
        title: 'Only Title Updated'
      };
      mockTasksService.updateTask.mockResolvedValue(partiallyUpdatedTask);

      // Act
      const result = await controller.updateTask(taskId, partialUpdateDto);

      // Assert
      expect(mockTasksService.updateTask).toHaveBeenCalledTimes(1);
      expect(mockTasksService.updateTask).toHaveBeenCalledWith(
        taskId,
        partialUpdateDto.title,
        partialUpdateDto.description,
        partialUpdateDto.completed
      );
      expect(result).toEqual(partiallyUpdatedTask);
    });

    it('should handle service errors when updating task', async () => {
      // Arrange
      const taskId = '1';
      mockTasksService.updateTask.mockRejectedValue(new Error('Update failed'));

      // Act & Assert
      await expect(controller.updateTask(taskId, updateDto)).rejects.toThrow('Update failed');
      expect(mockTasksService.updateTask).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteTask', () => {
    it('should delete a task successfully', async () => {
      // Arrange
      const taskId = '1';
      const successMessage = "Task Deleted Successfully!";
      mockTasksService.deleteTask.mockResolvedValue(successMessage);

      // Act
      const result = await controller.deleteTask(taskId);

      // Assert
      expect(mockTasksService.deleteTask).toHaveBeenCalledTimes(1);
      expect(mockTasksService.deleteTask).toHaveBeenCalledWith(taskId);
      expect(result).toBe(successMessage);
    });

    it('should handle deletion of non-existent task', async () => {
      // Arrange
      const taskId = 'non-existent';
      const successMessage = "Task Deleted Successfully!"; // Service still returns success even if task doesn't exist
      mockTasksService.deleteTask.mockResolvedValue(successMessage);

      // Act
      const result = await controller.deleteTask(taskId);

      // Assert
      expect(mockTasksService.deleteTask).toHaveBeenCalledTimes(1);
      expect(mockTasksService.deleteTask).toHaveBeenCalledWith(taskId);
      expect(result).toBe(successMessage);
    });

    it('should handle service errors when deleting task', async () => {
      // Arrange
      const taskId = '1';
      mockTasksService.deleteTask.mockRejectedValue(new Error('Delete operation failed'));

      // Act & Assert
      await expect(controller.deleteTask(taskId)).rejects.toThrow('Delete operation failed');
      expect(mockTasksService.deleteTask).toHaveBeenCalledTimes(1);
    });
  });
});
