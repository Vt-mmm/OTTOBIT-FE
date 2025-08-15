export interface LoginForm {
  email: string;
  password: string;
}

export interface EmailForm {
  email: string;
}

export interface VerificationForm {
  email: string;
  otpCode: string;
}

export interface ResetForm {
  email: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdatePasswordForm {
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordForm {
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}
