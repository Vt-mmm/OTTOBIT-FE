/**
 * Ottobit Function Blocks - Sử dụng procedures chuẩn của Blockly
 * Chúng ta sẽ sử dụng procedures_defnoreturn và procedures_callnoreturn có sẵn
 */

// Import procedures blocks từ Blockly (nếu cần)
// Blockly tự động đăng ký procedures blocks khi được import

// Chúng ta chỉ cần export empty object vì procedures blocks đã có sẵn
export const functionBlocks: { [key: string]: any } = {};

/**
 * All function block definitions - sử dụng procedures có sẵn
 */
export const blocks = functionBlocks;

/**
 * Function để khởi tạo procedures blocks nếu cần
 */
export function initializeProcedures() {
  // Procedures blocks được tự động đăng ký bởi Blockly
  // Chúng ta có thể customize chúng ở đây nếu cần
  console.log('📦 Procedures blocks initialized');
}
