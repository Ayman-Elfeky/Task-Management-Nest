import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { BadRequestException, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    resetPassword: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {provide: AuthService, useValue: mockAuthService}
      ]
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  })

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    const mockRegisterDto: RegisterDto = {
      name: 'John Doe',
      username: 'john123',
      email: 'john@test.com',
      password: 'password123'
    };

    const mockSuccessResponse = {
      message: "User created successfully!",
      user: {
        id: '1',
        username: 'john123',
        name: 'John Doe',
        email: 'john@test.com'
      }
    };

    it('should register a user successfully', async () => {
      // Arrange
      mockAuthService.register.mockResolvedValue(mockSuccessResponse);

      // Act
      const result = await controller.register(mockRegisterDto);

      // Assert
      expect(mockAuthService.register).toHaveBeenCalledTimes(1);
      expect(mockAuthService.register).toHaveBeenCalledWith(
        mockRegisterDto.email,
        mockRegisterDto.name,
        mockRegisterDto.username,
        mockRegisterDto.password,
      );
      expect(result).toEqual(mockSuccessResponse);
    });

    it('should throw ConflictException when user already exists', async ()=> {
      // Arrange
      mockAuthService.register.mockRejectedValue(
        new ConflictException('User already exists with this email')
      );

      // Act & Assert
      await expect(controller.register(mockRegisterDto)).rejects.toThrow(
        ConflictException
      );
      expect(mockAuthService.register).toHaveBeenCalledTimes(1)
    });

    it('should throw ConflictException when username is taken', async () => {
      // Arrange
      mockAuthService.register.mockRejectedValue(
        new ConflictException('Username is already taken')
      );

      // Act & Assert
      await expect(controller.register(mockRegisterDto)).rejects.toThrow(
        ConflictException
      );
      expect(mockAuthService.register).toHaveBeenCalledTimes(1);
    });
  });

  describe('login', () => {
    const mockLoginDto: LoginDto = {
      email: 'john@test.com',
      password: 'password123'
    };

    const mockLoginResponse = {
      message: 'Login successful',
      name: 'John Doe',
      accessToken: 'mock-jwt-token'
    };

    it('should login user successfully', async () => {
      // Arrange
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      // Act
      const result = await controller.login(mockLoginDto);

      // Assert
      expect(mockAuthService.login).toHaveBeenCalledTimes(1);
      expect(mockAuthService.login).toHaveBeenCalledWith(
        mockLoginDto.email,
        mockLoginDto.password
      );
      expect(result).toEqual(mockLoginResponse);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      // Arrange
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('User Not Found')
      );

      // Act & Assert
      await expect(controller.login(mockLoginDto)).rejects.toThrow(
        UnauthorizedException
      );
      expect(mockAuthService.login).toHaveBeenCalledTimes(1)
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      // Arrange
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid Password')
      );

      // Act & Assert
      await expect(controller.login(mockLoginDto)).rejects.toThrow(
        UnauthorizedException
      );
      expect(mockAuthService.login).toHaveBeenCalledTimes(1);
    });
  });

  describe('resetPassword', () => {
    const mockResetPasswordDto: ResetPasswordDto = {
      email: 'john@test.com',
      oldPassword: 'oldpassword123',
      newPassword: 'newpassword123'
    };

    const mockResetResponse = {
      message: 'Password changed successfully!'
    };

    it('should reset password successfully', async () => {
      // Arrange
      mockAuthService.resetPassword.mockResolvedValue(mockResetResponse);

      // Act
      const result = await controller.resetPassword(mockResetPasswordDto);

      // Assert
      expect(mockAuthService.resetPassword).toHaveBeenCalledTimes(1);
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(
        mockResetPasswordDto.email,
        mockResetPasswordDto.oldPassword,
        mockResetPasswordDto.newPassword
      );
      expect(result).toEqual(mockResetResponse);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      // Arrange
      mockAuthService.resetPassword.mockRejectedValue(
        new NotFoundException('No user found with this email')
      );

      // Act & Assert
      await expect(controller.resetPassword(mockResetPasswordDto)).rejects.toThrow(
        NotFoundException
      );
      expect(mockAuthService.resetPassword).toHaveBeenCalledTimes(1);
    });

    it('should throw UnauthorizedException when old password is incorrect', async () => {
      // Arrange
      mockAuthService.resetPassword.mockRejectedValue(
        new UnauthorizedException('Old password is incorrect')
      );

      // Act & Assert
      await expect(controller.resetPassword(mockResetPasswordDto)).rejects.toThrow(
        UnauthorizedException
      );
      expect(mockAuthService.resetPassword).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException when new password is too short', async () => {
      // Arrange
      mockAuthService.resetPassword.mockRejectedValue(
        new BadRequestException('New password must be at least 6 characters long')
      );

      // Act & Assert
      await expect(controller.resetPassword(mockResetPasswordDto)).rejects.toThrow(
        BadRequestException
      );
      expect(mockAuthService.resetPassword).toHaveBeenCalledTimes(1);
    });

    it('should handle edge case with different parameter values', async () => {
      // Arrange
      const edgeCaseDto: ResetPasswordDto = {
        email: 'different@test.com',
        oldPassword: 'different-old',
        newPassword: 'different-new-password'
      };
      mockAuthService.resetPassword.mockResolvedValue(mockResetResponse);

      // Act
      const result = await controller.resetPassword(edgeCaseDto);

      // Assert
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(
        edgeCaseDto.email,
        edgeCaseDto.oldPassword,
        edgeCaseDto.newPassword
      );
      expect(result).toEqual(mockResetResponse);
    });
  })
});
