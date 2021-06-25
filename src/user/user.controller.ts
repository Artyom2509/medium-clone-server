import { CreateUserDto } from './dto/createUserDto';
import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResponseInterface } from './types/UserResponse.interface';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('users')
  async createUser(
    @Body('user') createUserDto: CreateUserDto,
  ): Promise<UserResponseInterface> {
    const user = await this.userService.createUser(createUserDto);
    return this.userService.buildUserResponse(user);
  }
}
