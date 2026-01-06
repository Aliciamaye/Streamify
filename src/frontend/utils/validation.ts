/**
 * Comprehensive validation utilities for forms and data
 */

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Email validation
export const validateEmail = (email: string): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!email) {
    errors.push({
      field: 'email',
      message: 'Email is required',
      code: 'REQUIRED',
    });
  } else if (email.length > 254) {
    errors.push({
      field: 'email',
      message: 'Email is too long',
      code: 'TOO_LONG',
    });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push({
      field: 'email',
      message: 'Invalid email format',
      code: 'INVALID_FORMAT',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Password validation
export const validatePassword = (
  password: string,
  options = { minLength: 8, requireNumbers: true, requireSpecial: true }
): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!password) {
    errors.push({
      field: 'password',
      message: 'Password is required',
      code: 'REQUIRED',
    });
  } else {
    if (password.length < options.minLength) {
      errors.push({
        field: 'password',
        message: `Password must be at least ${options.minLength} characters`,
        code: 'TOO_SHORT',
      });
    }

    if (options.requireNumbers && !/\d/.test(password)) {
      errors.push({
        field: 'password',
        message: 'Password must contain at least one number',
        code: 'NO_NUMBERS',
      });
    }

    if (options.requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push({
        field: 'password',
        message: 'Password must contain at least one special character',
        code: 'NO_SPECIAL',
      });
    }

    // Check for common weak passwords
    const weakPasswords = ['password', '123456', 'qwerty', 'abc123', 'letmein'];
    if (weakPasswords.includes(password.toLowerCase())) {
      errors.push({
        field: 'password',
        message: 'This password is too common',
        code: 'COMMON_PASSWORD',
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Username validation
export const validateUsername = (username: string): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!username) {
    errors.push({
      field: 'username',
      message: 'Username is required',
      code: 'REQUIRED',
    });
  } else {
    if (username.length < 3) {
      errors.push({
        field: 'username',
        message: 'Username must be at least 3 characters',
        code: 'TOO_SHORT',
      });
    }

    if (username.length > 30) {
      errors.push({
        field: 'username',
        message: 'Username must not exceed 30 characters',
        code: 'TOO_LONG',
      });
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      errors.push({
        field: 'username',
        message: 'Username can only contain letters, numbers, underscores, and hyphens',
        code: 'INVALID_CHARACTERS',
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Form validation
export const validateForm = (
  formData: Record<string, any>,
  schema: Record<string, (value: any) => ValidationResult>
): ValidationResult => {
  const errors: ValidationError[] = [];

  for (const [field, validator] of Object.entries(schema)) {
    const result = validator(formData[field]);
    if (!result.isValid) {
      errors.push(...result.errors);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// URL validation
export const validateUrl = (url: string): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!url) {
    errors.push({
      field: 'url',
      message: 'URL is required',
      code: 'REQUIRED',
    });
  } else {
    try {
      new URL(url);
    } catch {
      errors.push({
        field: 'url',
        message: 'Invalid URL format',
        code: 'INVALID_FORMAT',
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Number validation
export const validateNumber = (
  value: any,
  options = { min: -Infinity, max: Infinity, integer: false }
): ValidationResult => {
  const errors: ValidationError[] = [];
  const num = parseFloat(value);

  if (isNaN(num)) {
    errors.push({
      field: 'number',
      message: 'Must be a valid number',
      code: 'INVALID_NUMBER',
    });
  } else {
    if (num < options.min) {
      errors.push({
        field: 'number',
        message: `Must be at least ${options.min}`,
        code: 'TOO_SMALL',
      });
    }

    if (num > options.max) {
      errors.push({
        field: 'number',
        message: `Must not exceed ${options.max}`,
        code: 'TOO_LARGE',
      });
    }

    if (options.integer && !Number.isInteger(num)) {
      errors.push({
        field: 'number',
        message: 'Must be a whole number',
        code: 'NOT_INTEGER',
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Required field validation
export const validateRequired = (value: any): ValidationResult => {
  const errors: ValidationError[] = [];

  if (
    value === null ||
    value === undefined ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)
  ) {
    errors.push({
      field: 'field',
      message: 'This field is required',
      code: 'REQUIRED',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// File validation
export const validateFile = (
  file: File,
  options = { maxSize: 5 * 1024 * 1024, allowedTypes: ['image/jpeg', 'image/png'] }
): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!file) {
    errors.push({
      field: 'file',
      message: 'File is required',
      code: 'REQUIRED',
    });
  } else {
    if (file.size > options.maxSize) {
      errors.push({
        field: 'file',
        message: `File size exceeds ${options.maxSize / 1024 / 1024}MB limit`,
        code: 'FILE_TOO_LARGE',
      });
    }

    if (!options.allowedTypes.includes(file.type)) {
      errors.push({
        field: 'file',
        message: `File type not allowed. Allowed types: ${options.allowedTypes.join(', ')}`,
        code: 'INVALID_TYPE',
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Playlist name validation
export const validatePlaylistName = (name: string): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!name) {
    errors.push({
      field: 'playlistName',
      message: 'Playlist name is required',
      code: 'REQUIRED',
    });
  } else {
    if (name.length < 1) {
      errors.push({
        field: 'playlistName',
        message: 'Playlist name cannot be empty',
        code: 'EMPTY',
      });
    }

    if (name.length > 100) {
      errors.push({
        field: 'playlistName',
        message: 'Playlist name must not exceed 100 characters',
        code: 'TOO_LONG',
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Batch validation helper
export const createValidator = (rules: Record<string, (value: any) => ValidationResult>) => {
  return (data: Record<string, any>) => {
    const errors: ValidationError[] = [];

    for (const [field, rule] of Object.entries(rules)) {
      const result = rule(data[field]);
      if (!result.isValid) {
        errors.push(...result.errors);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };
};
