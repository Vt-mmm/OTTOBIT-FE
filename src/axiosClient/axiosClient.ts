import axios, { AxiosResponse } from "axios";

// Set default configs
axios.defaults.headers.post["Access-Control-Allow-Origin"] = "*";
axios.defaults.headers.delete["Access-Control-Allow-Origin"] = "*";

// Create client with initial configuration
const axiosClient = axios.create({
  baseURL:
    import.meta.env.VITE_APP_BASE_URL || "https://ottobit-be.felixtien.dev",
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Create a function to reset auth headers - important for logout
const resetAuthHeaders = () => {
  if (axiosClient && axiosClient.defaults && axiosClient.defaults.headers) {
    delete axiosClient.defaults.headers.common.Authorization;
  }

  if (
    axiosFormData &&
    axiosFormData.defaults &&
    axiosFormData.defaults.headers
  ) {
    delete axiosFormData.defaults.headers.common.Authorization;
  }
};

// NOTE: Authorization header is now set dynamically in setupClientInterceptors.ts
// This ensures proper handling of refresh token flow
// Do NOT set default Authorization header here during initialization

const axiosServiceAddress = axios.create({
  baseURL: "https://vapi.vnappmob.com",
  headers: {
    "Content-Type": " application/json",
  },
});

const axiosFormData = axios.create({
  baseURL:
    import.meta.env.VITE_APP_BASE_URL || "https://ottobit-be.felixtien.dev",
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

// NOTE: Authorization header for axiosFormData is also handled in setupFormDataInterceptors.ts
// Do NOT set default Authorization header here during initialization

const setHeaderAuth = (accessToken: string) => {
  // Ensure token is not empty before setting
  if (!accessToken) {
    console.warn("Attempted to set auth header with empty token");
    return;
  }

  // Set auth headers for all axios instances
  axiosClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  axiosFormData.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
};

axiosServiceAddress.interceptors.request.use(
  function (config) {
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

axiosServiceAddress.interceptors.response.use(
  function (response: AxiosResponse) {
    return response.data;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// NOTE: All interceptors (request/response) are handled in setupClientInterceptors.ts
// DO NOT add interceptors here to avoid conflicts with refresh token logic
// The only exception is axiosServiceAddress which is a separate client for external services

export {
  axiosClient,
  axiosFormData,
  axiosServiceAddress,
  setHeaderAuth,
  resetAuthHeaders,
};
