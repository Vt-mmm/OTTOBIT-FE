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
// Matched with BE UserProfileResult model (fullName removed in latest BE)
export interface UserProfileData {
  id: string;
  email: string;
  phoneNumber?: string; // Read-only from BE
  avatarUrl?: string;
  registrationDate: string;
  roles?: string[]; // Provided by BE UserProfileResult
}

// Update profile form - Only fields BE allows to update
// Matched with BE UpdateUserProfileCommand (fullName removed in latest BE)
export interface UpdateProfileForm {
  avatarUrl?: string;
  phoneNumber?: string; // If BE supports phone update
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
