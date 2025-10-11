import { AxiosResponse } from "axios";
// redux
import { setIsLogout, updateLocalAccessToken } from "store/auth/authSlice";
import { RootState } from "store/config";
//
import { ROUTES_API_AUTH } from "constants/routesApiKeys";
import { getAccessToken, getRefreshToken } from "utils";
import { axiosClient, resetAuthHeaders } from "axiosClient/axiosClient";
import { TokenResponse } from "common/models";
import { Store } from "@reduxjs/toolkit";

// Track if we're in the middle of a token refresh to prevent multiple refreshes
let isRefreshing = false;
let pendingRequests: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

// Track if interceptors are added to prevent duplicates
let interceptorsAdded = false;

const processQueue = (error: unknown) => {
  pendingRequests.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(null); // Just signal completion, don't pass token
    }
  });

  pendingRequests = [];
};

// Function to reset interceptor state on logout
export const resetInterceptorState = () => {
  isRefreshing = false;
  pendingRequests = [];
  resetAuthHeaders();
};

// Define proper type for the Redux store instead of using 'any'
const setupAxiosClient = (store: Store<RootState>) => {
  // Don't add interceptors if they're already added
  if (interceptorsAdded) {
    return;
  }

  interceptorsAdded = true;

  // Intercept requests to add the authorization header
  axiosClient.interceptors.request.use(
    async (config) => {
      // Skip adding Authorization header for refresh token endpoint
      // to avoid sending expired token that will be rejected by JWT middleware
      if (config.url === ROUTES_API_AUTH.REFRESH_TOKEN) {
        // Explicitly remove Authorization header if it exists
        delete config.headers.Authorization;
        return config;
      }

      // Get a fresh token on each request to ensure we have the latest
      const accessToken = getAccessToken();
      if (accessToken) {
        // Set Authorization header with current token
        config.headers.Authorization = `Bearer ${accessToken}`;
      } else {
        // Clear Authorization header if no token exists
        // This prevents using stale token from axios defaults
        delete config.headers.Authorization;
        delete axiosClient.defaults.headers.common.Authorization;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  const { dispatch } = store;

  // Intercept responses to handle authentication errors
  axiosClient.interceptors.response.use(
    (response: AxiosResponse) => {
      // Return full response object - let individual API calls handle data extraction
      return response;
    },
    async (err) => {
      const originalConfig = err.config;

      // Skip if it's a login request or related auth endpoints or request without config or already retried
      if (
        !originalConfig ||
        originalConfig.url === ROUTES_API_AUTH.LOGIN ||
        originalConfig.url === ROUTES_API_AUTH.REFRESH_TOKEN ||
        originalConfig.url === ROUTES_API_AUTH.FORGOT_PASSWORD ||
        originalConfig.url === ROUTES_API_AUTH.RESET_PASSWORD ||
        originalConfig._retry
      ) {
        return Promise.reject(err);
      }

      // Handle 401 Unauthorized - token expired
      if (err.response?.status === 401) {
        // Check if user is authenticated - skip refresh for public pages
        const state = store.getState() as RootState;
        const isAuthenticated = state.auth.isAuthenticated;
        const userId = state.auth.userAuth?.userId;

        if (!isAuthenticated || !userId) {
          return Promise.reject(err);
        }

        // If we're not already refreshing
        if (!isRefreshing) {
          isRefreshing = true;
          originalConfig._retry = true;

          try {
            const refreshToken = getRefreshToken();

            if (!refreshToken) {
              throw new Error("Missing refresh token");
            }

            const data = {
              userId,
              refreshToken,
            };

            // Make token refresh request
            const response = await axiosClient.post(
              ROUTES_API_AUTH.REFRESH_TOKEN,
              data
            );

            // Validate response
            if (
              !response ||
              !response.data ||
              !response.data.data ||
              !response.data.data.tokens ||
              !response.data.data.tokens.accessToken ||
              !response.data.data.tokens.refreshToken
            ) {
              throw new Error("Invalid token refresh response");
            }

            // Extract tokens from full response
            const tokenResponse: TokenResponse = {
              accessToken: response.data.data.tokens.accessToken,
              refreshToken: response.data.data.tokens.refreshToken,
            };

            // Update with new tokens directly (don't remove first to avoid Redux state reset)
            // This prevents router from detecting auth loss and redirecting
            await dispatch(
              updateLocalAccessToken({
                accessToken: tokenResponse.accessToken,
                refreshToken: tokenResponse.refreshToken,
              })
            );

            // 🔧 CRITICAL FIX: Wait for cookies to be actually written
            // Small delay ensures cookie update completes before processing queue
            // This prevents race condition where pending requests read old refresh token
            await new Promise(resolve => setTimeout(resolve, 50));

            // DON'T set token in axios defaults - let request interceptor
            // read fresh token from cookie on each request
            // This ensures multiple tabs stay in sync

            // Process all queued requests - they will get fresh token from cookie
            processQueue(null);

            // Retry the original request with new token
            isRefreshing = false;
            return axiosClient(originalConfig);
          } catch (error: any) {
            // Check if this is a refresh token error from backend
            const errorCode = error?.response?.data?.errorCode;
            const errorMessage = error?.response?.data?.message || "";

            // Only logout for truly expired tokens, not for temporary mismatches
            // REFRESH_TOKEN_INVALID means token is expired or truly invalid
            // AUTH_006 "does not match" might be race condition - retry once more
            const shouldLogout =
              errorCode === "REFRESH_TOKEN_INVALID" ||
              errorMessage.toLowerCase().includes("expired") ||
              !error?.response; // Network errors should also logout
            
            // 🔧 FIX: AUTH_006 "does not match" might be race condition
            // Don't logout immediately - let pending requests fail naturally
            const isRaceCondition = errorCode === "AUTH_006";
            if (isRaceCondition) {
              console.warn("⚠️ Refresh token mismatch - possible race condition");
            }

            // Process queue with error
            processQueue(error);

            // Only logout if not a race condition
            if (shouldLogout && !isRaceCondition) {
              dispatch(setIsLogout(true));
              resetAuthHeaders();
            }

            isRefreshing = false;
            return Promise.reject(error);
          }
        } else {
          // If already refreshing, wait until refreshing is done and retry request
          return new Promise((resolve, reject) => {
            pendingRequests.push({ resolve, reject });
          })
            .then(async () => {
              // 🔧 CRITICAL FIX: Small delay to ensure cookie is readable
              // This prevents reading stale refresh token from cookie
              await new Promise(resolve => setTimeout(resolve, 100));
              
              // Don't manually set token - let request interceptor read fresh token from cookie
              // This ensures we always use the latest token, even if another tab refreshed it
              return axiosClient(originalConfig);
            })
            .catch((error) => {
              return Promise.reject(error);
            });
        }
      }

      return Promise.reject(err.response || err);
    }
  );
};

export default setupAxiosClient;
