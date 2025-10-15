export const ottobit_TOOLBOX = {
  kind: "categoryToolbox",
  contents: [
    {
      kind: "category",
      name: "Events",
      colour: "#ffcc00",
      contents: [
        {
          kind: "block",
          type: "ottobit_start",
        },
      ],
    },
    {
      kind: "category",
      name: "Movement",
      colour: "#4a90e2",
      contents: [
        {
          kind: "block",
          type: "ottobit_move_forward",
        },
        {
          kind: "block",
          type: "ottobit_rotate",
        },
      ],
    },
    {
      kind: "category",
      name: "Control",
      colour: "#FF8C00",
      contents: [
        {
          kind: "block",
          type: "ottobit_repeat",
        },
        {
          kind: "block",
          type: "ottobit_repeat_range",
        },
        {
          kind: "block",
          type: "ottobit_while",
        },
        {
          kind: "block",
          type: "ottobit_while_compare",
        },
        {
          kind: "block",
          type: "ottobit_if_expandable",
        },
        {
          kind: "block",
          type: "ottobit_variable",
        },
        {
          kind: "block",
          type: "ottobit_number",
        },
      ],
    },
    {
      kind: "category",
      name: "Logic",
      colour: "#9C27B0",
      contents: [
        {
          kind: "block",
          type: "ottobit_boolean",
        },
        {
          kind: "block",
          type: "ottobit_logic_operation",
        },
        {
          kind: "block",
          type: "ottobit_logic_compare",
        },
        {
          kind: "block",
          type: "ottobit_condition",
        },
        {
          kind: "block",
          type: "ottobit_boolean_equals",
        },
        {
          kind: "block",
          type: "ottobit_bale_number",
        },
        {
          kind: "block",
          type: "ottobit_pin_number",
        },
      ],
    },
    {
      kind: "category",
      name: "Arithmetic",
      colour: "#4CAF50",
      contents: [
        {
          kind: "block",
          type: "ottobit_arithmetic",
        },
      ],
    },
    {
      kind: "category",
      name: "Sensors",
      colour: "#FF6B35",
      contents: [
        {
          kind: "block",
          type: "ottobit_is_green",
        },
        {
          kind: "block",
          type: "ottobit_is_red",
        },
        {
          kind: "block",
          type: "ottobit_is_yellow",
        },
        {
          kind: "block",
          type: "ottobit_read_sensor",
        },
        {
          kind: "block",
          type: "ottobit_sensor_condition",
        },
        {
          kind: "block",
          type: "ottobit_comparison",
        },
      ],
    },
    {
      kind: "category",
      name: "Actions",
      colour: "#51cf66",
      contents: [
        {
          kind: "block",
          type: "ottobit_collect_green",
        },
        {
          kind: "block",
          type: "ottobit_collect_red",
        },
        {
          kind: "block",
          type: "ottobit_collect_yellow",
        },
        {
          kind: "block",
          type: "ottobit_take_bale",
        },
        {
          kind: "block",
          type: "ottobit_put_bale",
        },
      ],
    },
    {
      kind: "category",
      name: "Functions",
      colour: "#40E0D0",
      contents: [
        {
          kind: "block",
          type: "ottobit_function_def",
        },
        {
          kind: "block",
          type: "ottobit_function_call",
        },
      ],
    },
  ],
};
