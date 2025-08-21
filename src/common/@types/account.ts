// Account management interfaces (sử dụng lại các interface từ form.ts)
export interface AccountChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ForgotPasswordForm {
  email: string;
}

export interface ResetPasswordForm {
  email: string;
  resetToken: string;
  newPassword: string;
  confirmNewPassword: string;
}

// API Response interfaces
export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

// User profile interfaces for account management
export interface UserProfileData {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  avatarUrl?: string;
  registrationDate: string;
  emailConfirmed: boolean;
  lastLoginDate?: string;
}

export interface UpdateProfileForm {
  fullName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
}

export interface AccountSecuritySettings {
  twoFactorEnabled: boolean;
  lastPasswordChange?: string;
  loginHistory: LoginHistoryItem[];
}

export interface LoginHistoryItem {
  loginDate: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
}
