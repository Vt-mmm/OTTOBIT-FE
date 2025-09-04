// src/theme/block/theme-ottobit.ts - Đúng chuẩn Google Blockly
import * as Blockly from "blockly/core";

export const ThemeOttobit = Blockly.Theme.defineTheme("ottobit-theme", {
  name: "ottobit-theme",
  base: (Blockly.Themes as any).Zelos,
  
  // Font styling theo chuẩn HP robots - cân bằng giữa đẹp và layout
  fontStyle: {
    family: "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
    weight: "700", // Đậm vừa phải
    size: 16, // Kích thước cân bằng cho layout tốt
  },
  
  // Block styles với màu sắc theo HP robots - chính xác và đậm
  blockStyles: {
    ottobit_event: {
      colourPrimary: "#F4C430", // Vàng đậm hơn cho start blocks
      colourSecondary: "#F7D358",
      colourTertiary: "#E6B800",
      hat: "cap", // Start blocks có hat
    },
    ottobit_motion: {
      colourPrimary: "#2C3E50", // Xanh đậm thay vì đen để dễ nhìn
      colourSecondary: "#5D6D7E", 
      colourTertiary: "#1B2631",
    },
    ottobit_movement: {
      colourPrimary: "#2C3E50", // Xanh đậm thay vì đen để dễ nhìn
      colourSecondary: "#5D6D7E", 
      colourTertiary: "#1B2631",
    },
    ottobit_action: {
      colourPrimary: "#2E86AB", // Xanh đậm hơn cho action
      colourSecondary: "#3D9BC2",
      colourTertiary: "#1F5F7A",
    },
    ottobit_control: {
      colourPrimary: "#FF8C00", // Cam HP chính xác
      colourSecondary: "#FFB347",
      colourTertiary: "#E07B00",
    },
    ottobit_wait: {
      colourPrimary: "#DC143C", // Đỏ đậm cho wait
      colourSecondary: "#E5577A",
      colourTertiary: "#B71C1C",
    },
    ottobit_var: {
      colourPrimary: "#8E44AD", // Tím đậm cho variables
      colourSecondary: "#A569BD",
      colourTertiary: "#6C3483",
    },
    // Thêm styles cho sensor blocks
    ottobit_sensor: {
      colourPrimary: "#8E44AD", // Tím cho sensor để phân biệt
      colourSecondary: "#A569BD",
      colourTertiary: "#6C3483",
    },
    // Styles cho math/logic blocks
    ottobit_math: {
      colourPrimary: "#2C3E50", // Xanh đậm cho math
      colourSecondary: "#5D6D7E", 
      colourTertiary: "#1B2631",
    },
    // Default cho blocks không có style riêng
    ottobit_default: {
      colourPrimary: "#95A5A6", // Xám cho default
      colourSecondary: "#BDC3C7",
      colourTertiary: "#7F8C8D",
    },
  },
  
  // Category colors cho toolbox
  categoryStyles: {
    car_category: { colour: "#5C9DFF" },
    control_category: { colour: "#FF9500" },
    action_category: { colour: "#3498DB" },
    sensor_category: { colour: "#F59E0B" },
    variable_category: { colour: "#9B59B6" },
  },
  
  // Component styling - Đúng theo Blockly API
  componentStyles: {
    // Workspace styling - TRẮNG TINH để làm việc
    workspaceBackgroundColour: "#FFFFFF",
    
    // Toolbox styling - XANH NHẠT để phân biệt
    toolboxBackgroundColour: "#E8F4FD", 
    toolboxForegroundColour: "#2C3E50",
    
    // Flyout styling - XÁM NHẠT để phân biệt với workspace
    flyoutBackgroundColour: "#F5F6FA", 
    flyoutForegroundColour: "#2C3E50",
    flyoutOpacity: 1.0,
    
    // Scrollbar styling
    scrollbarColour: "#BDC3C7",
    scrollbarOpacity: 0.8,
    
    // Selection và cursor
    insertionMarkerColour: "#3498DB",
    insertionMarkerOpacity: 0.5,
    selectedGlowColour: "#F39C12",
    selectedGlowOpacity: 0.8,
    cursorColour: "#3498DB",
  },
  
  // Start hats styling
  startHats: true,
});
