export enum SocketEvent {
  // Connection events
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  CONNECTION_INFO = 'connection_info',

  // Message events
  MESSAGE = 'message',
  MESSAGE_SENT = 'message_sent',
  MESSAGE_RECEIVED = 'message_received',

  // Typing events
  TYPING_START = 'typing_start',
  TYPING_STOP = 'typing_stop',

  // Notification events
  NOTIFICATION = 'notification',
  NOTIFICATION_READ = 'notification_read',

  // Deal events
  DEAL_CREATED = 'deal_created',
  DEAL_UPDATED = 'deal_updated',
  DEAL_DELETED = 'deal_deleted',

  // Client events
  CLIENT_CREATED = 'client_created',
  CLIENT_UPDATED = 'client_updated',

  // Task events
  TASK_CREATED = 'task_created',
  TASK_UPDATED = 'task_updated',
  TASK_COMPLETED = 'task_completed',

  // User events
  USER_ONLINE = 'user_online',
  USER_OFFLINE = 'user_offline',
  USER_UPDATED = 'user_updated',

  // Error events
  ERROR = 'error',
  UNAUTHORIZED = 'unauthorized',
}
