export interface UserAuth {
  userId: string;
  username?: string;
  email: string;
  roles: string[];
  authProvider?: "password" | "google";
}

export interface UserInfo {
  accountId: number;
  email: string;
  roleName: string;
  status: string;
  emailConfirmed: boolean;
  fullName: string;
  roles: string;
}

export interface UserToUpdate {
  accountId: number;
  email?: string;
  roleName?: string;
  status?: string;
  emailConfirmed?: boolean;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string | null;
  avatar: string;
  address: string;
  registrationDate: string;
  emailConfirmed: boolean;
  lockoutEnabled: boolean;
  roles?: string[];
}

export interface UserRoles {
  userId: string;
  roles: string[];
}

export interface UserStatus {
  userId: string;
  isLocked: boolean;
}

// User Profile interfaces for Firebase avatar management
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  avatarUrl?: string;
  avatarFileName?: string; // Để track file name cho việc delete
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  avatarUrl?: string;
  avatarFileName?: string;
}

export interface AvatarUpdateRequest {
  avatarUrl: string;
  avatarFileName: string;
}
