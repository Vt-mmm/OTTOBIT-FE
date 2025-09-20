/**
 * FieldValidator - Validate và sanitize field input values
 * Prevent invalid states that cause UI persistence issues
 */

interface ValidationRule {
  type: 'required' | 'number' | 'range' | 'pattern' | 'custom';
  message?: string;
  min?: number;
  max?: number;
  pattern?: RegExp;
  validator?: (value: any) => boolean;
}

interface FieldValidationConfig {
  fieldName: string;
  blockType: string;
  rules: ValidationRule[];
  sanitizer?: (value: any) => any;
}

class FieldValidator {
  private validationConfigs: Map<string, FieldValidationConfig[]> = new Map();
  
  constructor() {
    this.setupDefaultValidations();
  }

  /**
   * Setup default validation rules for common block fields
   */
  private setupDefaultValidations(): void {
    // Movement block validations
    this.addValidationConfig('ottobit_move_forward', 'STEPS', [
      { type: 'required', message: 'Steps is required' },
      { type: 'number', message: 'Steps must be a number' },
      { type: 'range', min: 1, max: 100, message: 'Steps must be between 1 and 100' }
    ], (value) => {
      const num = parseInt(String(value), 10);
      return isNaN(num) ? 1 : Math.max(1, Math.min(100, num));
    });

    // Repeat block validations
    this.addValidationConfig('ottobit_repeat', 'TIMES', [
      { type: 'required', message: 'Times is required' },
      { type: 'number', message: 'Times must be a number' },
      { type: 'range', min: 1, max: 50, message: 'Times must be between 1 and 50' }
    ], (value) => {
      const num = parseInt(String(value), 10);
      return isNaN(num) ? 3 : Math.max(1, Math.min(50, num));
    });

    // Repeat range block validations
    this.addValidationConfig('ottobit_repeat_range', 'FROM', [
      { type: 'required', message: 'From value is required' },
      { type: 'number', message: 'From must be a number' },
      { type: 'range', min: 1, max: 1000, message: 'From must be between 1 and 1000' }
    ], (value) => {
      const num = parseInt(String(value), 10);
      return isNaN(num) ? 1 : Math.max(1, Math.min(1000, num));
    });

    this.addValidationConfig('ottobit_repeat_range', 'TO', [
      { type: 'required', message: 'To value is required' },
      { type: 'number', message: 'To must be a number' },
      { type: 'range', min: 1, max: 1000, message: 'To must be between 1 and 1000' }
    ], (value) => {
      const num = parseInt(String(value), 10);
      return isNaN(num) ? 5 : Math.max(1, Math.min(1000, num));
    });

    this.addValidationConfig('ottobit_repeat_range', 'BY', [
      { type: 'required', message: 'Step value is required' },
      { type: 'number', message: 'Step must be a number' },
      { type: 'range', min: 1, max: 100, message: 'Step must be between 1 and 100' }
    ], (value) => {
      const num = parseInt(String(value), 10);
      return isNaN(num) ? 1 : Math.max(1, Math.min(100, num));
    });

    // Collect block validations
    this.addValidationConfig('ottobit_collect_green', 'COUNT', [
      { type: 'required', message: 'Count is required' },
      { type: 'number', message: 'Count must be a number' },
      { type: 'range', min: 1, max: 10, message: 'Count must be between 1 and 10' }
    ], (value) => {
      const num = parseInt(String(value), 10);
      return isNaN(num) ? 1 : Math.max(1, Math.min(10, num));
    });

    this.addValidationConfig('ottobit_collect_red', 'COUNT', [
      { type: 'required', message: 'Count is required' },
      { type: 'number', message: 'Count must be a number' },
      { type: 'range', min: 1, max: 10, message: 'Count must be between 1 and 10' }
    ], (value) => {
      const num = parseInt(String(value), 10);
      return isNaN(num) ? 1 : Math.max(1, Math.min(10, num));
    });

    this.addValidationConfig('ottobit_collect_yellow', 'COUNT', [
      { type: 'required', message: 'Count is required' },
      { type: 'number', message: 'Count must be a number' },
      { type: 'range', min: 1, max: 10, message: 'Count must be between 1 and 10' }
    ], (value) => {
      const num = parseInt(String(value), 10);
      return isNaN(num) ? 1 : Math.max(1, Math.min(10, num));
    });

    // Function name validations
    this.addValidationConfig('ottobit_function_def', 'NAME', [
      { type: 'required', message: 'Function name is required' },
      { type: 'pattern', pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/, message: 'Invalid function name format' }
    ], (value) => {
      let sanitized = String(value).trim();
      // Remove invalid characters
      sanitized = sanitized.replace(/[^a-zA-Z0-9_]/g, '');
      // Ensure starts with letter or underscore
      if (!/^[a-zA-Z_]/.test(sanitized)) {
        sanitized = 'func_' + sanitized;
      }
      return sanitized || 'myFunction';
    });

    this.addValidationConfig('ottobit_function_call', 'NAME', [
      { type: 'required', message: 'Function name is required' },
      { type: 'pattern', pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/, message: 'Invalid function name format' }
    ], (value) => {
      let sanitized = String(value).trim();
      sanitized = sanitized.replace(/[^a-zA-Z0-9_]/g, '');
      if (!/^[a-zA-Z_]/.test(sanitized)) {
        sanitized = 'func_' + sanitized;
      }
      return sanitized || 'myFunction';
    });

    // Variable name validation for repeat range
    this.addValidationConfig('ottobit_repeat_range', 'VAR', [
      { type: 'required', message: 'Variable name is required' },
      { type: 'pattern', pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/, message: 'Invalid variable name format' }
    ], (value) => {
      let sanitized = String(value).trim();
      sanitized = sanitized.replace(/[^a-zA-Z0-9_]/g, '');
      if (!/^[a-zA-Z_]/.test(sanitized)) {
        sanitized = 'var_' + sanitized;
      }
      return sanitized || 'i';
    });
  }

  /**
   * Add validation configuration for a specific field
   */
  private addValidationConfig(
    blockType: string,
    fieldName: string,
    rules: ValidationRule[],
    sanitizer?: (value: any) => any
  ): void {
    const config: FieldValidationConfig = {
      fieldName,
      blockType,
      rules,
      sanitizer
    };

    if (!this.validationConfigs.has(blockType)) {
      this.validationConfigs.set(blockType, []);
    }

    this.validationConfigs.get(blockType)!.push(config);
  }

  /**
   * Validate field value
   */
  public validateField(blockType: string, fieldName: string, value: any): {
    isValid: boolean;
    errors: string[];
    sanitizedValue: any;
  } {
    const result = {
      isValid: true,
      errors: [] as string[],
      sanitizedValue: value
    };

    const configs = this.validationConfigs.get(blockType);
    if (!configs) {
      return result; // No validation rules for this block type
    }

    const config = configs.find(c => c.fieldName === fieldName);
    if (!config) {
      return result; // No validation rules for this field
    }

    // Apply sanitizer first
    if (config.sanitizer) {
      try {
        result.sanitizedValue = config.sanitizer(value);
      } catch (error) {
        result.errors.push(`Sanitization failed: ${error}`);
        result.isValid = false;
        return result;
      }
    }

    // Apply validation rules
    for (const rule of config.rules) {
      const validation = this.applyValidationRule(rule, result.sanitizedValue);
      if (!validation.isValid) {
        result.isValid = false;
        if (validation.error) {
          result.errors.push(validation.error);
        }
      }
    }

    return result;
  }

  /**
   * Apply single validation rule
   */
  private applyValidationRule(rule: ValidationRule, value: any): {
    isValid: boolean;
    error?: string;
  } {
    switch (rule.type) {
      case 'required':
        const isRequired = value !== null && value !== undefined && String(value).trim() !== '';
        return {
          isValid: isRequired,
          error: isRequired ? undefined : (rule.message || 'Field is required')
        };

      case 'number':
        const isNumber = !isNaN(Number(value)) && isFinite(Number(value));
        return {
          isValid: isNumber,
          error: isNumber ? undefined : (rule.message || 'Value must be a number')
        };

      case 'range':
        const num = Number(value);
        if (isNaN(num) || !isFinite(num)) {
          return { isValid: false, error: 'Value must be a number' };
        }
        const inRange = (rule.min === undefined || num >= rule.min) &&
                        (rule.max === undefined || num <= rule.max);
        return {
          isValid: inRange,
          error: inRange ? undefined : (rule.message || `Value must be between ${rule.min} and ${rule.max}`)
        };

      case 'pattern':
        if (!rule.pattern) {
          return { isValid: true };
        }
        const matches = rule.pattern.test(String(value));
        return {
          isValid: matches,
          error: matches ? undefined : (rule.message || 'Value format is invalid')
        };

      case 'custom':
        if (!rule.validator) {
          return { isValid: true };
        }
        try {
          const isValid = rule.validator(value);
          return {
            isValid,
            error: isValid ? undefined : (rule.message || 'Custom validation failed')
          };
        } catch (error) {
          return {
            isValid: false,
            error: `Custom validation error: ${error}`
          };
        }

      default:
        return { isValid: true };
    }
  }

  /**
   * Sanitize field value without full validation
   */
  public sanitizeField(blockType: string, fieldName: string, value: any): any {
    const configs = this.validationConfigs.get(blockType);
    if (!configs) {
      return value;
    }

    const config = configs.find(c => c.fieldName === fieldName);
    if (!config || !config.sanitizer) {
      return value;
    }

    try {
      return config.sanitizer(value);
    } catch (error) {
      console.warn(`[FieldValidator] Sanitization failed for ${blockType}.${fieldName}:`, error);
      return value;
    }
  }

  /**
   * Validate all fields in a block
   */
  public validateBlock(block: any): {
    isValid: boolean;
    fieldErrors: Record<string, string[]>;
    sanitizedValues: Record<string, any>;
  } {
    const result = {
      isValid: true,
      fieldErrors: {} as Record<string, string[]>,
      sanitizedValues: {} as Record<string, any>
    };

    if (!block || !block.type) {
      return result;
    }

    const configs = this.validationConfigs.get(block.type);
    if (!configs) {
      return result; // No validation rules for this block type
    }

    for (const config of configs) {
      try {
        const field = block.getField && block.getField(config.fieldName);
        if (!field) {
          continue; // Field doesn't exist on this block
        }

        const currentValue = field.getValue();
        const validation = this.validateField(block.type, config.fieldName, currentValue);

        if (!validation.isValid) {
          result.isValid = false;
          result.fieldErrors[config.fieldName] = validation.errors;
        }

        result.sanitizedValues[config.fieldName] = validation.sanitizedValue;

        // Apply sanitized value if different from current
        if (validation.sanitizedValue !== currentValue) {
          try {
            field.setValue(validation.sanitizedValue);
          } catch (error) {
            console.warn(`[FieldValidator] Failed to set sanitized value for ${config.fieldName}:`, error);
          }
        }
      } catch (error) {
        console.warn(`[FieldValidator] Error validating field ${config.fieldName}:`, error);
      }
    }

    return result;
  }

  /**
   * Get validation config for debugging
   */
  public getValidationConfig(blockType?: string): any {
    if (blockType) {
      return this.validationConfigs.get(blockType);
    }
    return Object.fromEntries(this.validationConfigs.entries());
  }
}

// Export singleton instance
export const fieldValidator = new FieldValidator();