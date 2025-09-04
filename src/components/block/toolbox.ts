export const OTTOBOT_TOOLBOX = {
  kind: "categoryToolbox",
  contents: [
    {
      kind: "category",
      name: "Events",
      colour: "#ffcc00",
      contents: [
        {
          kind: "block",
          type: "ottobot_start"
        }
      ]
    },
    {
      kind: "category", 
      name: "Movement",
      colour: "#4a90e2",
      contents: [
        {
          kind: "block",
          type: "ottobot_move_forward"
        },
        {
          kind: "block",
          type: "ottobot_rotate"
        }
      ]
    },
    {
      kind: "category",
      name: "Control", 
      colour: "#7b68ee",
      contents: [
        {
          kind: "block",
          type: "ottobot_repeat"
        },
        {
          kind: "block",
          type: "ottobot_if"
        }
      ]
    },
    {
      kind: "category",
      name: "Sensors",
      colour: "#ff6b6b",
      contents: [
        {
          kind: "block",
          type: "ottobot_read_sensor"
        }
      ]
    },
    {
      kind: "category",
      name: "Actions",
      colour: "#51cf66",
      contents: [
        {
          kind: "block",
          type: "ottobot_collect"
        },
        {
          kind: "block",
          type: "ottobot_collect_green"
        }
      ]
    }
  ]
};
