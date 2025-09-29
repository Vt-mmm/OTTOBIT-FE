import { useState, useCallback } from "react";
import {
  firebaseStorageService,
  UploadAvatarOptions,
  UploadAvatarResult,
} from "../services/firebase/firebaseStorageService";
import { toast } from "react-toastify";

export interface UseFirebaseStorageReturn {
  uploading: boolean;
  uploadProgress: number;
  uploadAvatar: (
    options: UploadAvatarOptions
  ) => Promise<UploadAvatarResult | null>;
  deleteAvatar: (
    fileName: string,
    folder?: string,
    userId?: string
  ) => Promise<boolean>;
  error: string | null;
}

export const useFirebaseStorage = (): UseFirebaseStorageReturn => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadAvatar = useCallback(
    async (
      options: UploadAvatarOptions
    ): Promise<UploadAvatarResult | null> => {
      // Prevent duplicate uploads
      if (uploading) {
        toast.warning("Upload already in progress, please wait...");
        return null;
      }

      try {
        setUploading(true);
        setError(null);
        setUploadProgress(0);

        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return prev + 10;
          });
        }, 200);

        const result = await firebaseStorageService.uploadAvatar(options);

        clearInterval(progressInterval);
        setUploadProgress(100);

        toast.success("Avatar uploaded successfully!");
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to upload avatar";
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setUploading(false);
        setTimeout(() => {
          setUploadProgress(0);
        }, 1000);
      }
    },
    [uploading] // Add uploading as dependency to prevent stale closures
  );

  const deleteAvatar = useCallback(
    async (
      fileName: string,
      folder?: string,
      _userId?: string
    ): Promise<boolean> => {
      try {
        setError(null);
        await firebaseStorageService.deleteAvatar(fileName, folder);
        toast.success("Avatar deleted successfully!");
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete avatar";
        setError(errorMessage);
        toast.error(errorMessage);
        return false;
      }
    },
    []
  );

  return {
    uploading,
    uploadProgress,
    uploadAvatar,
    deleteAvatar,
    error,
  };
};
