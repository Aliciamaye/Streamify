/**
 * Auth Controller - Minimal Working Version
 */

import { Request, Response } from 'express';
import AuthService, { UserPayload } from '../services/AuthService';
import { ApiResponse, asyncHandler } from '../utils/helpers';
import { Logger } from '../utils/logger';
import { User, UserRole, UserPermission } from '../models/User';
import { v4 as uuidv4 } from 'uuid';

const logger = new Logger('AuthController');
const usersDatabase: Map<string, User> = new Map();

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, username, password, firstName, lastName } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json(new ApiResponse(false, 'Missing required fields', null, 400));
  }

  const existingEmail = Array.from(usersDatabase.values()).find((u) => u.email === email);
  if (existingEmail) {
    return res.status(409).json(new ApiResponse(false, 'Email already registered', null, 409));
  }

  try {
    const passwordHash = await AuthService.hashPassword(password);
    const newUser: User = {
      id: uuidv4(),
      email,
      username,
      passwordHash,
      firstName,
      lastName,
      role: UserRole.USER,
      permissions: [
        UserPermission.CREATE_PLAYLIST,
        UserPermission.EDIT_PLAYLIST,
        UserPermission.DELETE_PLAYLIST,
        UserPermission.SHARE_PLAYLIST,
        UserPermission.COMMENT,
        UserPermission.FOLLOW,
        UserPermission.MESSAGE
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      isEmailVerified: false,
      isActive: true,
      isBanned: false,
      preferences: {
        theme: 'midnight',
        language: 'en',
        qualityPreference: 'high',
        autoPlaySimilar: true,
        privateMode: false,
        notificationsEnabled: true,
      },
    };

    usersDatabase.set(newUser.id, newUser);

    const userPayload: UserPayload = {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
    };

    const tokens = AuthService.generateTokenPair(userPayload);

    logger.info(`User registered: ${newUser.id}`);

    return res.status(201).json(
      new ApiResponse(true, 'User registered successfully', {
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
        },
        ...tokens,
      })
    );
  } catch (error) {
    logger.error('Registration error:', error);
    return res.status(500).json(new ApiResponse(false, 'Registration failed', null, 500));
  }
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json(new ApiResponse(false, 'Email and password required', null, 400));
  }

  try {
    const user = Array.from(usersDatabase.values()).find((u) => u.email === email);

    if (!user) {
      return res.status(401).json(new ApiResponse(false, 'Invalid credentials', null, 401));
    }

    const isPasswordValid = await AuthService.comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json(new ApiResponse(false, 'Invalid credentials', null, 401));
    }

    user.lastLogin = new Date();
    usersDatabase.set(user.id, user);

    const userPayload: UserPayload = {
      id: user.id,
      email: user.email,
      username: user.username,
    };

    const tokens = AuthService.generateTokenPair(userPayload);

    logger.info(`User logged in: ${user.id}`);

    return res.status(200).json(
      new ApiResponse(true, 'Login successful', {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          profilePicture: user.profilePicture,
        },
        ...tokens,
      })
    );
  } catch (error) {
    logger.error('Login error:', error);
    return res.status(500).json(new ApiResponse(false, 'Login failed', null, 500));
  }
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    return res.status(400).json(new ApiResponse(false, 'Refresh token required', null, 400));
  }

  try {
    const newTokens = AuthService.refreshAccessToken(token);

    if (!newTokens) {
      return res.status(401).json(new ApiResponse(false, 'Invalid refresh token', null, 401));
    }

    return res.status(200).json(new ApiResponse(true, 'Token refreshed', newTokens));
  } catch (error) {
    logger.error('Token refresh error:', error);
    return res.status(500).json(new ApiResponse(false, 'Token refresh failed', null, 500));
  }
});

export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const user = usersDatabase.get(userId);

  if (!user) {
    return res.status(404).json(new ApiResponse(false, 'User not found', null, 404));
  }

  return res.status(200).json(
    new ApiResponse(true, 'User retrieved', {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio,
      profilePicture: user.profilePicture,
      preferences: user.preferences,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    })
  );
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  if (userId) {
    logger.info(`User logged out: ${userId}`);
  }
  return res.status(200).json(new ApiResponse(true, 'Logout successful', null));
});
