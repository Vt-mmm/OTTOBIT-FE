import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage, ensureFirebaseAuth } from "../../config/firebase";

export interface UploadAvatarResult {
  url: string;
  fileName: string;
}

export interface UploadAvatarOptions {
  userId: string;
  file: File;
  folder?: string;
  skipAuth?: boolean;
}

class FirebaseStorageService {
  private readonly AVATAR_FOLDER = "avatars";
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly ALLOWED_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  
  // Track ongoing uploads to prevent duplicates
  private ongoingUploads = new Set<string>();

  /**
   * Validate file before upload
   */
  private validateFile(file: File): void {
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error("File size must be less than 5MB");
    }

    if (!this.ALLOWED_TYPES.includes(file.type)) {
      throw new Error("File type must be JPEG, PNG, GIF, or WebP");
    }
  }

  /**
   * Generate unique filename for avatar
   */
  private generateFileName(userId: string, file: File): string {
    const timestamp = Date.now();
    const extension = file.name.split(".").pop();
    return `${userId}_${timestamp}.${extension}`;
  }

  /**
   * Upload avatar to Firebase Storage - WITH AUTH
   */
  async uploadAvatar({
    userId,
    file,
    folder,
  }: UploadAvatarOptions): Promise<UploadAvatarResult> {
    const uploadKey = `${userId}_${file.name}_${file.size}`;
    
    // Check if this exact upload is already in progress
    if (this.ongoingUploads.has(uploadKey)) {
      throw new Error("This file is already being uploaded. Please wait...");
    }

    try {
      // Mark this upload as ongoing
      this.ongoingUploads.add(uploadKey);
      
      // Ensure Firebase authentication before upload
      try {
        await ensureFirebaseAuth();
      } catch (authError) {
        throw new Error("Authentication required for file upload");
      }
      
      // Validate file
      this.validateFile(file);

      // Generate filename
      const fileName = this.generateFileName(userId, file);

      // Create storage reference
      const folderPath = folder || this.AVATAR_FOLDER;
      const storageRef = ref(storage, `${folderPath}/${fileName}`);

      // Upload file with auth and retry logic
      let uploadAttempt = 0;
      const maxRetries = 3;
      
      while (uploadAttempt < maxRetries) {
        try {
          const snapshot = await uploadBytes(storageRef, file);
          
          // Get download URL
          const downloadURL = await getDownloadURL(snapshot.ref);

          return {
            url: downloadURL,
            fileName: fileName,
          };
        } catch (uploadError: any) {
          uploadAttempt++;
          
          // Specific error handling for 412
          if (uploadError.code === 'storage/unknown' && uploadError.message?.includes('412')) {
            throw new Error("Upload conflict detected. Please try again in a moment.");
          }
          
          if (uploadAttempt >= maxRetries) {
            throw uploadError;
          }
          
          // Wait before retry (exponential backoff)
          const waitTime = Math.pow(2, uploadAttempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
      
      // This should never be reached due to the throw above, but TypeScript needs it
      throw new Error("Upload failed after maximum retries");
    } catch (error: any) {
      throw new Error(`Upload failed: ${error.message || error.code || "Unknown error"}`);
    } finally {
      // Always remove from ongoing uploads
      this.ongoingUploads.delete(uploadKey);
    }
  }

  /**
   * Delete avatar from Firebase Storage - NO AUTH
   */
  async deleteAvatar(fileName: string, folder?: string): Promise<void> {
    try {
      const folderPath = folder || this.AVATAR_FOLDER;
      const storageRef = ref(storage, `${folderPath}/${fileName}`);
      await deleteObject(storageRef);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get avatar URL by filename
   */
  async getAvatarUrl(fileName: string, folder?: string): Promise<string> {
    try {
      const folderPath = folder || this.AVATAR_FOLDER;
      const storageRef = ref(storage, `${folderPath}/${fileName}`);
      return await getDownloadURL(storageRef);
    } catch (error) {
      throw error;
    }
  }
}

export const firebaseStorageService = new FirebaseStorageService();

// Convenience functions for easy import
export const uploadFileToFirebaseStorage = async (
  file: File,
  filePath: string
): Promise<string> => {
  try {
    // Create storage reference with full path
    const storageRef = ref(storage, filePath);

    // Upload file
    const snapshot = await uploadBytes(storageRef, file);

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    throw error;
  }
};

export const deleteFileFromFirebaseStorage = async (
  fileUrl: string
): Promise<void> => {
  try {
    // Extract file path from Firebase URL
    // Firebase Storage URL format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?{params}
    if (!fileUrl.includes("firebasestorage.googleapis.com")) {
      return;
    }

    const url = new URL(fileUrl);
    const pathMatch = url.pathname.match(/\/o\/(.+)$/);

    if (!pathMatch) {
      throw new Error("Could not extract file path from Firebase URL");
    }

    const encodedPath = pathMatch[1];
    const filePath = decodeURIComponent(encodedPath);

    // Create storage reference
    const storageRef = ref(storage, filePath);

    // Delete file
    await deleteObject(storageRef);
  } catch (error) {
    // Don't throw error if file doesn't exist
    if (error instanceof Error && error.message.includes("not found")) {
      return;
    }
    throw error;
  }
};
