import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { axiosClient } from "axiosClient/axiosClient";

// Local action creators
const setMessageSuccess = (message: string) => ({
  type: "image/setMessageSuccess",
  payload: message,
});

const setMessageError = (message: string) => ({
  type: "image/setMessageError",
  payload: message,
});
import { ROUTES_API_IMAGE } from "constants/routesApiKeys";
import {
  ImageResult,
  ImagesResponse,
  CreateImageRequest,
  UpdateImageRequest,
  GetImagesRequest,
} from "common/@types/image";
import { extractApiErrorMessage } from "utils/errorHandler";

// API Response wrapper interface
interface ApiResponse<T> {
  message: string;
  data: T;
  errors?: string[] | null;
  errorCode?: string | null;
  timestamp?: string;
}

// Helper function for API calls with retry logic
async function callApiWithRetry<T>(
  apiCall: () => Promise<T>,
  maxRetries = 2
): Promise<T> {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
      return await apiCall();
    } catch (error) {
      lastError = error;
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) {
        break;
      }
    }
  }
  throw lastError;
}

// Get images with pagination
export const getImagesThunk = createAsyncThunk<
  ImagesResponse,
  GetImagesRequest,
  { rejectValue: string }
>("image/getAll", async (request, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get<ApiResponse<ImagesResponse>>(ROUTES_API_IMAGE.GET_ALL, {
        params: request,
      })
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to fetch images"
      );
      throw new Error(errorMessage);
    }

    if (!response.data.data) {
      throw new Error("No images data received");
    }

    return response.data.data;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Failed to fetch images"
    );
    return rejectWithValue(errorMessage);
  }
});

// Get image by ID
export const getImageByIdThunk = createAsyncThunk<
  ImageResult,
  string,
  { rejectValue: string }
>("image/getById", async (id, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get<ApiResponse<ImageResult>>(
        ROUTES_API_IMAGE.GET_BY_ID(id)
      )
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to fetch image"
      );
      throw new Error(errorMessage);
    }

    if (!response.data.data) {
      throw new Error("No image data received");
    }

    return response.data.data;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Failed to fetch image"
    );
    return rejectWithValue(errorMessage);
  }
});

// Create image
export const createImageThunk = createAsyncThunk<
  ImageResult,
  CreateImageRequest,
  { rejectValue: string }
>("image/create", async (imageData, thunkAPI) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.post<ApiResponse<ImageResult>>(
        ROUTES_API_IMAGE.CREATE,
        imageData
      )
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to create image"
      );
      throw new Error(errorMessage);
    }

    if (!response.data.data) {
      throw new Error("No image data received");
    }

    // Success toast
    thunkAPI.dispatch(setMessageSuccess("Đã tạo ảnh thành công!"));

    return response.data.data;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Failed to create image"
    );

    // Error toast
    thunkAPI.dispatch(setMessageError(errorMessage));

    return thunkAPI.rejectWithValue(errorMessage);
  }
});

// Update image
export const updateImageThunk = createAsyncThunk<
  ImageResult,
  { id: string; data: UpdateImageRequest },
  { rejectValue: string }
>("image/update", async ({ id, data }, thunkAPI) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.put<ApiResponse<ImageResult>>(
        ROUTES_API_IMAGE.UPDATE(id),
        data
      )
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to update image"
      );
      throw new Error(errorMessage);
    }

    if (!response.data.data) {
      throw new Error("No image data received");
    }

    // Success toast
    thunkAPI.dispatch(setMessageSuccess("Đã cập nhật ảnh!"));

    return response.data.data;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Failed to update image"
    );

    // Error toast
    thunkAPI.dispatch(setMessageError(errorMessage));

    return thunkAPI.rejectWithValue(errorMessage);
  }
});

// Delete image
export const deleteImageThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("image/delete", async (id, thunkAPI) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.delete<ApiResponse<string>>(ROUTES_API_IMAGE.DELETE(id))
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to delete image"
      );
      throw new Error(errorMessage);
    }

    // Success toast
    thunkAPI.dispatch(setMessageSuccess("Đã xóa ảnh!"));

    return id;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Failed to delete image"
    );

    // Error toast
    thunkAPI.dispatch(setMessageError(errorMessage));

    return thunkAPI.rejectWithValue(errorMessage);
  }
});
