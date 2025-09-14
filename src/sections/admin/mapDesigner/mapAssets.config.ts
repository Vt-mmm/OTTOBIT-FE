import { MapAsset } from "common/models";

// Static assets configuration
// Sau này có thể được thay thế bằng API call
export const MAP_ASSETS: MapAsset[] = [
  // Terrain tiles
  {
    id: 'grass',
    name: 'Cỏ',
    imagePath: '/map/grass.png',
    category: 'terrain',
    description: 'Địa hình cỏ cơ bản'
  },
  {
    id: 'water',
    name: 'Nước',
    imagePath: '/map/water.png',
    category: 'terrain',
    description: 'Địa hình nước - không thể đi qua'
  },
  {
    id: 'wood',
    name: 'Gỗ',
    imagePath: '/map/wood.png',
    category: 'terrain',
    description: 'Sàn gỗ'
  },
  {
    id: 'road_h',
    name: 'Đường ngang',
    imagePath: '/map/road_h.png',
    category: 'terrain',
    description: 'Đường nằm ngang'
  },
  {
    id: 'road_v',
    name: 'Đường dọc',
    imagePath: '/map/road_v.png',
    category: 'terrain',
    description: 'Đường thẳng đứng'
  },
  {
    id: 'crossroad',
    name: 'Ngã tư',
    imagePath: '/map/crossroad.png',
    category: 'terrain',
    description: 'Giao lộ ngã tư'
  },
  {
    id: 'empty',
    name: 'Ô trống',
    imagePath: '',
    category: 'terrain',
    description: 'Đặt ô trống (không có gì)'
  },

  // Robot with directions
  {
    id: 'robot_north',
    name: 'Robot (Bắc)',
    imagePath: '/map/robot_north.png',
    category: 'robot',
    rotatable: true,
    description: 'Robot hướng lên trên'
  },
  {
    id: 'robot_east',
    name: 'Robot (Đông)',
    imagePath: '/map/robot_east.png',
    category: 'robot',
    rotatable: true,
    description: 'Robot hướng sang phải'
  },
  {
    id: 'robot_south',
    name: 'Robot (Nam)',
    imagePath: '/map/robot_south.png',
    category: 'robot',
    rotatable: true,
    description: 'Robot hướng xuống dưới'
  },
  {
    id: 'robot_west',
    name: 'Robot (Tây)',
    imagePath: '/map/robot_west.png',
    category: 'robot',
    rotatable: true,
    description: 'Robot hướng sang trái'
  },

  // Items to collect
  {
    id: 'pin_green',
    name: 'Pin xanh',
    imagePath: '/map/pin_green.png',
    category: 'item',
    description: 'Pin năng lượng xanh'
  },
  {
    id: 'pin_yellow',
    name: 'Pin vàng',
    imagePath: '/map/pin_yellow.png',
    category: 'item',
    description: 'Pin năng lượng vàng'
  },
  {
    id: 'pin_red',
    name: 'Pin đỏ',
    imagePath: '/map/pin_red.png',
    category: 'item',
    description: 'Pin năng lượng đỏ'
  },

  // Objects/Obstacles
  {
    id: 'box',
    name: 'Hộp',
    imagePath: '/map/box.png',
    category: 'object',
    description: 'Chướng ngại vật hộp'
  },

  // Tools
  {
    id: 'eraser',
    name: 'Xóa vật thể',
    imagePath: '',
    category: 'tool',
    description: 'Xóa vật thể trên ô (giữ lại terrain)'
  }
];

// Helper function to get assets by category
export const getAssetsByCategory = (category: MapAsset['category']) => {
  return MAP_ASSETS.filter(asset => asset.category === category);
};