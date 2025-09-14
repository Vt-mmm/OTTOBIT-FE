// Theme configuration for Map Designer
export const THEME_COLORS = {
  primary: "#4CAF50", // Main green
  primaryDark: "#2E7D32", // Dark green
  primaryLight: "#66BB6A", // Light green
  secondary: "#8BC34A", // Secondary green
  accent: "#CDDC39", // Lime accent
  success: "#4CAF50",
  warning: "#FFC107",
  error: "#F44336",
  background: "#F1F8E9", // Light green background
  surface: "#FFFFFF",
  border: "#A5D6A7", // Light green border
  hover: "#E8F5E9", // Light green hover
  text: {
    primary: "#1B5E20", // Dark green text
    secondary: "#558B2F", // Medium green text
    disabled: "#A5D6A7", // Light green disabled
  },
};

// Grid configuration
export const GRID_CONFIG = {
  rows: 10,
  cols: 10,
  cellSize: 48, // pixels - tối ưu cho seamless rendering
  defaultTerrain: null, // No default terrain - cells start empty
};

// Empty cell style - simplified
export const EMPTY_CELL_STYLE = {
  background: "#fafafa",
  borderColor: "rgba(0,0,0,0.05)",
};

// Win condition types configuration
export const WIN_CONDITION_TYPES = [
  {
    id: "collect_all_items",
    name: "Thu thập tất cả",
    description: "Thu thập tất cả các vật phẩm trên map",
    requiresValue: false,
  },
  {
    id: "collect_specific",
    name: "Thu thập cụ thể",
    description: "Thu thập số lượng vật phẩm nhất định",
    requiresValue: true,
    valueLabel: "Số lượng",
  },
  {
    id: "reach_position",
    name: "Đến vị trí",
    description: "Di chuyển robot đến vị trí mục tiêu",
    requiresValue: false,
  },
  {
    id: "avoid_water",
    name: "Tránh nước",
    description: "Hoàn thành mà không đi vào nước",
    requiresValue: false,
  },
  {
    id: "step_limit",
    name: "Giới hạn bước",
    description: "Hoàn thành trong số bước tối đa",
    requiresValue: true,
    valueLabel: "Số bước tối đa",
  },
  {
    id: "time_limit",
    name: "Giới hạn thời gian",
    description: "Hoàn thành trong thời gian cho phép",
    requiresValue: true,
    valueLabel: "Thời gian (giây)",
  },
];
