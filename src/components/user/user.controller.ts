import { Body, Controller, Post } from '@nestjs/common';
import { LoginDto } from 'src/libs/dto/auth/login.dto';
import { CreateUserDto } from '../../libs/dto/user/create-user.dto';
import { User } from '../../libs/entities/user';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  async signUp(@Body() input: CreateUserDto): Promise<User> {
    console.log('Signup', input);
    return await this.userService.signUp(input);
  }

  @Post('login')
  async login(@Body() input: LoginDto): Promise<User> {
    console.log('Login', input);
    return await this.userService.login(input);
  }
}
