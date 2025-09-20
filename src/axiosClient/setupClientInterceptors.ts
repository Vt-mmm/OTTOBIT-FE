import { AxiosResponse } from "axios";
// redux
import {
  removeToken,
  setIsLogout,
  updateLocalAccessToken,
} from "store/auth/authSlice";
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
        console.log("[Refresh Token] Received 401 error, starting token refresh", {
          url: originalConfig?.url,
          method: originalConfig?.method,
          isRefreshing,
        });
        
        // If we're not already refreshing
        if (!isRefreshing) {
          isRefreshing = true;
          originalConfig._retry = true;

          try {
            const accessToken = getAccessToken();
            const refreshToken = getRefreshToken();

            console.log("[Refresh Token] Starting token refresh process...");
            console.log("[Refresh Token] Has tokens:", {
              hasAccessToken: !!accessToken,
              hasRefreshToken: !!refreshToken,
            });

            if (!accessToken || !refreshToken) {
              console.error("[Refresh Token] Missing tokens");
              throw new Error("Missing tokens");
            }

            // Decode JWT to get userId (BE expects {userId, refreshToken})
            let userId: string;
            try {
              const payload = JSON.parse(atob(accessToken.split('.')[1]));
              userId = payload.sub; // 'sub' claim contains userId
              console.log("[Refresh Token] Decoded userId from JWT:", userId);
            } catch (decodeError) {
              console.error("[Refresh Token] Failed to decode JWT:", decodeError);
              throw new Error("Invalid access token format");
            }

            const data = {
              userId,
              refreshToken,
            };

            console.log("[Refresh Token] Making request to:", ROUTES_API_AUTH.REFRESH_TOKEN);
            console.log("[Refresh Token] Request data:", { userId: !!userId, hasRefreshToken: !!refreshToken });

            // Make token refresh request
            const response = await axiosClient.post(
              ROUTES_API_AUTH.REFRESH_TOKEN,
              data
            );

            console.log("[Refresh Token] Full response received:", response);
            console.log("[Refresh Token] Response status:", response?.status);
            console.log("[Refresh Token] Response data:", response?.data);
            
            // Now response is full AxiosResponse, so we need to check response.data
            const responseBody = response?.data;
            
            if (responseBody && responseBody.data) {
              console.log("[Refresh Token] API response body:", responseBody);
              console.log("[Refresh Token] User & tokens data:", responseBody.data);
              
              if (responseBody.data.tokens) {
                console.log("[Refresh Token] Found tokens:", responseBody.data.tokens);
              } else {
                console.log("[Refresh Token] No tokens in response");
              }
            } else {
              console.log("[Refresh Token] No data in response body");
            }

            // Validate response - now we have full AxiosResponse
            if (
              !response ||
              !response.data ||
              !response.data.data ||
              !response.data.data.tokens ||
              !response.data.data.tokens.accessToken ||
              !response.data.data.tokens.refreshToken
            ) {
              console.error("[Refresh Token] Validation failed:");
              console.error("[Refresh Token] - Has response:", !!response);
              console.error("[Refresh Token] - Has response.data:", !!(response && response.data));
              console.error("[Refresh Token] - Has response.data.data:", !!(response && response.data && response.data.data));
              console.error("[Refresh Token] - Has tokens:", !!(response && response.data && response.data.data && response.data.data.tokens));
              console.error("[Refresh Token] Full response:", JSON.stringify(response?.data, null, 2));
              throw new Error("Invalid token refresh response");
            }

            // Extract tokens from full response
            const tokenResponse: TokenResponse = {
              accessToken: response.data.data.tokens.accessToken,
              refreshToken: response.data.data.tokens.refreshToken,
            };
            
            console.log("[Refresh Token] Extracted tokens:", {
              hasAccessToken: !!tokenResponse.accessToken,
              hasRefreshToken: !!tokenResponse.refreshToken,
            });

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
            console.error("[Refresh Token] Token refresh failed:", {
              error: error instanceof Error ? error.message : error,
              stack: error instanceof Error ? error.stack : undefined,
            });
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
              originalConfig.headers.Authorization = `Bearer ${
                token as string
              }`;
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
