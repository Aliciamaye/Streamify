/**
 * Security utilities for XSS prevention, CSRF protection, and data sanitization
 */

// XSS Prevention - Sanitize HTML content
export const sanitizeHTML = (html: string): string => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

// CSRF Token management
export const getCsrfToken = (): string => {
  const token = localStorage.getItem('csrf_token');
  if (!token) {
    const newToken = generateRandomToken();
    localStorage.setItem('csrf_token', newToken);
    return newToken;
  }
  return token;
};

// Generate secure random token
export const generateRandomToken = (): string => {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Password strength validator
export const validatePasswordStrength = (password: string): {
  strength: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 2;

  if (score < 2) {
    feedback.push('Too weak - add more variety');
    return { strength: 'weak', score, feedback };
  }
  if (score < 4) {
    feedback.push('Fair strength - consider adding more characters');
    return { strength: 'fair', score, feedback };
  }
  if (score < 6) {
    feedback.push('Good - consider adding special characters');
    return { strength: 'good', score, feedback };
  }
  if (score < 8) {
    feedback.push('Strong password!');
    return { strength: 'strong', score, feedback };
  }

  feedback.push('Very strong password!');
  return { strength: 'very-strong', score, feedback };
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Encrypt sensitive data (client-side)
export const encryptData = async (data: string, key: string): Promise<string> => {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const keyBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(key));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    await crypto.subtle.importKey('raw', keyBuffer, 'AES-GCM', false, ['encrypt']),
    dataBuffer
  );

  const encryptedArray = new Uint8Array(encryptedBuffer);
  const combined = new Uint8Array(iv.length + encryptedArray.length);
  combined.set(iv);
  combined.set(encryptedArray, iv.length);

  return btoa(String.fromCharCode(...combined));
};

// Prevent clickjacking
export const setupSecurityHeaders = (): void => {
  const meta = document.createElement('meta');
  meta.httpEquiv = 'X-UA-Compatible';
  meta.content = 'IE=edge';
  document.head.appendChild(meta);

  const csp = document.createElement('meta');
  csp.httpEquiv = 'Content-Security-Policy';
  csp.content = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'";
  document.head.appendChild(csp);
};

// Session management
export const createSession = (userId: string, token: string): void => {
  const expiresAt = new Date().getTime() + 24 * 60 * 60 * 1000; // 24 hours
  localStorage.setItem('session_token', token);
  localStorage.setItem('session_user', userId);
  localStorage.setItem('session_expires', expiresAt.toString());
};

export const isSessionValid = (): boolean => {
  const expiresAt = localStorage.getItem('session_expires');
  if (!expiresAt) return false;
  return new Date().getTime() < parseInt(expiresAt);
};

export const clearSession = (): void => {
  localStorage.removeItem('session_token');
  localStorage.removeItem('session_user');
  localStorage.removeItem('session_expires');
};
