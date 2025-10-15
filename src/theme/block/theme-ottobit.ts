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

  // Block styles với màu sắc hài hòa theo ảnh
  blockStyles: {
    ottobit_event: {
      colourPrimary: "#F4C430", // Vàng cho start và while
      colourSecondary: "#F7D358",
      colourTertiary: "#E6B800",
      hat: "cap", // Start blocks có hat
    },
    ottobit_motion: {
      colourPrimary: "#4A90E2", // Xanh dương tươi cho movement
      colourSecondary: "#6BA3E8",
      colourTertiary: "#357ABD",
    },
    ottobit_movement: {
      // HP Robots movement blue (darker, more saturated)
      colourPrimary: "#3B96EA",
      colourSecondary: "#5565EE",
      colourTertiary: "#2E6BD2",
    },
    ottobit_action: {
      colourPrimary: "#4A90E2", // Xanh dương tươi cho action
      colourSecondary: "#6BA3E8",
      colourTertiary: "#357ABD",
    },
    // Action variants to match collect/take/put blocks
    ottobit_action_green: {
      colourPrimary: "#4CAF50",
      colourSecondary: "#6EC170",
      colourTertiary: "#3C8E40",
    },
    ottobit_action_red: {
      colourPrimary: "#F44336",
      colourSecondary: "#F77066",
      colourTertiary: "#D32F2F",
    },
    ottobit_action_yellow: {
      colourPrimary: "#FFC107",
      colourSecondary: "#FFD54F",
      colourTertiary: "#FFA000",
    },
    ottobit_action_orange: {
      colourPrimary: "#FF9800",
      colourSecondary: "#FFB74D",
      colourTertiary: "#F57C00",
    },
    ottobit_action_salmon: {
      colourPrimary: "#FF7043",
      colourSecondary: "#FF8A65",
      colourTertiary: "#F4511E",
    },
    ottobit_control: {
      // HP Robots loop/control yellow
      colourPrimary: "#FFBD3B",
      colourSecondary: "#FFD166",
      colourTertiary: "#E6A700",
    },
    ottobit_control_blue: {
      // Align IF/ELSE to HP control yellow for consistency
      colourPrimary: "#FFBD3B",
      colourSecondary: "#FFD166",
      colourTertiary: "#E6A700",
    },
    ottobit_logic: {
      colourPrimary: "#9C27B0", // Tím đậm cho logic blocks (TRUE/FALSE/AND/OR/NOT)
      colourSecondary: "#BA68C8",
      colourTertiary: "#7B1FA2",
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
    // Variable and field styles used by custom blocks
    ottobit_variable: {
      colourPrimary: "#FF8C1A",
      colourSecondary: "#FFA04D",
      colourTertiary: "#E67600",
    },
    field_blocks: {
      colourPrimary: "#FFFFFF",
      colourSecondary: "#E0E0E0",
      colourTertiary: "#BDBDBD",
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
    // Arithmetic blocks - Xanh lá cho toán tử số học
    ottobit_arithmetic: {
      colourPrimary: "#4CAF50", // Xanh lá cho +, -, ×, ÷
      colourSecondary: "#66BB6A",
      colourTertiary: "#388E3C",
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
