import { TextField, TextFieldProps } from "@mui/material";
import { useState, useEffect } from "react";

interface NumberInputProps
  extends Omit<TextFieldProps, "type" | "onChange" | "value"> {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
  allowEmpty?: boolean;
}

/**
 * NumberInput component with proper handling of empty state and delete key
 *
 * Features:
 * - Allows typing including delete/backspace to clear the field
 * - Converts to number properly (not fallback to default during typing)
 * - Sets default value on blur if field is empty or invalid
 * - Prevents invalid values (below min, above max)
 * - Auto-selects "0" value on focus for better UX
 * - Removes leading zeros automatically
 *
 * @example
 * <NumberInput
 *   label="Quantity"
 *   value={quantity}
 *   onChange={setQuantity}
 *   min={1}
 *   max={100}
 *   defaultValue={1}
 * />
 */
export default function NumberInput({
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  defaultValue,
  allowEmpty = false,
  onFocus,
  onBlur,
  ...textFieldProps
}: NumberInputProps) {
  const [displayValue, setDisplayValue] = useState<string>(value.toString());

  // Sync with external value changes
  useEffect(() => {
    if (value !== parseFloat(displayValue)) {
      setDisplayValue(value.toString());
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Allow empty string for better UX (can delete all)
    if (inputValue === "" || inputValue === "-") {
      setDisplayValue(inputValue);
      return;
    }

    // Parse the number
    const numValue = parseFloat(inputValue);

    // Allow typing even if incomplete number (e.g., "1.", "12")
    if (!isNaN(numValue)) {
      // Remove leading zeros (except for "0" itself or "0." or "0.x")
      let cleanValue = inputValue;

      // If user types after a leading zero (like "01", "012"), remove the zero
      if (
        inputValue.length > 1 &&
        inputValue.startsWith("0") &&
        inputValue[1] !== "."
      ) {
        cleanValue = inputValue.replace(/^0+/, "") || "0";
      }

      setDisplayValue(cleanValue);

      // Update parent with the parsed number
      const parsedClean = parseFloat(cleanValue);
      if (!isNaN(parsedClean)) {
        onChange(parsedClean);
      }
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Auto-select all text when focus for easy replacement
    setTimeout(() => {
      e.target.select();
    }, 0);

    // Call parent onFocus if provided
    if (onFocus) {
      onFocus(e);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const numValue = parseFloat(displayValue);

    // If empty or invalid, use default or min value
    if (displayValue === "" || displayValue === "-" || isNaN(numValue)) {
      const fallbackValue = defaultValue !== undefined ? defaultValue : min;
      setDisplayValue(fallbackValue.toString());
      onChange(fallbackValue);

      // Call parent onBlur if provided
      if (onBlur) {
        onBlur(e);
      }
      return;
    }

    // Apply min/max constraints on blur
    let constrainedValue = numValue;
    if (min !== undefined && numValue < min) {
      constrainedValue = min;
    }
    if (max !== undefined && numValue > max) {
      constrainedValue = max;
    }

    // Update display and parent value
    setDisplayValue(constrainedValue.toString());
    onChange(constrainedValue);

    // Call parent onBlur if provided
    if (onBlur) {
      onBlur(e);
    }
  };

  return (
    <TextField
      {...textFieldProps}
      type="number"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      inputProps={{
        min,
        max,
        step,
        ...textFieldProps.inputProps,
      }}
    />
  );
}
