// src/theme/block/renderer-ottobit.ts - Minimal CSS injection cho field styling

/**
 * Inject minimal CSS cho field styling - Approach đơn giản nhất
 */
export function injectOttobitkFieldStyles(): void {
  const style = document.createElement("style");
  style.textContent = `
    /* Flyout background - TRẮNG để thấy rõ blocks */
    .blocklyFlyout {
      background-color: #FFFFFF !important;
    }
    
    .blocklyFlyoutBackground {
      fill: #FFFFFF !important;
      stroke: #E0E0E0 !important;
      stroke-width: 1px !important;
    }
    
    /* Toolbox background */
    .blocklyToolboxDiv {
      background-color: #E8F4FD !important;
      border-right: 2px solid #E0E0E0 !important;
    }
    
    /* Field styling - Fixed sizing for input fields */
    .blocklyFieldNumber rect,
    .blocklyFieldTextInput rect,
    .blocklyFieldDropdown rect {
      fill: rgba(255, 255, 255, 0.9) !important;
      stroke: rgba(0, 0, 0, 0.2) !important;
      stroke-width: 1px !important;
      rx: 4px !important;
      ry: 4px !important;
      width: auto !important;
      height: 24px !important; /* Fixed height to prevent overflow */
      max-width: 60px !important; /* Prevent field from becoming too wide */
    }
    
    .blocklyFieldNumber text,
    .blocklyFieldTextInput text,
    .blocklyFieldDropdown text {
      fill: #333333 !important;
      font-weight: 600 !important;
      font-size: 14px !important; /* Smaller font to fit properly */
      font-family: 'Roboto', 'Arial', sans-serif !important;
      dominant-baseline: middle !important;
      text-anchor: middle !important;
    }
    
    /* Specific fixes for number fields to prevent screen overflow */
    .blocklyFieldNumber {
      max-width: 60px !important;
      min-width: 30px !important;
      text-align: center !important;
    }
    
    .blocklyFieldNumber input {
      font-size: 14px !important;
      font-weight: 600 !important;
      text-align: center !important;
      width: 40px !important;
      max-width: 60px !important;
      padding: 2px 4px !important;
      border: 1px solid #ccc !important;
      border-radius: 4px !important;
      background: white !important;
    }
    
    /* Block corners - vuông vức hơn */
    .blocklyPath {
      rx: 4px !important;
      ry: 4px !important;
    }
    
    /* Enhanced hover and focus states - prevent field expansion */
    *:hover .blocklyFieldNumber text,
    *:hover .blocklyFieldTextInput text,
    *:hover .blocklyFieldDropdown text {
      fill: #333333 !important;
    }
    
    /* Hover state for field rectangles - don't change size */
    *:hover .blocklyFieldNumber rect,
    *:hover .blocklyFieldTextInput rect,
    *:hover .blocklyFieldDropdown rect {
      height: 24px !important;
      max-width: 60px !important;
      stroke: rgba(0, 0, 0, 0.4) !important;
    }
    
    /* Focus states for input fields - with selection control */
    .blocklyFieldNumber input:focus,
    .blocklyFieldTextInput input:focus {
      font-size: 14px !important;
      width: 40px !important;
      max-width: 60px !important;
      outline: 2px solid #2196F3 !important;
      outline-offset: -1px !important;
      border: 1px solid #2196F3 !important;
      /* Allow text selection but control it */
      user-select: text !important;
      -webkit-user-select: text !important;
      -moz-user-select: text !important;
    }
    
    /* Selection styling for field inputs */
    .blocklyFieldNumber input::selection,
    .blocklyFieldTextInput input::selection {
      background: #2196F3 !important;
      color: white !important;
    }
    
    /* Prevent field editor from expanding beyond bounds */
    .blocklyFieldTextInputEditor,
    .blocklyFieldNumberEditor {
      max-width: 60px !important;
      width: 40px !important;
      font-size: 14px !important;
      text-align: center !important;
      padding: 2px 4px !important;
      border-radius: 4px !important;
      box-sizing: border-box !important;
    }
    
    /* Block text - PHÂN BIỆT THEO MÀU BLOCK với màu mới */
    /* Text trắng cho blocks tối (xanh đậm, tím) */
    g[data-style="ottobit_motion"] .blocklyText,
    g[data-style="ottobit_movement"] .blocklyText,
    g[data-style="ottobit_action"] .blocklyText,
    g[data-style="ottobit_sensor"] .blocklyText,
    g[data-style="ottobit_math"] .blocklyText {
      fill: #FFFFFF !important;
      font-weight: 700 !important;
      font-size: 16px !important;
    }
    
    /* Text đen cho blocks sáng (cam, vàng) */
    g[data-style="ottobit_control"] .blocklyText,
    g[data-style="ottobit_event"] .blocklyText {
      fill: #000000 !important;
      font-weight: 700 !important;
      font-size: 16px !important;
    }
    
    /* Text trắng cho logic blocks (tím) */
    g[data-style="ottobit_logic"] .blocklyText,
    g[data-style="ottobit_control_blue"] .blocklyText {
      fill: #FFFFFF !important;
      font-weight: 700 !important;
      font-size: 16px !important;
    }
    
    /* Fallback cho blocks khác */
    .blocklyText {
      font-weight: 700 !important;
      font-size: 16px !important;
    }
    
    /* Đảm bảo blocks có màu đúng - không bị đen */
    .blocklyDraggable .blocklyPath {
      opacity: 1 !important;
    }
    
    /* FORCE màu blocks theo theme - màu mới dễ nhìn hơn */
    g[data-style="ottobit_event"] .blocklyPath {
      fill: #F4C430 !important; /* Vàng cho event */
      stroke: #E6B800 !important;
      stroke-width: 2px !important;
    }
    
    g[data-style="ottobit_motion"] .blocklyPath,
    g[data-style="ottobit_movement"] .blocklyPath {
      fill: #2C3E50 !important; /* Xanh đậm cho motion */
      stroke: #1B2631 !important;
      stroke-width: 2px !important;
    }
    
    g[data-style="ottobit_action"] .blocklyPath {
      fill: #2E86AB !important; /* Xanh cho action */
      stroke: #1F5F7A !important;
      stroke-width: 2px !important;
    }
    
    g[data-style="ottobit_control"] .blocklyPath {
      fill: #FF8C00 !important; /* Cam cho control */
      stroke: #E07B00 !important;
      stroke-width: 2px !important;
    }
    
    g[data-style="ottobit_sensor"] .blocklyPath {
      fill: #8E44AD !important; /* Tím cho sensor */
      stroke: #6C3483 !important;
      stroke-width: 2px !important;
    }
    
    g[data-style="ottobit_math"] .blocklyPath {
      fill: #2C3E50 !important; /* Xanh đậm cho math */
      stroke: #1B2631 !important;
      stroke-width: 2px !important;
    }
    
    g[data-style="ottobit_logic"] .blocklyPath {
      fill: #9C27B0 !important; /* Tím cho logic blocks */
      stroke: #7B1FA2 !important;
      stroke-width: 2px !important;
    }
    
    g[data-style="ottobit_control_blue"] .blocklyPath {
      fill: #2196F3 !important; /* Xanh dương cho IF blocks */
      stroke: #1976D2 !important;
      stroke-width: 2px !important;
    }
    
    /* Fallback cho blocks không có style cụ thể */
    .blocklyDraggable .blocklyPath {
      opacity: 1 !important;
      stroke-width: 2px !important;
    }
    
    /* Đảm bảo blocks không bị CSS default override */
    .blocklyBlockBackground {
      opacity: 1 !important;
    }
    
    /* Category labels styling */
    .blocklyTreeLabel {
      font-weight: 600 !important;
      color: #2C3E50 !important;
    }
    
    /* CRITICAL: Fix for field editor leaking and staying on screen */
    .blocklyFieldTextInputEditor,
    .blocklyFieldNumberEditor,
    .blocklyFieldDropdownEditor {
      position: absolute !important;
      z-index: 9999 !important;
      max-width: 60px !important;
      min-width: 30px !important;
      width: 40px !important;
      height: 24px !important;
      font-size: 14px !important;
      font-weight: 600 !important;
      text-align: center !important;
      padding: 2px 4px !important;
      border: 1px solid #2196F3 !important;
      border-radius: 4px !important;
      background: white !important;
      box-sizing: border-box !important;
      /* Prevent the editor from becoming permanent */
      pointer-events: auto !important;
      display: block !important;
      overflow: hidden !important;
    }
    
    /* Hide field editors when not in use */
    .blocklyFieldTextInputEditor:not(:focus),
    .blocklyFieldNumberEditor:not(:focus) {
      display: none !important;
    }
    
    /* Emergency fix: Hide any orphaned input elements */
    body > input[type="text"],
    body > input[type="number"],
    html > input[type="text"],
    html > input[type="number"] {
      display: none !important;
    }
    
    /* Specific fix for Blockly field editors that get detached */
    input[style*="position: absolute"][style*="font-size"] {
      max-width: 60px !important;
      width: 40px !important;
      height: 24px !important;
      font-size: 14px !important;
      z-index: 9999 !important;
    }
    
    /* Global constraint to prevent any input from taking over screen */
    input {
      max-width: 200px !important;
      max-height: 50px !important;
    }
    
    /* EMERGENCY: Prevent any input from covering UI modals */
    input {
      z-index: 9999 !important; /* Below modals */
    }
    
    /* Ensure modals are always above everything */
    .MuiDialog-root,
    .MuiModal-root,
    .MuiPopover-root {
      z-index: 10000 !important; /* Above field editors */
    }
    
    /* Emergency fix for any leaked absolute positioned elements */
    body > *[style*="position: absolute"],
    html > *[style*="position: absolute"] {
      max-width: 200px !important;
      max-height: 50px !important;
      z-index: 9999 !important;
    }
    
    /* Hide any suspicious elements that might be covering UI */
    *[style*="font-size"][style*="position: absolute"]:not(.MuiDialog-root):not(.MuiModal-root):not(.MuiPopover-root) {
      max-width: 100px !important;
      max-height: 30px !important;
      pointer-events: none !important;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Remove injected styles nếu cần
 */
export function removeOttobitkFieldStyles(): void {
  const styles = document.querySelectorAll("style");
  styles.forEach((style) => {
    if (style.textContent?.includes("blocklyFieldNumber")) {
      style.remove();
    }
  });
}

/**
 * Force refresh block colors - gọi sau khi workspace được tạo
 */
export function refreshBlockColors(): void {
  // Force re-render tất cả blocks để apply màu
  setTimeout(() => {
    const blocks = document.querySelectorAll(".blocklyDraggable");
    blocks.forEach((block) => {
      const style = block.getAttribute("data-style");
      if (style) {
        // Trigger re-render bằng cách toggle class
        block.classList.remove("blocklyDraggable");
        block.classList.add("blocklyDraggable");
      }
    });
  }, 100);
}

/**
 * CRITICAL: Cleanup orphaned field editors that leak to other pages
 */
export function cleanupOrphanedFieldEditors(): void {
  try {
    // IMMEDIATE: Clear any text selections first
    window.getSelection()?.removeAllRanges();
    
    // IMMEDIATE: Blur any active field editors
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && 
        (activeElement.className.includes('blockly') || 
         activeElement.style.position === 'absolute' ||
         activeElement.tagName === 'INPUT')) {
      activeElement.blur();
    }
    
    // Remove any input elements that are positioned absolutely and might be field editors
    const suspiciousInputs = document.querySelectorAll('input[style*="position: absolute"]');
    suspiciousInputs.forEach((input) => {
      const inputEl = input as HTMLElement;
      // If it has field editor characteristics, remove it
      if (inputEl.style.fontSize || inputEl.className.includes('blockly')) {
        console.warn('Removing orphaned field editor:', input);
        input.remove();
      }
    });
    
    // Remove ANY input that might be a field editor
    const allSuspiciousInputs = document.querySelectorAll('input');
    allSuspiciousInputs.forEach((input) => {
      const inputEl = input as HTMLElement;
      const computedStyle = window.getComputedStyle(inputEl);
      
      // Check if it's a detached Blockly field editor
      if (computedStyle.position === 'absolute' && 
          (inputEl.style.fontSize || 
           computedStyle.fontSize.includes('px') ||
           inputEl.className.includes('blockly') ||
           !inputEl.closest('.blocklyWorkspace'))) {
        
        // Extra check: if it's outside normal form context, it's probably orphaned
        if (!inputEl.closest('form') && 
            !inputEl.closest('.blocklyWorkspace') && 
            !inputEl.closest('.blocklyFlyout')) {
          console.warn('Removing suspicious orphaned input:', input);
          input.remove();
        }
      }
    });
    
    // Remove any input elements directly attached to body or html
    const bodyInputs = document.querySelectorAll('body > input, html > input');
    bodyInputs.forEach((input) => {
      console.warn('Removing orphaned body input:', input);
      input.remove();
    });
    
    // Remove any elements with field editor classes that are not inside Blockly workspace
    const orphanedEditors = document.querySelectorAll('.blocklyFieldTextInputEditor, .blocklyFieldNumberEditor, .blocklyFieldDropdownEditor');
    orphanedEditors.forEach((editor) => {
      if (!editor.closest('.blocklyWorkspace') && !editor.closest('.blocklyFlyout')) {
        console.warn('Removing orphaned field editor:', editor);
        editor.remove();
      }
    });
  } catch (error) {
    console.warn('Error cleaning up orphaned field editors:', error);
  }
}

/**
 * EMERGENCY: Force cleanup all field editors and selections - use before execute
 */
export function forceCleanupBeforeExecute(): void {
  try {
    console.log('🚨 Emergency cleanup before execute');
    
    // 1. Clear ALL text selections immediately
    window.getSelection()?.removeAllRanges();
    
    // 2. Blur ALL active elements
    if (document.activeElement && document.activeElement !== document.body) {
      (document.activeElement as HTMLElement).blur();
    }
    
    // 3. Remove ALL suspicious inputs
    const allInputs = document.querySelectorAll('input');
    allInputs.forEach((input) => {
      const inputEl = input as HTMLElement;
      const rect = inputEl.getBoundingClientRect();
      
      // If input is positioned absolutely and not in a normal form
      if (window.getComputedStyle(inputEl).position === 'absolute' &&
          !inputEl.closest('form') &&
          !inputEl.closest('.MuiDialog-root') && // Don't remove dialog inputs
          !inputEl.closest('.MuiPopover-root')) { // Don't remove popover inputs
        
        console.warn('🚨 Emergency removing input before execute:', input);
        input.remove();
      }
      
      // Also remove if it's taking up too much space (likely a leaked editor)
      if (rect.width > 100 || rect.height > 50) {
        if (!inputEl.closest('form') && 
            !inputEl.closest('.MuiDialog-root') &&
            !inputEl.closest('.MuiPopover-root')) {
          console.warn('🚨 Emergency removing oversized input:', input);
          input.remove();
        }
      }
    });
    
    // 4. Run normal cleanup
    cleanupOrphanedFieldEditors();
    
  } catch (error) {
    console.warn('Error in emergency cleanup:', error);
  }
}

/**
 * Handle field selection to prevent editor from sticking
 */
export function handleFieldSelection(): void {
  // Monitor all input elements in Blockly for selection events
  document.addEventListener('selectionchange', () => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      // Find if selection is in a Blockly field editor
      const activeElement = document.activeElement as HTMLInputElement;
      if (activeElement && 
          ((typeof activeElement.className === 'string' && activeElement.className.includes('blockly')) || 
           activeElement.style.position === 'absolute')) {
        
        // Allow selection but setup cleanup when it ends
        setTimeout(() => {
          if (document.activeElement !== activeElement) {
            // Field is no longer active, clear selection and cleanup
            window.getSelection()?.removeAllRanges();
            cleanupOrphanedFieldEditors();
          }
        }, 100);
      }
    }
  });
  
  // Handle blur events on field editors
  document.addEventListener('blur', (event) => {
    const target = event.target as HTMLInputElement;
    if (target && 
        ((typeof target.className === 'string' && target.className.includes('blockly')) || 
         target.style.position === 'absolute')) {
      
      // Clear any text selection when field editor loses focus
      setTimeout(() => {
        window.getSelection()?.removeAllRanges();
        cleanupOrphanedFieldEditors();
      }, 50);
    }
  }, true);
  
  // Handle Enter, Escape, and Ctrl+A in field editors
  document.addEventListener('keydown', (event) => {
    const target = event.target as HTMLInputElement;
    if (target && 
        ((typeof target.className === 'string' && target.className.includes('blockly')) || 
         target.style.position === 'absolute')) {
      
      // Handle Ctrl+A (Select All)
      if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
        // Allow Ctrl+A to work normally, but setup cleanup when done
        setTimeout(() => {
          // Check if user is still editing
          if (document.activeElement === target) {
            // Still editing - setup cleanup for later
            const cleanupOnNextBlur = () => {
              setTimeout(() => {
                window.getSelection()?.removeAllRanges();
                cleanupOrphanedFieldEditors();
              }, 50);
              target.removeEventListener('blur', cleanupOnNextBlur);
            };
            target.addEventListener('blur', cleanupOnNextBlur, { once: true });
          }
        }, 10);
      }
      
      // Handle Enter and Escape
      else if (event.key === 'Enter' || event.key === 'Escape') {
        // Clear selection and blur the field
        setTimeout(() => {
          target.blur();
          window.getSelection()?.removeAllRanges();
          cleanupOrphanedFieldEditors();
        }, 10);
      }
    }
  });
  
  // Additional cleanup when user finishes editing (mouse click away)
  document.addEventListener('mousedown', (event) => {
    const target = event.target as HTMLElement;
    
    // If clicking outside any Blockly field editor
    if (!target.closest('.blocklyFieldNumber') && 
        !target.closest('.blocklyFieldTextInput') && 
        !(typeof target.className === 'string' && target.className.includes('blockly'))) {
      
      // Clear any text selections
      setTimeout(() => {
        window.getSelection()?.removeAllRanges();
        cleanupOrphanedFieldEditors();
      }, 50);
    }
  });
}

/**
 * Setup global cleanup interval to prevent field editor leaks
 */
export function setupFieldEditorCleanup(): void {
  // Setup selection handling
  handleFieldSelection();
  
  // Run cleanup every 3 seconds (more frequent)
  setInterval(cleanupOrphanedFieldEditors, 3000);
  
  // Also run cleanup when page visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      window.getSelection()?.removeAllRanges(); // Clear any selections
      cleanupOrphanedFieldEditors();
    }
  });
  
  // Run cleanup when navigating (for SPAs)
  window.addEventListener('beforeunload', () => {
    window.getSelection()?.removeAllRanges();
    cleanupOrphanedFieldEditors();
  });
  
  window.addEventListener('hashchange', () => {
    window.getSelection()?.removeAllRanges();
    cleanupOrphanedFieldEditors();
  });
  
  // Clear selection when clicking outside Blockly
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.blocklyWorkspace') && 
        !target.closest('.blocklyFlyout') &&
        !(typeof target.className === 'string' && target.className.includes('blockly'))) {
      
      window.getSelection()?.removeAllRanges();
      cleanupOrphanedFieldEditors();
    }
  });
}
