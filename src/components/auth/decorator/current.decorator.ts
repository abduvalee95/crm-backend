import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../../libs/entities/user';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext): User | any => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    console.log('user curent', user.id);
    // Agar property nomi berilgan bo'lsa, faqat o'sha property ni qaytarish
    if (data && user) {
      return user[data];
    }

    // Aks holda butun user ni qaytarish
    return user;
  },
);
//bu decorator userni olib beradi masalan
