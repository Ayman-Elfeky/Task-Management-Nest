import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { TasksService } from './tasks.service';
import type { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { updateTaskDto } from './dto/update-task.dto';
import { UpperCasePipe } from '../../pipes/UpperCase.pipe';
import { AuthLoggingInterceptor } from '../auth/auth-logging.interceptor';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@UseInterceptors(AuthLoggingInterceptor)
@Controller('tasks')
export class TasksController {
    constructor(private tasksService: TasksService) { }

    @Post()
    @UsePipes(
        new ValidationPipe({ whitelist: true }),
        UpperCasePipe
    )
    async createTask(@Body() dto: CreateTaskDto): Promise<Task> {
        console.log("Title: ", dto.title)
        const { title, description } = dto;
        let task = await this.tasksService.createTask(title, description);
        return task
    }


    @Get()
    async getAllTasks(): Promise<Task[]> {
        let tasks = await this.tasksService.getAllTasks()
        return tasks
    }

    @Get(':id')
    async getTaskById(@Param('id') id: string): Promise<Task> {
        let task = await this.tasksService.getTaskById(id);
        return task
    }

    @Put(':id/update')
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async updateTask(
        @Param('id') id: string,
        @Body() dto: updateTaskDto
    ): Promise<Task | string> {
        const { title, description, completed } = dto;
        let task = await this.tasksService.updateTask(id, title as string, description as string, completed);
        if(!task) {
            return "No task was found with this id"
        }
        return task
    }

    @Delete(':id')
    async deleteTask(@Param('id') id: string): Promise<String> {
        let res = await this.tasksService.deleteTask(id);
        return res
    }
}
