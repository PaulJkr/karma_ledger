import {
  Controller,
  Get,
  Param,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { handleError } from 'src/util/error';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }
  @Get('/lookup')
  async findByEmail(@Query('email') email: string) {
    try {
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        throw new HttpException(
          { status: HttpStatus.NOT_FOUND, message: 'User not found' },
          HttpStatus.NOT_FOUND,
        );
      }
      return user;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: handleError(error),
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    try {
      return await this.usersService.findById(id);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: handleError(error),
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
