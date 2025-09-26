import * as Blockly from "blockly/core";

/**
 * Ottobit Blockly Theme (HP Robots palette)
 *
 * This theme maps your custom style names (used in block JSON: "style": "ottobit_*")
 * to the HP Robots block palette we extracted.
 *
 * Notes
 * - colourPrimary is the base color visible on blocks.
 * - colourSecondary/colourTertiary are derived shades for outlines, hats, and accents.
 * - Category colors here are optional unless you switch toolbox categories to use
 *   "categorystyle" instead of hard-coded "colour".
 */

// Small helpers to generate secondary/tertiary shades from a HEX color
function clamp(n: number, min = 0, max = 255) {
  return Math.min(max, Math.max(min, n));
}
function hex(n: number) {
  return clamp(Math.round(n)).toString(16).padStart(2, "0");
}
function toRGB(col: string): { r: number; g: number; b: number } {
  const s = col.trim().toUpperCase();
  if (/^#([0-9A-F]{6})$/.test(s)) {
    return {
      r: parseInt(s.slice(1, 3), 16),
      g: parseInt(s.slice(3, 5), 16),
      b: parseInt(s.slice(5, 7), 16),
    };
  }
  // Fallback: try short HEX #RGB
  if (/^#([0-9A-F]{3})$/.test(s)) {
    const r = s[1];
    const g = s[2];
    const b = s[3];
    return {
      r: parseInt(r + r, 16),
      g: parseInt(g + g, 16),
      b: parseInt(b + b, 16),
    };
  }
  // Default white
  return { r: 255, g: 255, b: 255 };
}
function shade(col: string, k: number): string {
  const { r, g, b } = toRGB(col);
  // k=0.85 makes it darker, k=1.15 makes it lighter
  const rr = hex(r * k);
  const gg = hex(g * k);
  const bb = hex(b * k);
  return `#${rr}${gg}${bb}`.toUpperCase();
}
function triad(colourPrimary: string) {
  // Common pattern used by Blockly: darker for secondary, darkest for tertiary
  const secondary = shade(colourPrimary, 0.85);
  const tertiary = shade(colourPrimary, 0.70);
  return { colourPrimary, colourSecondary: secondary, colourTertiary: tertiary };
}

// HP Robots palette (as detected)
const HP = {
  logic: "#FFBD3B",
  loops: "#FFAB19",
  math: "#00D072",
  text: "#9400D3",
  list: "#FF876B",
  colour: "#1E90FF",
  variable: "#FF8C1A",
  procedure: "#18C7FE",
  hat: "#A55B80",
  field: "#FFFFFF",
  start: "#F5D000",
  movePrimary: "#3B96EA",
  moveAlt: "#5565EE",
  sensor: "#5B67A5",
  actionGreen: "#4CAF50",
  actionRed: "#F44336",
  actionYellow: "#FFC107",
  actionOrange: "#FF9800",
  actionSalmon: "#FF7043",
};

export const ottobitTheme = Blockly.Theme.defineTheme("ottobitTheme", {
  // Required by ITheme typings in this Blockly version
  name: "ottobitTheme",
  // Inherit classic where appropriate
  base: Blockly.Themes.Classic,

  // Styles used by blocks (match your JSON "style" names)
  blockStyles: {
    // Events: start-like color
    ottobit_event: triad(HP.start),

    // Movement: primary blue; alternate shade will show in highlights
    ottobit_movement: {
      colourPrimary: HP.movePrimary,
      colourSecondary: HP.moveAlt,
      colourTertiary: shade(HP.movePrimary, 0.7),
    },

    // Control: loop-like orange
    ottobit_control: triad(HP.loops),

    // Despite the name "_blue", IF in HP sits in logic palette (yellow)
    ottobit_control_blue: triad(HP.logic),

    // Logic (boolean/compare/operation): yellow
    ottobit_logic: triad(HP.logic),

    // Sensors: HP uses a desaturated blue/grey for states
    ottobit_sensor: triad(HP.sensor),

    // Optional: variable and field styles if you switch away from hard-coded colours
    ottobit_variable: triad(HP.variable),
    field_blocks: triad(HP.field),

    // Optional action variants matching current hard-coded colours
    ottobit_action_green: triad(HP.actionGreen),
    ottobit_action_red: triad(HP.actionRed),
    ottobit_action_yellow: triad(HP.actionYellow),
    ottobit_action_orange: triad(HP.actionOrange),
    ottobit_action_salmon: triad(HP.actionSalmon),

    // If you ever decide to mirror more of HP categories
    math_blocks: triad(HP.math),
    text_blocks: triad(HP.text),
    list_blocks: triad(HP.list),
    colour_blocks: triad(HP.colour),
    variable_blocks: triad(HP.variable),
    procedure_blocks: triad(HP.procedure),
    hat_blocks: triad(HP.hat),
  },

  // Optional: category styles (only used if toolbox categories specify "categorystyle")
  categoryStyles: {
    events_category: { colour: HP.start },
    movement_category: { colour: HP.movePrimary },
    control_category: { colour: HP.loops },
    logic_category: { colour: HP.logic },
    sensors_category: { colour: HP.sensor },
    actions_category: { colour: "#51CF66" }, // current UI uses this hue
    functions_category: { colour: HP.procedure },
  },

  // Keep component styles default (inherit from Classic). You can override here if needed.
  componentStyles: {},
});

export type OttobitTheme = typeof ottobitTheme;
