import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './models/users.model';
import { CreateUserDto } from './dto/createUser';
import { hashPassword } from 'src/util/password';
import { handleError } from 'src/util/error';
import { UserBadge } from './models/user_badges.model';
import { Badge } from 'src/dashboard/models/badge.model';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User) private userModel: typeof User) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { email, username, password } = createUserDto;

    const existingUser = await this.userModel.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    try {
      const hashedPassword = await hashPassword(password);
      return await this.userModel.create({
        email,
        username,
        password: hashedPassword,
      });
    } catch (error: any) {
      throw new Error(handleError(error));
    }
  }

  async findAll(): Promise<User[]> {
    return this.userModel.findAll({
      include: [{ model: UserBadge, as: 'badges', include: [Badge] }],
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({
      where: { email },
    });
  }

  async findById(userId: string): Promise<User> {
    const userRecord = await this.userModel.findByPk(userId);
    if (!userRecord) {
      throw new Error(`User with ID ${userId} not found`);
    }
    return userRecord;
  }
}
