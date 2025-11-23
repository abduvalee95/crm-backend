import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'src/libs/entities/user';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  public async hashPassword(memberPassword: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(memberPassword, salt);
  }

  public async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  public async createToken(user: User): Promise<string> {
    console.log('token', user);
    const payload = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    };
    console.log('payload', payload);

    return await this.jwtService.signAsync(payload);
  }

  public async verifyToken(token: string): Promise<User> {
    const input = await this.jwtService.verifyAsync(token); // Tokenga yuklagan qiymatmiz member osha memberni qiymatni olib berdi, vaqtniham verify qilyabmiz
    return input;
  }
}
