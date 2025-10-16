/**
 * Token Utility Functions
 * 
 * Provides utilities for JWT token handling:
 * - Decode JWT tokens
 * - Check token expiry
 * - Determine if token needs refresh
 */

interface JWTPayload {
  exp: number; // Expiration time (Unix timestamp in seconds)
  iat?: number; // Issued at time
  sub?: string; // Subject (user ID)
  [key: string]: any;
}

/**
 * Decode a JWT token without verification (client-side only)
 * WARNING: This does NOT verify the signature - only use for reading claims
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    if (!token || typeof token !== 'string') {
      return null;
    }

    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('Invalid JWT format - expected 3 parts');
      return null;
    }

    // Decode the payload (middle part)
    const payload = parts[1];
    
    // JWT uses base64url encoding, but atob expects standard base64
    // Convert base64url to base64: replace - with + and _ with /
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    
    // Add padding if needed (base64 requires length to be multiple of 4)
    const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
    
    // Decode base64 to JSON
    const decoded = atob(padded);
    const parsed = JSON.parse(decoded) as JWTPayload;

    return parsed;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

/**
 * Check if a JWT token is expired
 * @param token - JWT token string
 * @returns true if token is expired or invalid
 */
export function isTokenExpired(token: string | null | undefined): boolean {
  if (!token) {
    return true;
  }

  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return true;
  }

  // JWT exp is in seconds, Date.now() is in milliseconds
  const expiryTime = payload.exp * 1000;
  const now = Date.now();

  return now >= expiryTime;
}

/**
 * Get token expiry time in milliseconds
 * @param token - JWT token string
 * @returns Expiry timestamp in milliseconds, or null if invalid
 */
export function getTokenExpiryTime(token: string | null | undefined): number | null {
  if (!token) {
    return null;
  }

  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return null;
  }

  // Convert seconds to milliseconds
  return payload.exp * 1000;
}

/**
 * Check if token should be refreshed (expires within threshold)
 * @param token - JWT token string
 * @param thresholdMinutes - Minutes before expiry to trigger refresh (default: 5)
 * @returns true if token should be refreshed
 */
export function shouldRefreshToken(
  token: string | null | undefined,
  thresholdMinutes: number = 5
): boolean {
  if (!token) {
    return false;
  }

  const expiryTime = getTokenExpiryTime(token);
  if (!expiryTime) {
    return false;
  }

  const now = Date.now();
  const threshold = thresholdMinutes * 60 * 1000; // Convert to milliseconds
  const timeUntilExpiry = expiryTime - now;

  // Refresh if:
  // 1. Already expired (timeUntilExpiry <= 0)
  // 2. Will expire within threshold
  return timeUntilExpiry <= threshold;
}

/**
 * Get time until token expires in milliseconds
 * @param token - JWT token string
 * @returns Milliseconds until expiry, or 0 if expired/invalid
 */
export function getTimeUntilExpiry(token: string | null | undefined): number {
  if (!token) {
    return 0;
  }

  const expiryTime = getTokenExpiryTime(token);
  if (!expiryTime) {
    return 0;
  }

  const now = Date.now();
  const timeLeft = expiryTime - now;

  return Math.max(0, timeLeft);
}

/**
 * Format time until expiry in human-readable format
 * @param token - JWT token string
 * @returns Formatted string like "5m 30s" or "Expired"
 */
export function formatTimeUntilExpiry(token: string | null | undefined): string {
  const timeLeft = getTimeUntilExpiry(token);
  
  if (timeLeft === 0) {
    return 'Expired';
  }

  const minutes = Math.floor(timeLeft / (60 * 1000));
  const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000);

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  
  return `${seconds}s`;
}
