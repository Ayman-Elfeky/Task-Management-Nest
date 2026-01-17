import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './users.entity';
import * as bcrypt from 'bcrypt';

// Create a mock repository
const mockUserRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

// Create a mock JwtService
const mockJwtService = {
  sign: jest.fn().mockReturnValue('mockAccessToken'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerData = {
      email: 'test@test.com',
      name: 'John Doe',
      username: 'john123',
      password: 'password123'
    };

    const mockUser = {
      id: '123',
      username: 'john123',
      name: 'John Doe',
      email: 'test@test.com',
      password: 'hashedPassword'
    };

    it('should register a user successfully', async () => {
      // Arrange
      mockUserRepo.findOne
        .mockResolvedValueOnce(null) // No existing user with email
        .mockResolvedValueOnce(null); // No existing user with username
      mockUserRepo.create.mockReturnValue(mockUser);
      mockUserRepo.save.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      // Act
      const result = await service.register(
        registerData.email,
        registerData.name,
        registerData.username,
        registerData.password
      );

      // Assert
      expect(mockUserRepo.findOne).toHaveBeenCalledTimes(2);
      expect(mockUserRepo.findOne).toHaveBeenNthCalledWith(1, { where: { email: registerData.email } });
      expect(mockUserRepo.findOne).toHaveBeenNthCalledWith(2, { where: { username: registerData.username } });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerData.password, 10);
      expect(mockUserRepo.create).toHaveBeenCalledWith({
        username: registerData.username,
        name: registerData.name,
        email: registerData.email,
        password: 'hashedPassword'
      });
      expect(mockUserRepo.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({
        message: 'User created successfully!',
        user: {
          id: mockUser.id,
          username: mockUser.username,
          name: mockUser.name,
          email: mockUser.email
        }
      });
    });

    it('should throw ConflictException when user already exists with email', async () => {
      // Arrange
      mockUserRepo.findOne.mockResolvedValueOnce(mockUser); // Existing user found

      // Act & Assert
      await expect(service.register(
        registerData.email,
        registerData.name,
        registerData.username,
        registerData.password
      )).rejects.toThrow(new ConflictException('User already exists with this email'));
      
      expect(mockUserRepo.findOne).toHaveBeenCalledTimes(1);
      expect(mockUserRepo.findOne).toHaveBeenCalledWith({ where: { email: registerData.email } });
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(mockUserRepo.create).not.toHaveBeenCalled();
      expect(mockUserRepo.save).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when username is already taken', async () => {
      // Arrange
      mockUserRepo.findOne
        .mockResolvedValueOnce(null) // No existing user with email
        .mockResolvedValueOnce(mockUser); // Existing user with username

      // Act & Assert
      await expect(service.register(
        registerData.email,
        registerData.name,
        registerData.username,
        registerData.password
      )).rejects.toThrow(new ConflictException('Username is already taken'));
      
      expect(mockUserRepo.findOne).toHaveBeenCalledTimes(2);
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(mockUserRepo.create).not.toHaveBeenCalled();
      expect(mockUserRepo.save).not.toHaveBeenCalled();
    });

    it('should handle bcrypt hash error', async () => {
      // Arrange
      mockUserRepo.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      (bcrypt.hash as jest.Mock).mockRejectedValue(new Error('Hashing failed'));

      // Act & Assert
      await expect(service.register(
        registerData.email,
        registerData.name,
        registerData.username,
        registerData.password
      )).rejects.toThrow('Hashing failed');
      
      expect(bcrypt.hash).toHaveBeenCalledWith(registerData.password, 10);
      expect(mockUserRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginData = {
      email: 'test@test.com',
      password: 'password123'
    };

    const mockUser = {
      id: '1',
      username: 'ayman',
      name: 'Ayman',
      email: 'test@test.com',
      password: 'hashedPass'
    };

    it('should return access token if login is successful', async () => {
      // Arrange
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await service.login(loginData.email, loginData.password);

      // Assert
      expect(mockUserRepo.findOne).toHaveBeenCalledTimes(1);
      expect(mockUserRepo.findOne).toHaveBeenCalledWith({ where: { email: loginData.email } });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, mockUser.password);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        username: mockUser.username
      });
      expect(result).toEqual({
        message: 'Login successful',
        name: mockUser.name,
        accessToken: 'mockAccessToken'
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      // Arrange
      mockUserRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(loginData.email, loginData.password)).rejects.toThrow(
        new UnauthorizedException('User Not Found')
      );
      
      expect(mockUserRepo.findOne).toHaveBeenCalledWith({ where: { email: loginData.email } });
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      // Arrange
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(service.login(loginData.email, loginData.password)).rejects.toThrow(
        new UnauthorizedException('Invalid Password')
      );
      
      expect(mockUserRepo.findOne).toHaveBeenCalledWith({ where: { email: loginData.email } });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, mockUser.password);
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });

    it('should handle bcrypt compare error', async () => {
      // Arrange
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockRejectedValue(new Error('Comparison failed'));

      // Act & Assert
      await expect(service.login(loginData.email, loginData.password)).rejects.toThrow('Comparison failed');
      
      expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, mockUser.password);
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    const resetData = {
      email: 'test@test.com',
      oldPassword: 'oldpassword123',
      newPassword: 'newpassword123'
    };

    const mockUser = {
      id: '1',
      username: 'testuser',
      name: 'Test User',
      email: 'test@test.com',
      password: 'hashedOldPassword'
    };

    it('should reset password successfully', async () => {
      // Arrange
      const testUser = { ...mockUser }; // Create a copy to avoid mutation issues
      mockUserRepo.findOne.mockResolvedValue(testUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewPassword');
      mockUserRepo.save.mockResolvedValue({ ...testUser, password: 'hashedNewPassword' });

      // Act
      const result = await service.resetPassword(
        resetData.email,
        resetData.oldPassword,
        resetData.newPassword
      );

      // Assert
      expect(mockUserRepo.findOne).toHaveBeenCalledWith({ where: { email: resetData.email } });
      expect(bcrypt.compare).toHaveBeenCalledWith(resetData.oldPassword, mockUser.password);
      expect(bcrypt.hash).toHaveBeenCalledWith(resetData.newPassword, 10);
      expect(mockUserRepo.save).toHaveBeenCalledWith(testUser);
      expect(testUser.password).toBe('hashedNewPassword'); // Check the user object was modified
      expect(result).toEqual({
        message: 'Password changed successfully!'
      });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      // Arrange
      mockUserRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.resetPassword(
        resetData.email,
        resetData.oldPassword,
        resetData.newPassword
      )).rejects.toThrow(new NotFoundException('No user found with this email'));
      
      expect(mockUserRepo.findOne).toHaveBeenCalledWith({ where: { email: resetData.email } });
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(mockUserRepo.save).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when old password is incorrect', async () => {
      // Arrange
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(service.resetPassword(
        resetData.email,
        resetData.oldPassword,
        resetData.newPassword
      )).rejects.toThrow(new UnauthorizedException('Old password is incorrect'));
      
      expect(mockUserRepo.findOne).toHaveBeenCalledWith({ where: { email: resetData.email } });
      expect(bcrypt.compare).toHaveBeenCalledWith(resetData.oldPassword, mockUser.password);
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(mockUserRepo.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when new password is too short', async () => {
      // Arrange
      const shortPassword = '12345'; // 5 characters, less than required 6
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act & Assert
      await expect(service.resetPassword(
        resetData.email,
        resetData.oldPassword,
        shortPassword
      )).rejects.toThrow(new BadRequestException('New password must be at least 6 characters long'));
      
      expect(mockUserRepo.findOne).toHaveBeenCalledWith({ where: { email: resetData.email } });
      expect(bcrypt.compare).toHaveBeenCalledWith(resetData.oldPassword, mockUser.password);
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(mockUserRepo.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when new password is empty', async () => {
      // Arrange
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act & Assert
      await expect(service.resetPassword(
        resetData.email,
        resetData.oldPassword,
        ''
      )).rejects.toThrow(new BadRequestException('New password must be at least 6 characters long'));
      
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(mockUserRepo.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when new password is null', async () => {
      // Arrange
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act & Assert
      await expect(service.resetPassword(
        resetData.email,
        resetData.oldPassword,
        null as any
      )).rejects.toThrow(new BadRequestException('New password must be at least 6 characters long'));
      
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(mockUserRepo.save).not.toHaveBeenCalled();
    });

    it('should handle bcrypt hash error during password reset', async () => {
      // Arrange
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockRejectedValue(new Error('Hash generation failed'));

      // Act & Assert
      await expect(service.resetPassword(
        resetData.email,
        resetData.oldPassword,
        resetData.newPassword
      )).rejects.toThrow('Hash generation failed');
      
      expect(bcrypt.hash).toHaveBeenCalledWith(resetData.newPassword, 10);
      expect(mockUserRepo.save).not.toHaveBeenCalled();
    });

    it('should handle database save error', async () => {
      // Arrange
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewPassword');
      mockUserRepo.save.mockRejectedValue(new Error('Database save failed'));

      // Act & Assert
      await expect(service.resetPassword(
        resetData.email,
        resetData.oldPassword,
        resetData.newPassword
      )).rejects.toThrow('Database save failed');
      
      expect(mockUserRepo.save).toHaveBeenCalledWith(mockUser);
    });
  });
});