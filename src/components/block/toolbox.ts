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
          type: "ottobit_if",
        },
        {
          kind: "block",
          type: "ottobit_if_else_logic",
        },
        {
          kind: "block",
          type: "ottobit_variable_i",
        },
        {
          kind: "block",
          type: "ottobit_logic_compare",
        },
        {
          kind: "block",
          type: "ottobit_number",
        },
      ],
    },
    {
      kind: "category",
      name: "Sensors",
      colour: "#ff6b6b",
      contents: [
        {
          kind: "block",
          type: "ottobit_read_sensor",
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
          type: "ottobit_collect",
        },
        {
          kind: "block",
          type: "ottobit_collect_green",
        },
      ],
    },
  ],
};
