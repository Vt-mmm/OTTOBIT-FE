// Utility functions to handle Firebase Storage URLs that are too long for backend

/**
 * Process Firebase URL to ensure it meets backend constraints
 * @param url Firebase Storage URL
 * @param maxLength Maximum allowed length (default 200)
 * @returns Processed URL that fits backend constraints
 */
export const processFirebaseUrl = (
  url: string | null | undefined,
  maxLength: number = 200
): string => {
  if (!url) return "";

  // If URL is within limits, return as is
  if (url.length <= maxLength) {
    return url;
  }

  console.warn(
    `Firebase URL exceeds ${maxLength} characters (${url.length}). Processing...`
  );

  // For Firebase URLs, we can try to optimize by removing unnecessary query parameters
  // while keeping the essential ones for access
  try {
    const urlObj = new URL(url);

    // Keep only essential Firebase Storage parameters
    const essentialParams = ["alt", "token"];
    const newSearchParams = new URLSearchParams();

    essentialParams.forEach((param) => {
      const value = urlObj.searchParams.get(param);
      if (value) {
        newSearchParams.set(param, value);
      }
    });

    urlObj.search = newSearchParams.toString();
    const optimizedUrl = urlObj.toString();

    // If still too long, truncate at safe point
    if (optimizedUrl.length > maxLength) {
      console.warn(
        `Even optimized URL is too long. Truncating to ${maxLength} characters.`
      );
      return optimizedUrl.substring(0, maxLength);
    }

    return optimizedUrl;
  } catch (error) {
    console.error("Error processing URL:", error);
    // Fallback: simple truncation
    return url.substring(0, maxLength);
  }
};

/**
 * Process avatar URL to ensure it meets backend constraints
 * @param url Firebase Storage URL
 * @param maxLength Maximum allowed length (default 200)
 * @returns Processed URL that fits backend constraints
 */
export const processAvatarUrl = (
  url: string | null | undefined,
  maxLength: number = 200
): string => {
  return processFirebaseUrl(url, maxLength);
};

/**
 * Process document path URL to ensure it meets backend constraints
 * @param url Firebase Storage URL for document
 * @param maxLength Maximum allowed length (default 200)
 * @returns Processed URL that fits backend constraints
 */
export const processDocumentPathUrl = (
  url: string | null | undefined,
  maxLength: number = 200
): string => {
  return processFirebaseUrl(url, maxLength);
};

/**
 * Process all Firebase URLs in document licenses (generic interface)
 * @param licenses Array of licenses that may contain DocumentPath URLs
 * @param maxLength Maximum allowed length for DocumentPath
 * @returns Processed licenses array
 */
export const processLicenseDocumentPaths = (
  licenses: any[],
  maxLength: number = 200
): any[] => {
  if (!licenses || !Array.isArray(licenses)) {
    return [];
  }

  return licenses.map((license) => ({
    ...license,
    documentPath: license.documentPath
      ? processDocumentPathUrl(license.documentPath, maxLength)
      : license.documentPath,
  }));
};

/**
 * Validate if the avatar URL will be accepted by backend
 * @param url Avatar URL to validate
 * @param maxLength Maximum allowed length
 * @returns Object with validation result and processed URL
 */
export const validateAvatarUrl = (
  url: string | null | undefined,
  maxLength: number = 200
) => {
  const processedUrl = processAvatarUrl(url, maxLength);

  return {
    isValid: processedUrl.length <= maxLength,
    processedUrl,
    originalLength: url?.length || 0,
    finalLength: processedUrl.length,
    wasTruncated: (url?.length || 0) > maxLength,
  };
};

/**
 * Validate if the document path URL will be accepted by backend
 * @param url Document path URL to validate
 * @param maxLength Maximum allowed length
 * @returns Object with validation result and processed URL
 */
export const validateDocumentPathUrl = (
  url: string | null | undefined,
  maxLength: number = 200
) => {
  const processedUrl = processDocumentPathUrl(url, maxLength);

  return {
    isValid: processedUrl.length <= maxLength,
    processedUrl,
    originalLength: url?.length || 0,
    finalLength: processedUrl.length,
    wasTruncated: (url?.length || 0) > maxLength,
  };
};

/**
 * Get a user-friendly error message for avatar URL issues
 * @param url Original URL
 * @param maxLength Maximum allowed length
 * @returns User-friendly error message
 */
export const getAvatarUrlErrorMessage = (
  url: string,
  maxLength: number = 200
): string => {
  if (url.length <= maxLength) {
    return "";
  }

  return `URL ảnh đại diện quá dài (${url.length}/${maxLength} ký tự). Hệ thống sẽ tự động tối ưu URL.`;
};

/**
 * Get a user-friendly error message for document path URL issues
 * @param url Original URL
 * @param maxLength Maximum allowed length
 * @returns User-friendly error message
 */
export const getDocumentPathUrlErrorMessage = (
  url: string,
  maxLength: number = 200
): string => {
  if (url.length <= maxLength) {
    return "";
  }

  return `URL tài liệu quá dài (${url.length}/${maxLength} ký tự). Hệ thống sẽ tự động tối ưu URL.`;
};
