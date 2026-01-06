/**
 * User Model
 * MongoDB schema for user data with RBAC support
 */

/**
 * User roles for role-based access control
 */
export enum UserRole {
  USER = 'user',
  PREMIUM = 'premium',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

/**
 * Permissions that can be assigned to users
 */
export enum UserPermission {
  // Content permissions
  CREATE_PLAYLIST = 'create_playlist',
  EDIT_PLAYLIST = 'edit_playlist',
  DELETE_PLAYLIST = 'delete_playlist',
  SHARE_PLAYLIST = 'share_playlist',

  // Social permissions
  COMMENT = 'comment',
  FOLLOW = 'follow',
  MESSAGE = 'message',

  // Moderation permissions
  MODERATE_COMMENTS = 'moderate_comments',
  MODERATE_USERS = 'moderate_users',
  VIEW_REPORTS = 'view_reports',

  // Admin permissions
  MANAGE_USERS = 'manage_users',
  MANAGE_CONTENT = 'manage_content',
  VIEW_ANALYTICS = 'view_analytics',
  MANAGE_SETTINGS = 'manage_settings',

  // Premium features
  HIGH_QUALITY_AUDIO = 'high_quality_audio',
  OFFLINE_MODE = 'offline_mode',
  NO_ADS = 'no_ads'
}

export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  bio?: string;
  role: UserRole;
  permissions: UserPermission[];
  preferences?: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  isEmailVerified: boolean;
  isActive: boolean;
  isBanned: boolean;
  banReason?: string;
  bannedUntil?: Date;
}

export interface UserPreferences {
  theme: 'midnight' | 'nebula' | 'arctic' | 'sunset' | 'ocean' | 'forest';
  language: string;
  qualityPreference: 'low' | 'medium' | 'high' | 'lossless';
  autoPlaySimilar: boolean;
  privateMode: boolean;
  notificationsEnabled: boolean;
}

export interface UserRegistration {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserUpdateProfile {
  firstName?: string;
  lastName?: string;
  bio?: string;
  profilePicture?: string;
  preferences?: Partial<UserPreferences>;
}

// MongoDB schema definition (TypeScript interface for type safety)
export const userSchema = {
  id: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true, index: true },
  username: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  firstName: String,
  lastName: String,
  profilePicture: String,
  bio: String,
  role: { type: String, enum: Object.values(UserRole), default: UserRole.USER },
  permissions: { type: [String], default: [] },
  preferences: {
    theme: { type: String, default: 'midnight' },
    language: { type: String, default: 'en' },
    qualityPreference: { type: String, default: 'high' },
    autoPlaySimilar: { type: Boolean, default: true },
    privateMode: { type: Boolean, default: false },
    notificationsEnabled: { type: Boolean, default: true },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastLogin: Date,
  isEmailVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isBanned: { type: Boolean, default: false },
  banReason: String,
  bannedUntil: Date,
};

/**
 * Helper function to get default permissions for a role
 */
export const getDefaultPermissionsForRole = (role: UserRole): UserPermission[] => {
  switch (role) {
    case UserRole.SUPER_ADMIN:
      return Object.values(UserPermission);

    case UserRole.ADMIN:
      return [
        UserPermission.CREATE_PLAYLIST,
        UserPermission.EDIT_PLAYLIST,
        UserPermission.DELETE_PLAYLIST,
        UserPermission.SHARE_PLAYLIST,
        UserPermission.COMMENT,
        UserPermission.FOLLOW,
        UserPermission.MESSAGE,
        UserPermission.MODERATE_COMMENTS,
        UserPermission.MODERATE_USERS,
        UserPermission.VIEW_REPORTS,
        UserPermission.MANAGE_USERS,
        UserPermission.MANAGE_CONTENT,
        UserPermission.VIEW_ANALYTICS,
        UserPermission.HIGH_QUALITY_AUDIO,
        UserPermission.NO_ADS,
      ];

    case UserRole.MODERATOR:
      return [
        UserPermission.CREATE_PLAYLIST,
        UserPermission.EDIT_PLAYLIST,
        UserPermission.DELETE_PLAYLIST,
        UserPermission.SHARE_PLAYLIST,
        UserPermission.COMMENT,
        UserPermission.FOLLOW,
        UserPermission.MESSAGE,
        UserPermission.MODERATE_COMMENTS,
        UserPermission.VIEW_REPORTS,
        UserPermission.HIGH_QUALITY_AUDIO,
        UserPermission.NO_ADS,
      ];

    case UserRole.PREMIUM:
      return [
        UserPermission.CREATE_PLAYLIST,
        UserPermission.EDIT_PLAYLIST,
        UserPermission.DELETE_PLAYLIST,
        UserPermission.SHARE_PLAYLIST,
        UserPermission.COMMENT,
        UserPermission.FOLLOW,
        UserPermission.MESSAGE,
        UserPermission.HIGH_QUALITY_AUDIO,
        UserPermission.OFFLINE_MODE,
        UserPermission.NO_ADS,
      ];

    case UserRole.USER:
    default:
      return [
        UserPermission.CREATE_PLAYLIST,
        UserPermission.EDIT_PLAYLIST,
        UserPermission.DELETE_PLAYLIST,
        UserPermission.SHARE_PLAYLIST,
        UserPermission.COMMENT,
        UserPermission.FOLLOW,
        UserPermission.MESSAGE,
      ];
  }
};

/**
 * Check if a user has a specific permission
 */
export const hasPermission = (user: User, permission: UserPermission): boolean => {
  if (user.isBanned) {
    return false;
  }

  if (!user.isActive) {
    return false;
  }

  return user.permissions.includes(permission);
};

/**
 * Check if a user has admin privileges
 */
export const isAdmin = (user: User): boolean => {
  return user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN;
};

/**
 * Check if a user has moderator privileges or higher
 */
export const isModerator = (user: User): boolean => {
  return user.role === UserRole.MODERATOR || isAdmin(user);
};

/**
 * Check if a user has premium access
 */
export const isPremium = (user: User): boolean => {
  return user.role === UserRole.PREMIUM || isModerator(user);
};

