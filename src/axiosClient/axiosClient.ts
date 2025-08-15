import axios, { AxiosResponse } from "axios";
import { getAccessToken } from "utils";

// Set default configs
axios.defaults.headers.post["Access-Control-Allow-Origin"] = "*";
axios.defaults.headers.delete["Access-Control-Allow-Origin"] = "*";

// Create client with initial configuration
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_URL || "https://localhost:7093",
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

// Apply token if it exists during initialization - with more robust checking
const accessToken = getAccessToken();
if (accessToken) {
  axiosClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
}

const axiosServiceAddress = axios.create({
  baseURL: "https://vapi.vnappmob.com",
  headers: {
    "Content-Type": " application/json",
  },
});

const axiosFormData = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_URL || "https://be.tellme.io.vn/",
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

// Apply token to form data client as well
if (accessToken) {
  axiosFormData.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
}

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

// Basic request/response logging - actual interceptors are applied in setupClientInterceptors.ts
axiosClient.interceptors.request.use(
  function (config) {
    // Check for token on every request
    const currentToken = getAccessToken();
    if (currentToken) {
      const authHeader = config.headers.Authorization;
      // Check if Authorization is string type and doesn't contain the current token
      if (
        !authHeader ||
        (typeof authHeader === "string" && !authHeader.includes(currentToken))
      ) {
        config.headers.Authorization = `Bearer ${currentToken}`;
      }
    }

    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    return Promise.reject(error);
  }
);

export {
  axiosClient,
  axiosFormData,
  axiosServiceAddress,
  setHeaderAuth,
  resetAuthHeaders,
};
