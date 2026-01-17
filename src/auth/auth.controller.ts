import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Get('status')
    @HttpCode(200)
    async status() {
        return { status: 'ok' };
    }

    @Post('register')
    @HttpCode(201)
    async register(@Body() dto: RegisterDto) {
        const { name, username, email, password } = dto
        return await this.authService.register(email, name, username, password);
    }

    @Post('login')
    @HttpCode(200)
    async login(@Body() dto: LoginDto) {
        const { email, password } = dto
        return await this.authService.login(email, password);
    }

    @Post('reset-password')
    @HttpCode(200)
    async resetPassword(@Body() dto: ResetPasswordDto) {
        const {email, newPassword, oldPassword} = dto;
        return await this.authService.resetPassword(email, oldPassword, newPassword)
    }
}
