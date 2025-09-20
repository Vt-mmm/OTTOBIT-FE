/**
 * useFieldInputManager - Hook để expose FieldInputManager functions
 * Cho phép các component khác cleanup field inputs khi cần thiết
 */

import { useCallback, useEffect } from 'react';
import { fieldInputManager } from '../services/FieldInputManager';

export const useFieldInputManager = () => {
  /**
   * Force cleanup tất cả field inputs
   * Sử dụng khi navigate hoặc trước khi execute program
   */
  const forceCleanupFields = useCallback(() => {
    fieldInputManager.forceCleanupAll();
  }, []);

  /**
   * Get debug info về active fields
   */
  const getFieldDebugInfo = useCallback(() => {
    return fieldInputManager.getDebugInfo();
  }, []);

  /**
   * Cleanup khi component unmount
   */
  useEffect(() => {
    return () => {
      // Cleanup khi component bị unmount
      fieldInputManager.forceCleanupAll();
    };
  }, []);

  return {
    forceCleanupFields,
    getFieldDebugInfo,
  };
};

export default useFieldInputManager;