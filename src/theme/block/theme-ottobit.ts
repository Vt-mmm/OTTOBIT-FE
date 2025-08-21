// src/blocks/theme-ottobit.ts
import * as Blockly from "blockly/core";

export const ThemeOttobit = Blockly.Theme.defineTheme("ottobit-theme", {
  name: "ottobit-theme",
  base: (Blockly.Themes as any).Zelos,
  fontStyle: {
    family: "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
    weight: "700",
    size: 14,
  },
  blockStyles: {
    ottobit_event: {
      colourPrimary: "#FFD700", // Vàng nhạt như trong hình
      colourSecondary: "#FFF8DC",
      colourTertiary: "#F0C814", // Màu đậm hơn cho viền
    },
    ottobit_motion: {
      colourPrimary: "#1E90FF", // Xanh đậm như trong hình
      colourSecondary: "#87CEEB",
      colourTertiary: "#0066CC", // Màu đậm hơn cho viền
    },
    ottobit_action: {
      colourPrimary: "#8E44AD", // Tím cho action
      colourSecondary: "#BB8FCE",
      colourTertiary: "#7D3C98",
    },
    ottobit_var: {
      colourPrimary: "#E74C3C", // Đỏ cho stop/vars
      colourSecondary: "#F1948A",
      colourTertiary: "#C0392B",
    },
  },
  categoryStyles: {
    car_category: { colour: "#5C9DFF" },
    control_category: { colour: "#10B981" },
    action_category: { colour: "#8E44AD" },
    sensor_category: { colour: "#F59E0B" },
  },
  componentStyles: {
    workspaceBackgroundColour: "#FAFBFC", // Sáng hơn nữa
    toolboxBackgroundColour: "#E8EEF7",
    toolboxForegroundColour: "#2C3E50",
    flyoutBackgroundColour: "#FFFFFF",
    flyoutForegroundColour: "#2C3E50",
    flyoutOpacity: 1,
    scrollbarColour: "#BDC3C7",
    insertionMarkerColour: "#3498DB",
    insertionMarkerOpacity: 0.4,
    selectedGlowColour: "#F39C12",
    cursorColour: "#3498DB",
  },
});
