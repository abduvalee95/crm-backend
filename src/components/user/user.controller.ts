import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/libs/config/multer.conf';
import { LoginDto } from 'src/libs/dto/auth/login.dto';
import { UpdateUserDto } from 'src/libs/dto/user/update-user.dto';
import { UserRole } from 'src/libs/enums/user.enums';
import { CreateUserDto } from '../../libs/dto/user/create-user.dto';
import { User } from '../../libs/entities/user';
import { Message } from '../../libs/enums/common.enums';
import { CurrentUser } from '../auth/decorator/current.decorator';
import { Roles } from '../auth/decorator/roles.decorator';
import { AuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guards';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  async signUp(@Body() input: CreateUserDto): Promise<User> {
    return await this.userService.signUp(input);
  }

  @Post('login')
  async login(@Body() input: LoginDto): Promise<User> {
    return await this.userService.login(input);
  }

  @Get('checkAuth')
  @UseGuards(AuthGuard)
  async checkAuth(@CurrentUser() user: User): Promise<User> {
    return await this.userService.getUserById(user.id);
  }

  @Put('update')
  @UseGuards(AuthGuard)
  async updateUser(
    @Body() input: UpdateUserDto,
    @CurrentUser() user: User,
  ): Promise<User> {
    return await this.userService.updateUser(input, user.id);
  }

  @Get('all')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async getAllUsers(): Promise<User[]> {
    return await this.userService.getAllUsers();
  }

  @Post('upload-avatar')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('avatar', multerConfig))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException(Message.FILE_NOT_PROVIDED);
    }

    return await this.userService.uploadAvatar(file, user.id);
  }
}
