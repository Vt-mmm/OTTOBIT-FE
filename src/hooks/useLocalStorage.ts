import { useState, useEffect } from "react";

const TOKEN_KEY = "authToken";

/**
 * Hook để đọc và ghi vào localStorage
 */
export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
};

/**
 * Hàm tiện ích để lấy token từ localStorage
 * @returns JWT token hoặc null nếu không tìm thấy
 */
export const getToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error("Error reading auth token from localStorage:", error);
    return null;
  }
};

/**
 * Hàm tiện ích để lưu token vào localStorage
 */
export const setToken = (token: string): void => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error("Error setting auth token to localStorage:", error);
  }
};

/**
 * Hàm tiện ích để xóa token khỏi localStorage
 */
export const removeToken = (): void => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error("Error removing auth token from localStorage:", error);
  }
};

export default useLocalStorage;
