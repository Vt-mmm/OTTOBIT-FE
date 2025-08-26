// Resend Email API Types
export interface ResendEmailConfirmationRequest {
  email: string;
}

export interface ResendEmailConfirmationResponse {
  message: string;
  success: boolean;
}
