import { Injectable } from '@nestjs/common';
import { UserRole } from '../../libs/enums/user.enums';

export interface RoleInfo {
  role: UserRole;
  name: string;
  description: string;
  permissions: string[];
}

@Injectable()
export class AccessControlService {
  getRoles(): RoleInfo[] {
    return [
      {
        role: UserRole.ADMIN,
        name: 'Администратор',
        description: 'Полный доступ ко всем функциям',
        permissions: [
          'Управление пользователями',
          'Управление клиентами',
          'Управление сделками',
          'Управление задачами',
          'Просмотр отчетов',
          'Настройки системы',
          'Управление ролями',
        ],
      },
      {
        role: UserRole.MANAGER,
        name: 'Менеджер',
        description: 'Управление клиентами и сделками',
        permissions: [
          'Управление клиентами',
          'Управление сделками',
          'Управление задачами',
          'Просмотр отчетов',
        ],
      },
      {
        role: UserRole.ANALYST,
        name: 'Аналитик',
        description: 'Доступ к отчетам и аналитике',
        permissions: [
          'Просмотр отчетов',
          'Просмотр аналитики',
          'Экспорт данных',
        ],
      },
      {
        role: UserRole.SUPPORT,
        name: 'Поддержка',
        description: 'Работа с обращениями клиентов',
        permissions: [
          'Просмотр клиентов',
          'Работа с обращениями',
          'Отправка сообщений',
        ],
      },
    ];
  }

  getRoleInfo(role: UserRole): RoleInfo | undefined {
    return this.getRoles().find((r) => r.role === role);
  }
}

