import { Body, Controller, Get, Post, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { LoginDto } from 'src/libs/dto/auth/login.dto';
import { UpdateUserDto } from 'src/libs/dto/user/update-user.dto';
import { CreateUserDto } from '../../libs/dto/user/create-user.dto';
import { User } from '../../libs/entities/user';
import { CurrentUser } from '../auth/decorator/current.decorator';
import { AuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserService } from './user.service';
import { RolesGuard } from '../auth/guards/roles.guards'
import { Roles } from '../auth/decorator/roles.decorator'
import { UserRole } from 'src/libs/enums/user.enums'
import { FileInterceptor } from '@nestjs/platform-express'
import { multerConfig } from 'src/libs/config/multer.conf'

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

  @Get('checkAuth')
  @UseGuards(AuthGuard)
  async checkAuth(@CurrentUser() user: User): Promise<User> {
    console.log('CheckAuthq', user);
    return user;
  }

  @Put('update')
  @UseGuards(AuthGuard)
  async updateUser(
    @Body() input: UpdateUserDto,
    @CurrentUser() user: User,
  ): Promise<User> {
    console.log('=== Update User Request ===');
    console.log('Request body:', input);
    console.log('Authenticated user ID:', user.id);

    return await this.userService.updateUser(input, user.id);
  }

  @Get('all')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async getAllUsers(): Promise<User[]> {
    console.log(' All Users Request ===');
    return await this.userService.getAllUsers();
  }

  @Post('upload-avatar')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('avatar', multerConfig))
  async uploadAvatar(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: User): Promise<string> {
    console.log('Upload Avatar', file);
    console.log('User', user);
    return await this.userService.uploadAvatar(file, user.id);
  }
  
}
