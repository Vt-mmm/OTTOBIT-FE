import { AxiosResponse } from "axios";
// redux
import {
  removeToken,
  setIsLogout,
  updateLocalAccessToken,
} from "reduxStore/auth/authSlice";
//
import { TokenResponse } from "common/models";
import { ROUTES_API_AUTH } from "constants/routesApiKeys";
import { getAccessToken, getRefreshToken } from "utils";
import {
  axiosClient,
  axiosFormData,
  resetAuthHeaders,
} from "axiosClient/axiosClient";
import { Store } from "@reduxjs/toolkit";

const setupAxiosFormData = (store: Store) => {
  axiosFormData.interceptors.request.use(
    async (config) => {
      const accessToken = getAccessToken();
      if (accessToken !== null) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  const { dispatch } = store;

  axiosFormData.interceptors.response.use(
    (response: AxiosResponse) => {
      return response.data;
    },
    async (err) => {
      const originalConfig = err.config;

      // Skip if it's a login request or related auth endpoints or already retried
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
      if (err.response?.status === 401 && !originalConfig._retry) {
        originalConfig._retry = true;

        try {
          const accessToken = getAccessToken();
          const refreshToken = getRefreshToken();

          if (!accessToken || !refreshToken) {
            dispatch(setIsLogout(true));
            resetAuthHeaders();
            return Promise.reject(new Error("Missing tokens"));
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
          if (
            !response ||
            !response.data ||
            !response.data.accessToken ||
            !response.data.refreshToken
          ) {
            throw new Error("Invalid token refresh response");
          }

          const tokenResponse: TokenResponse = response.data;

          // Remove old tokens
          resetAuthHeaders();
          await dispatch(removeToken());

          // Update with new tokens
          await dispatch(
            updateLocalAccessToken({
              accessToken: tokenResponse.accessToken,
              refreshToken: tokenResponse.refreshToken,
            })
          );

          // Set new auth header
          axiosFormData.defaults.headers.common.Authorization = `Bearer ${tokenResponse.accessToken}`;

          return axiosFormData(originalConfig);
        } catch (error) {
          dispatch(setIsLogout(true));
          resetAuthHeaders();
          return Promise.reject(error);
        }
      }

      return Promise.reject(err.response || err);
    }
  );
};

export default setupAxiosFormData;
