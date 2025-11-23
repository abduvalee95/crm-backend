import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginDto } from 'src/libs/dto/auth/login.dto';
import { UpdateUserDto } from 'src/libs/dto/user/update-user.dto';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../../libs/dto/user/create-user.dto';
import { User } from '../../libs/entities/user';
import { Message } from '../../libs/enums/common.enums';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private authService: AuthService,
  ) {}

  //sign up
  public async signUp(input: CreateUserDto): Promise<User> {
    input.password = await this.authService.hashPassword(input.password);

    try {
      console.log('Service input:', input);
      // Emailni tekshiramiz
      const existingUser = await this.userRepository.findOne({
        where: { email: input.email },
      });
      if (existingUser) {
        throw new BadRequestException(Message.EMAIL_ALREADY_EXISTS);
      }
      console.log('Password hashed successfully');
      // User inputdan
      const user = await this.userRepository.create(input);
      const savedUser = await this.userRepository.save(user);

      savedUser.token = await this.authService.createToken(savedUser);

      return savedUser;
    } catch (error) {
      console.error('SignUp error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });

      if (error instanceof BadRequestException) {
        throw error;
      }

      // Database constraint xatoliklarini aniqlash
      if (error.code === '23505') {
        // Unique constraint violation
        throw new BadRequestException(
          error.message || Message.EMAIL_ALREADY_EXISTS,
        );
      }

      throw new InternalServerErrorException(
        error.message || Message.CREATE_FAILED,
      );
    }
  }

  // login service
  public async login(input: LoginDto): Promise<User> {
    console.log('login service');
    const { email, password } = input;

    const response: User = await this.userRepository.findOne({
      where: { email },
    });
    if (!response) {
      throw new BadRequestException('Email or password is incorrect');
    }
    // bu erga statuus qilamiz delete or block
    console.log('before isMatchresponse', response);
    const isMatch = await this.authService.comparePassword(
      password,
      response?.password,
    );
    console.log('isMatch', isMatch);
    if (!isMatch) {
      throw new InternalServerErrorException(Message.WRONG_PASSWORD);
    }
    console.log('after response', response);
    response.token = await this.authService.createToken(response);
    console.log('response tokwn', response.token);
    return response;
  }

  public async updateUser(input: UpdateUserDto, userId: string): Promise<User> {
    console.log('=== Update User Service ===');
    console.log('Input:', input);
    console.log('User ID:', userId);

    // 1. Database dan TO'LIQ user ma'lumotlarini olamiz (password bilan)
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: [
        'id',
        'email',
        'password',
        'fullName',
        'role',
        'phone',
        'avatar',
        'position',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!user) {
      throw new BadRequestException(Message.NO_DATA_FOUND);
    }

    console.log('Current user email:', user.email);

    // 2. EMAIL O'ZGARTIRISH - tekshirish va validatsiya
    if (input.email) {
      const newEmail = input.email.trim().toLowerCase();

      // Agar email o'zgarmasa, hech narsa qilmaymiz
      if (newEmail === user.email) {
        console.log("Email o'zgarmadi, skip qilamiz");
      } else {
        console.log("Email o'zgartirilmoqda:", user.email, '->', newEmail);

        // Yangi email allaqachon mavjudligini tekshiramiz
        const existingUser = await this.userRepository.findOne({
          where: { email: newEmail },
        });

        if (existingUser) {
          throw new BadRequestException(Message.EMAIL_ALREADY_EXISTS);
        }

        // Email ni yangilaymiz
        user.email = newEmail;
      }
    }

    // 3. PASSWORD YANGILASH - validatsiya va hash
    if (input.currentPassword || input.newPassword) {
      // Agar bitta password field berilgan bo'lsa, ikkalasi ham bo'lishi kerak
      if (!input.currentPassword || !input.newPassword) {
        throw new BadRequestException(
          'Both currentPassword and newPassword are required to change password',
        );
      }

      // Joriy password 
      const isPasswordMatch = await this.authService.comparePassword(
        input.currentPassword,
        user.password,
      );

      if (!isPasswordMatch) {
        throw new BadRequestException('Current password is incorrect');
      }

      // Yangi password eski password bilan bir xi
      const isSamePassword = await this.authService.comparePassword(
        input.newPassword,
        user.password,
      );

      if (isSamePassword) {
        throw new BadRequestException(
          'New password must be different from current password',
        );
      }

      // Yangi passwordni hash qilamiz
      user.password = await this.authService.hashPassword(input.newPassword);
      console.log('Password yangilandi');
    }


    const { currentPassword, newPassword, email, ...otherFields } = input;

    if (Object.keys(otherFields).length > 0) {
      console.log('Boshqa fieldlar yangilanmoqda:', Object.keys(otherFields));
      Object.assign(user, otherFields);
    }

    try {
      console.log('user token', user.token);
      const updatedUser = await this.userRepository.save(user);
      console.log('User muvaffaqiyatli yangilandi');

      delete updatedUser.password;
      updatedUser.token = await this.authService.createToken(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Update error:', error);

      if (error.code === '23505') {

        throw new BadRequestException(Message.EMAIL_ALREADY_EXISTS);
      }

      throw new InternalServerErrorException(
        error.message || 'Failed to update user',
      );
    }
  }

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.find({
      select: ['id', 'fullName', 'email', 'phone', 'position', 'role', 'avatar'],
    });
  }

  async uploadAvatar(file: Express.Multer.File, userId: string): Promise<string> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException(Message.NO_DATA_FOUND);
    }
    user.avatar = file.path;
    await this.userRepository.save(user);
    return user.avatar;
  }
  

}
