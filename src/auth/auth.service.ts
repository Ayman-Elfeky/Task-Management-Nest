import { Injectable, UnauthorizedException, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './users.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  // Register
  async register(email: string, name: string, username: string, password: string) {
    const existedUser = await this.userRepo.findOne({ where: { email } });
    if (existedUser) {
      throw new ConflictException('User already exists with this email');
    }

    const usedUserName = await this.userRepo.findOne({ where: { username } });
    if (usedUserName) {
      throw new ConflictException('Username is already taken');
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = this.userRepo.create({ username, name, email, password: hashed });
    const res = await this.userRepo.save(user);

    return {
      message: 'User created successfully!',
      user: { id: res.id, username: res.username, name: res.name, email: res.email },
    };
  }

  // Login
  async login(email: string, password: string) {
    const existedUser = await this.userRepo.findOne({ where: { email } });
    if (!existedUser) {
      throw new UnauthorizedException('User Not Found');
    }

    const isPasswordValid = await bcrypt.compare(password, existedUser.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid Password');
    }

    const payload = { sub: existedUser.id, username: existedUser.username };
    const accessToken = this.jwtService.sign(payload);

    return {
      message: 'Login successful',
      name: existedUser.name,
      accessToken,
    };
  }

  // Reset Password
  async resetPassword(email: string, oldPassword: string, newPassword: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('No user found with this email');
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new UnauthorizedException('Old password is incorrect');
    }

    if (!newPassword || newPassword.length < 6) {
      throw new BadRequestException('New password must be at least 6 characters long');
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await this.userRepo.save(user);

    return { message: 'Password changed successfully!' };
  }
}