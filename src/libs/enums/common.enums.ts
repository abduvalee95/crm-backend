export enum Message {
  SOMETHING_WENT_WRONG = 'Something Went Wrong!!!',
  NO_DATA_FOUND = 'Noo! Data Found!',
  EMAIL_ALREADY_EXISTS = 'Email already exists!',
  CREATE_FAILED = 'Create FAILED!',
  UPDATE_FALED = 'Update FAILED!',
  REMOVE_FAILED = 'Remove FAILED!',
  UPLOAD_FAILED = 'Upload FAILED!',
  BAD_REQUEST = 'Bad Request!!!',

  NO_MEMBER_NICK = 'No member With that Nick!',
  BLOCKED_USER = 'Oh Sorry! You Have been Blocked!',
  WRONG_PASSWORD = 'Wrong Password, Try Another!',
  NOT_AUTHENTICATED = 'You are Not Authenticated, Please Login First!',
  TOKEN_NOT_EXIST = 'Bearer Token is Not Provided!',
  ONLY_SPESIFIC_ROLES_ALLOWED = 'Allowed Only For Members With Spesific Roles!',
  NOT_ALLOWED_REQUEST = 'Not Allowed Request!',
  PROVIDE_ALLOWED_FORMAT = 'Please Provide JPG, JPEG or PNG format Images!',
  SELF_SUBSCRIPTION_DENIED = 'You are trying Subscribe to Yourself, Self subscribtion is Denied!',

  // Password related messages
  PASSWORD_CHANGE_REQUIRED = 'Both currentPassword and newPassword are required to change password',
  CURRENT_PASSWORD_INCORRECT = 'Current password is incorrect',
  NEW_PASSWORD_SAME_AS_OLD = 'New password must be different from current password',

  // Login related messages
  EMAIL_OR_PASSWORD_INCORRECT = 'Email or password is incorrect',

  // File upload related messages
  FILE_REQUIRED = 'File is required',
  FILE_NOT_PROVIDED = 'No file provided',

  // Update related messages
  UPDATE_USER_FAILED = 'Failed to update user',
}
