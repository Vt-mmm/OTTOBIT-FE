import { MapAsset } from "common/models";

// Static assets configuration
// Can be replaced with API call later
export const MAP_ASSETS: MapAsset[] = [
  // Terrain tiles
  {
    id: "grass",
    name: "Grass",
    imagePath: "/map/grass.png",
    category: "terrain",
    description: "Basic grass terrain",
  },
  {
    id: "water",
    name: "Water",
    imagePath: "/map/water.png",
    category: "terrain",
    description: "Water terrain - impassable",
  },
  {
    id: "wood",
    name: "Wood",
    imagePath: "/map/wood.png",
    category: "terrain",
    description: "Wooden floor",
  },
  {
    id: "road_h",
    name: "Horizontal Road",
    imagePath: "/map/road_h.png",
    category: "terrain",
    description: "Horizontal road",
  },
  {
    id: "road_v",
    name: "Vertical Road",
    imagePath: "/map/road_v.png",
    category: "terrain",
    description: "Vertical road",
  },
  {
    id: "crossroad",
    name: "Crossroad",
    imagePath: "/map/crossroad.png",
    category: "terrain",
    description: "Crossroad intersection",
  },
  {
    id: "empty",
    name: "Empty Cell",
    imagePath: "",
    category: "tool",
    description: "Place empty cell (nothing)",
  },

  // Robot with directions
  {
    id: "robot_north",
    name: "Robot (North)",
    imagePath: "/map/robot_north.png",
    category: "robot",
    rotatable: true,
    description: "Robot facing up",
  },
  {
    id: "robot_east",
    name: "Robot (East)",
    imagePath: "/map/robot_east.png",
    category: "robot",
    rotatable: true,
    description: "Robot facing right",
  },
  {
    id: "robot_south",
    name: "Robot (South)",
    imagePath: "/map/robot_south.png",
    category: "robot",
    rotatable: true,
    description: "Robot facing down",
  },
  {
    id: "robot_west",
    name: "Robot (West)",
    imagePath: "/map/robot_west.png",
    category: "robot",
    rotatable: true,
    description: "Robot facing left",
  },

  // Items to collect
  {
    id: "pin_green",
    name: "Green Battery",
    imagePath: "/map/pin_green.png",
    category: "item",
    description: "Green energy battery",
  },
  {
    id: "pin_yellow",
    name: "Yellow Battery",
    imagePath: "/map/pin_yellow.png",
    category: "item",
    description: "Yellow energy battery",
  },
  {
    id: "pin_red",
    name: "Red Battery",
    imagePath: "/map/pin_red.png",
    category: "item",
    description: "Red energy battery",
  },

  // Objects/Obstacles
  {
    id: "box",
    name: "Box",
    imagePath: "/map/box.png",
    category: "item",
    description: "Box obstacle",
  },

  // Tools
  {
    id: "eraser",
    name: "Delete Object",
    imagePath: "",
    category: "tool",
    description: "Delete object on cell (keep terrain)",
  },
];

// Helper function to get assets by category
export const getAssetsByCategory = (category: MapAsset["category"]) => {
  return MAP_ASSETS.filter((asset) => asset.category === category);
};
