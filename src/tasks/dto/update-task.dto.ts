import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class updateTaskDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsBoolean()
    completed: boolean;
}