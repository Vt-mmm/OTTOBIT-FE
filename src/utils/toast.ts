import { toast, ToastOptions } from "react-toastify";

const defaultOptions: ToastOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

export const showSuccessToast = (message: string, options?: ToastOptions) => {
  toast.success(message, { ...defaultOptions, ...options });
};

export const showErrorToast = (message: string, options?: ToastOptions) => {
  toast.error(message, { ...defaultOptions, ...options });
};

export const showInfoToast = (message: string, options?: ToastOptions) => {
  toast.info(message, { ...defaultOptions, ...options });
};

export const showWarningToast = (message: string, options?: ToastOptions) => {
  toast.warning(message, { ...defaultOptions, ...options });
};

/**
 * Parse error message from API response
 */
export const getErrorMessage = (error: any): string => {
  // Check if error has response.data.message
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  // Check if error has message property
  if (error?.message) {
    return error.message;
  }

  // Check if error is string
  if (typeof error === "string") {
    return error;
  }

  return "An unexpected error occurred";
};
