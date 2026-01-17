import { Injectable } from '@nestjs/common';
import { Task } from './task.entity';
import { v4 as uuidv4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private tasksRepo: Repository<Task>
    ) { }

    // Create 
    async createTask(title: string, description: string): Promise<Task> {
        let task = this.tasksRepo.create({ title, description })
        let see = await this.tasksRepo.save(task)
        console.log("SEE save method: ", see)
        return task 
    }

    // Read (all)
    async getAllTasks(): Promise<Task[]> {
        return this.tasksRepo.find()
    }

    // Read (by id)
    async getTaskById(id: string): Promise<Task> {
        let task = this.tasksRepo.findOne({ where: { id } })
        return task as unknown as Task
    }

    // Update Task
    async updateTask(id: string, title: string, description: string, completed: boolean): Promise<Task | null> {
        let task = await this.getTaskById(id);
        if(!task) return null;
        task.title = title ?? task.title;
        task.completed = completed ?? task.completed;
        task.description = description ?? task.description;
        return this.tasksRepo.save(task)
    }

    // Delete Task
    async deleteTask(id: string): Promise<String> {
        await this.tasksRepo.delete(id);
        return "Task Deleted Successfully!"
    }
}
