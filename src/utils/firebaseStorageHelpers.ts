/**
 * Utility functions for Firebase Storage operations
 */

/**
 * Extract filename from Firebase Storage URL
 */
export const extractFileNameFromUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const matches = pathname.match(/\/o\/(.+?)\?/);
    if (matches && matches[1]) {
      return decodeURIComponent(matches[1]);
    }
    return null;
  } catch (error) {
    console.error("Error extracting filename from URL:", error);
    return null;
  }
};

/**
 * Get folder path from filename
 */
export const getFolderFromFileName = (fileName: string): string => {
  const parts = fileName.split("/");
  if (parts.length > 1) {
    return parts.slice(0, -1).join("/");
  }
  return "avatars"; // default folder
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (fileName: string): string => {
  const extension = fileName.split(".").pop();
  return extension ? extension.toLowerCase() : "";
};

/**
 * Validate if file is an image
 */
export const isValidImageFile = (file: File): boolean => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  return allowedTypes.includes(file.type);
};

/**
 * Format file size to human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Generate a preview URL for file before upload
 */
export const generatePreviewUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

/**
 * Clean up preview URL to prevent memory leaks
 */
export const cleanupPreviewUrl = (url: string): void => {
  try {
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error cleaning up preview URL:", error);
  }
};
