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
  cellSize: 48, // pixels - optimized for seamless rendering
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
    name: "Collect All",
    description: "Collect all items on the map",
    requiresValue: false,
  },
  {
    id: "collect_specific",
    name: "Collect Specific",
    description: "Collect a specific number of items",
    requiresValue: true,
    valueLabel: "Quantity",
  },
  {
    id: "reach_position",
    name: "Reach Position",
    description: "Move robot to target position",
    requiresValue: false,
  },
  {
    id: "avoid_water",
    name: "Avoid Water",
    description: "Complete without stepping on water",
    requiresValue: false,
  },
  {
    id: "step_limit",
    name: "Step Limit",
    description: "Complete within maximum number of steps",
    requiresValue: true,
    valueLabel: "Max Steps",
  },
  {
    id: "time_limit",
    name: "Time Limit",
    description: "Complete within allowed time",
    requiresValue: true,
    valueLabel: "Time (seconds)",
  },
];
