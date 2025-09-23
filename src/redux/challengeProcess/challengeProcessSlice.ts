import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { axiosClient } from "axiosClient/axiosClient";
import { ROUTES_API_CHALLENGE_PROCESS } from "constants/routesApiKeys";
import {
  ChallengeProcessesResponse,
  GetChallengeProcessesRequest,
} from "common/@types/challengeProcess";

// API Response wrapper interface
interface ApiResponse<T> {
  message: string;
  data: T;
  errors?: string[] | null;
  errorCode?: string | null;
  timestamp?: string;
}

interface ErrorResponse {
  message: string;
  errors?: string[];
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

// Get my challenge processes
export const getMyChallengeProcessesThunk = createAsyncThunk<
  ChallengeProcessesResponse,
  GetChallengeProcessesRequest,
  { rejectValue: string }
>("challengeProcess/getMyChallenges", async (request, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get<ApiResponse<ChallengeProcessesResponse>>(
        ROUTES_API_CHALLENGE_PROCESS.MY_CHALLENGES,
        {
          params: request,
        }
      )
    );

    if (response.data.errors || response.data.errorCode) {
      throw new Error(response.data.message || "Failed to fetch challenge processes");
    }

    if (!response.data.data) {
      throw new Error("No challenge processes data received");
    }

    return response.data.data;
  } catch (error: any) {
    const err = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch challenge processes"
    );
  }
});

interface ChallengeProcessState {
  // My challenge processes
  myChallengeProcesses: {
    data: ChallengeProcessesResponse | null;
    isLoading: boolean;
    error: string | null;
    lastQuery: any;
  };
}

const initialState: ChallengeProcessState = {
  myChallengeProcesses: {
    data: null,
    isLoading: false,
    error: null,
    lastQuery: null,
  },
};

const challengeProcessSlice = createSlice({
  name: "challengeProcess",
  initialState,
  reducers: {
    // Clear challenge processes
    clearMyChallengeProcesses: (state) => {
      state.myChallengeProcesses.data = null;
      state.myChallengeProcesses.error = null;
      state.myChallengeProcesses.lastQuery = null;
    },

    // Clear errors
    clearChallengeProcessErrors: (state) => {
      state.myChallengeProcesses.error = null;
    },

    // Reset state
    resetChallengeProcessState: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get my challenge processes
      .addCase(getMyChallengeProcessesThunk.pending, (state, action) => {
        state.myChallengeProcesses.isLoading = true;
        state.myChallengeProcesses.error = null;
        state.myChallengeProcesses.lastQuery = action.meta.arg;
      })
      .addCase(getMyChallengeProcessesThunk.fulfilled, (state, action) => {
        state.myChallengeProcesses.isLoading = false;
        state.myChallengeProcesses.error = null;
        state.myChallengeProcesses.data = action.payload;
      })
      .addCase(getMyChallengeProcessesThunk.rejected, (state, action) => {
        state.myChallengeProcesses.isLoading = false;
        state.myChallengeProcesses.error = action.payload || "Failed to fetch challenge processes";
      });
  },
});

export const {
  clearMyChallengeProcesses,
  clearChallengeProcessErrors,
  resetChallengeProcessState,
} = challengeProcessSlice.actions;

// Export thunks
export {
  getMyChallengeProcessesThunk as getMyChallengeProcesses,
};

const challengeProcessReducer = challengeProcessSlice.reducer;
export default challengeProcessReducer;