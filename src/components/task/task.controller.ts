import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
// import { ApiTags } from '@nestjs/swagger';
import { CreateTaskDto } from '../../libs/dto/task/create-task.dto';
import { UpdateTaskDto } from '../../libs/dto/task/update-task.dto';
import { User } from '../../libs/entities/user';
import { CurrentUser } from '../auth/decorator/current.decorator';
import { AuthGuard } from '../auth/guards/jwt-auth.guard';
import { TaskService } from './task.service';

// @ApiTags('Tasks')
@Controller('tasks')
@UseGuards(AuthGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  create(@Body() createDto: CreateTaskDto, @CurrentUser() user: User) {
    return this.taskService.createTask(createDto, user.id);
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.taskService.getAllTasks(user.id, user.role);
  }

  @Get('calendar')
  getCalendarEvents(
    @CurrentUser() user: User,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    const startDate = start ? new Date(start) : new Date(new Date().setDate(1)); // Oy boshi
    const endDate = end
      ? new Date(end)
      : new Date(new Date().setMonth(new Date().getMonth() + 1)); // Keyingi oy

    return this.taskService.getTasksForCalendar(
      user.id,
      user.role,
      startDate,
      endDate,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.taskService.getTaskById(id, user.id, user.role);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateTaskDto,
    @CurrentUser() user: User,
  ) {
    return this.taskService.updateTask(id, updateDto, user.id, user.role);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.taskService.deleteTask(id, user.id, user.role);
  }
}
