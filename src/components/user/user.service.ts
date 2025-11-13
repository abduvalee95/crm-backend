import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginDto } from 'src/libs/dto/auth/login.dto';
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
      user.token = await this.authService.createToken(user);
      
      return user;
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

      throw new BadRequestException(error.message || Message.CREATE_FAILED);
    }
  }

  // login service
  public async login(input: LoginDto): Promise<User> {
    console.log('login service');
    const { email, password } = input;

    const response: User = await this.userRepository.findOne({
      where: { email },
    });
    // bu erga statuus qilamiz delete or block
    const isMatch = await this.authService.comparePassword;
    return;
  }
}
