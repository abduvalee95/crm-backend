import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Message } from 'src/libs/enums/common.enums';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext | any): Promise<boolean> {
    console.info('--- @guard() Authentication [AuthGuard] ---!!!');

    if (context.contextType === 'http') {
      const request = context.switchToHttp().getRequest();

      const bearerToken = request.headers.authorization;
      if (!bearerToken) throw new BadRequestException(Message.TOKEN_NOT_EXIST);

      const token = bearerToken.split(' ')[1],
        authMember = await this.authService.verifyToken(token);
      if (!authMember)
        throw new UnauthorizedException(Message.NOT_AUTHENTICATED);

      console.log('memberNick[auth] =>', authMember.fullName);
      console.log('memberNick[auth] =>', authMember.id);
      request.user = authMember;

      return true;
    }

    //! description => http, rpc, gprs and etc are ignored
  }
}
