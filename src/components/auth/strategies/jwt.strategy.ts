import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../../../libs/entities/user';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.SECRET_TOKEN || 'your-secret-key',
    });
  }

  async validate(payload: any): Promise<User> {
    // JWT payload dan user ma'lumotlarini olish
    const user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      fullName: payload.fullName,
      avatar: payload.avatar,
    } as User;
console.log('user from jwt strategy', user);
    if (!user || !user.id) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return user;
  }
}
