import { AxiosResponse } from "axios";
// redux
import {
  removeToken,
  setIsLogout,
  updateLocalAccessToken,
} from "reduxStore/auth/authSlice";
import { RootState } from "reduxStore/config";
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

const processQueue = (error: unknown, token: string | null = null) => {
  pendingRequests.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
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
      // Get a fresh token on each request to ensure we have the latest
      const accessToken = getAccessToken();
      if (accessToken) {
        // Always set the Authorization header with the current token
        config.headers.Authorization = `Bearer ${accessToken}`;
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
      // Safe access of response data to prevent undefined errors
      if (response && response.data !== undefined) {
        return response.data;
      }
      
      // If response exists but data is undefined, return the response itself
      if (response) {
        return response;
      }
      
      // Last resort fallback to prevent undefined errors
      return {};
    },
    async (err) => {
      const originalConfig = err.config;

      // Skip if it's a login request or related auth endpoints or request without config or already retried
      if (
        !originalConfig || 
        originalConfig.url === ROUTES_API_AUTH.LOGIN ||
        originalConfig.url === ROUTES_API_AUTH.FORGOT_PASSWORD ||
        originalConfig.url === ROUTES_API_AUTH.RESET_PASSWORD ||
        originalConfig._retry
      ) {
        return Promise.reject(err);
      }

      // Handle 401 Unauthorized - token expired
      if (err.response?.status === 401) {
        // If we're not already refreshing
        if (!isRefreshing) {
          isRefreshing = true;
          originalConfig._retry = true;

          try {
            const accessToken = getAccessToken();
            const refreshToken = getRefreshToken();

            if (!accessToken || !refreshToken) {
              throw new Error("Missing tokens");
            }

            const data = {
              accessToken,
              refreshToken,
            };

            // Make token refresh request
            const response = await axiosClient.post(
              ROUTES_API_AUTH.REFRESH_TOKEN,
              data
            );

            // Validate response
            if (!response || !response.data || !response.data.accessToken || !response.data.refreshToken) {
              throw new Error("Invalid token refresh response");
            }

            const tokenResponse: TokenResponse = response.data;

            // First remove old tokens from headers
            resetAuthHeaders();
            await dispatch(removeToken());

            // Then update with new tokens
            await dispatch(
              updateLocalAccessToken({
                accessToken: tokenResponse.accessToken,
                refreshToken: tokenResponse.refreshToken,
              })
            );

            // Update authorization header
            axiosClient.defaults.headers.common.Authorization = `Bearer ${tokenResponse.accessToken}`;
            
            // Process all queued requests with new token
            processQueue(null, tokenResponse.accessToken);

            // Retry the original request with new token
            isRefreshing = false;
            return axiosClient(originalConfig);
          } catch (error) {
            processQueue(error, null);
            dispatch(setIsLogout(true));
            isRefreshing = false;
            resetAuthHeaders();
            return Promise.reject(error);
          }
        } else {
          // If already refreshing, wait until refreshing is done and retry request
          return new Promise((resolve, reject) => {
            pendingRequests.push({ resolve, reject });
          })
            .then((token) => {
              // After token refresh is done, retry original request with new token
              originalConfig.headers.Authorization = `Bearer ${token as string}`;
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
