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
    
    /* Field styling - Minimal và cần thiết */
    .blocklyFieldNumber rect,
    .blocklyFieldTextInput rect,
    .blocklyFieldDropdown rect {
      fill: rgba(255, 255, 255, 0.9) !important;
      stroke: rgba(0, 0, 0, 0.2) !important;
      stroke-width: 1px !important;
      rx: 8px !important;
      ry: 8px !important;
    }
    
    .blocklyFieldNumber text,
    .blocklyFieldTextInput text,
    .blocklyFieldDropdown text {
      fill: #333333 !important;
      font-weight: 700 !important;
      font-size: 16px !important;
    }
    
    /* Block corners - vuông vức hơn */
    .blocklyPath {
      rx: 4px !important;
      ry: 4px !important;
    }
    
    /* Hover states - giữ field text đen */
    *:hover .blocklyFieldNumber text,
    *:hover .blocklyFieldTextInput text,
    *:hover .blocklyFieldDropdown text {
      fill: #333333 !important;
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
