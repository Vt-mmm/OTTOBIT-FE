/**
 * Error Handler Utility
 * Xử lý lỗi API và trả về thông báo lỗi chi tiết
 */

interface ApiErrorResponse {
  message?: string;
  errors?: string[];
  errorCode?: string;
  timestamp?: string;
}

/**
 * Extract detailed error message from API response
 * @param error - AxiosError or Error object
 * @param defaultMessage - Default message if no details found
 * @returns Formatted error message
 */
export function extractApiErrorMessage(
  error: any,
  defaultMessage: string = "Có lỗi xảy ra, vui lòng thử lại sau"
): string {
  // Check if it's an Axios error with response data
  if (error?.response?.data) {
    const apiError: ApiErrorResponse = error.response.data;

    // Priority 1: Check for detailed errors array
    if (
      apiError.errors &&
      Array.isArray(apiError.errors) &&
      apiError.errors.length > 0
    ) {
      // Join all error messages with line breaks
      return apiError.errors.join("\n");
    }

    // Priority 2: Use main message
    if (apiError.message) {
      return apiError.message;
    }
  }

  // Priority 3: Check direct error message
  if (error?.message) {
    return error.message;
  }

  // Priority 4: Use default message
  return defaultMessage;
}

/**
 * Extract error details for debugging
 * @param error - Error object
 * @returns Error details object
 */
export function extractErrorDetails(error: any) {
  return {
    message: error?.message,
    response: error?.response?.data,
    status: error?.response?.status,
    url: error?.config?.url,
    method: error?.config?.method,
  };
}
