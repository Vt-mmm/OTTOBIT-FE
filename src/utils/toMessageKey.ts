import { EngMessageConstant } from "constants/EngMessageConstant";

const messageMap: Record<string, string> = {
  [EngMessageConstant.LoginSuccessfully]: "message.LoginSuccessfully",
  [EngMessageConstant.ResetPasswordSuccessfully]:
    "message.ResetPasswordSuccessfully",
  [EngMessageConstant.UpdateAccountSuccessfully]:
    "message.UpdateAccountSuccessfully",
  [EngMessageConstant.SentEmailConfirmationSuccessfully]:
    "message.SentEmailConfirmationSuccessfully",
  [EngMessageConstant.ConfirmedOTPCodeSuccessfully]:
    "message.ConfirmedOTPCodeSuccessfully",
};

/**
 * Chuyển đổi thông điệp thành công từ server sang i18n key
 * @param serverMessage - Thông điệp thành công từ server
 * @returns i18n key tương ứng
 */
export function toMessageKey(serverMessage: string): string {
  return messageMap[serverMessage] ?? "message.Success";
}
