import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { verifyPassword } from 'src/util/password';

interface PublicUserData {
  username: string;
  email: string;
  user_id: string;
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async validateUser(email: string, passwd: string): Promise<PublicUserData> {
    const user = await this.usersService.findByEmail(email);

    if (!user || !(await verifyPassword(passwd, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  async login(user: PublicUserData) {
    const payload = { sub: user.user_id, email: user.email };
    const token = await this.jwtService.signAsync(payload);
    return { message: 'login succesful', access_token: token };
  }
}
