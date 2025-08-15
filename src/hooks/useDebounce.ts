import { useState, useEffect } from "react";

/**
 * Hook tạo ra một giá trị bị trì hoãn sau một khoảng thời gian
 * @param value Giá trị cần debounce
 * @param delay Thời gian trì hoãn tính bằng milliseconds
 * @returns Giá trị đã được debounce
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Thiết lập timeout để cập nhật giá trị debounced
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup nếu giá trị hoặc delay thay đổi
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
