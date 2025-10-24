/**
 * Parse enrollment error from Redux format "errorCode:message"
 * Returns { errorCode, message } for use with Yup or UI display
 */
export interface ParsedEnrollmentError {
  errorCode?: string;
  message: string;
}

export function parseEnrollmentError(error: string): ParsedEnrollmentError {
  if (!error) {
    return {
      message: "Không thể đăng ký khóa học. Vui lòng thử lại.",
    };
  }

  // Format: "errorCode:message"
  const parts = error.split(":");
  if (parts.length >= 2 && parts[0].match(/^ENR_\d{3}$/)) {
    return {
      errorCode: parts[0],
      message: parts.slice(1).join(":"), // Rejoin in case message contains ":"
    };
  }

  // No error code - just return message
  return {
    message: error,
  };
}

/**
 * Get user-friendly message based on error code
 */
export function getEnrollmentErrorMessage(errorCode?: string, fallbackMessage?: string): string {
  if (!errorCode) {
    return fallbackMessage || "Không thể đăng ký khóa học. Vui lòng thử lại.";
  }

  const messageMap: Record<string, string> = {
    ENR_008: "Khóa học miễn phí này yêu cầu bạn phải có một robot được kích hoạt. Vui lòng mua hoặc kích hoạt một robot trước khi đăng ký.",
    ENR_001: "Hãy tạo hồ sơ sinh viên để đăng ký khóa học.",
    ENR_002: "Không tìm thấy khóa học. Khóa học có thể đã bị xóa.",
    ENR_003: "Bạn đã đăng ký khóa học này rồi.",
    ENR_004: "Khóa học hiện không có sẵn. Vui lòng thử lại sau.",
  };

  return messageMap[errorCode] || fallbackMessage || "Không thể đăng ký khóa học. Vui lòng thử lại.";
}

/**
 * Check if error requires robot activation
 */
export function isRobotActivationRequired(errorCode?: string): boolean {
  return errorCode === "ENR_008";
}
