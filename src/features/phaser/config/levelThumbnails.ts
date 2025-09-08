/**
 * Level Thumbnails Configuration
 * Maps level IDs to their thumbnail images
 */

// Default thumbnails for each category
const DEFAULT_THUMBNAILS = {
  basic: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=200&fit=crop',
  boolean: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=200&fit=crop',
  forloop: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=200&fit=crop',
};

// You can use local images from public folder
// Example: '/images/levels/basic1.jpg'
// Or use placeholder services for now
export const LEVEL_THUMBNAILS: Record<string, string> = {
  // Basic levels
  'basic-1': '/images/levels/basic1.jpg',
  'basic-2': '/images/levels/basic2.jpg',
  'basic-3': '/images/levels/basic3.jpg',
  'basic-4': '/images/levels/basic4.jpg',
  'basic-5': '/images/levels/basic5.jpg',
  'basic-6': '/images/levels/basic6.jpg',
  'basic-7': '/images/levels/basic7.jpg',
  'basic-8': '/images/levels/basic8.jpg',
  
  // Boolean levels
  'boolean-1': '/images/levels/boolean1.jpg',
  'boolean-2': '/images/levels/boolean2.jpg',
  'boolean-3': '/images/levels/boolean3.jpg',
  
  // Forloop levels
  'forloop-1': '/images/levels/forloop1.jpg',
  'forloop-2': '/images/levels/forloop2.jpg',
  'forloop-3': '/images/levels/forloop3.jpg',
};

// Generate placeholder images using a service
export function generatePlaceholderThumbnail(levelId: string, category: string): string {
  // Extract level number from ID (e.g., 'basic-1' -> '1')
  const levelNumber = levelId.split('-')[1] || '1';
  
  // Use different placeholder strategies based on category
  switch(category) {
    case 'basic':
      // Robot/tech themed images for basic levels
      const basicImages = [
        'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=200&fit=crop', // Robot
        'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=200&fit=crop', // Tech
        'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=200&fit=crop', // Circuit
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=200&fit=crop', // Cyber
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=200&fit=crop', // Matrix
        'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400&h=200&fit=crop', // Code
        'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200&fit=crop', // Programming
        'https://images.unsplash.com/photo-1537884944318-390069bb8665?w=400&h=200&fit=crop', // Space
      ];
      return basicImages[(parseInt(levelNumber) - 1) % basicImages.length];
      
    case 'boolean':
      // Logic/puzzle themed images
      const booleanImages = [
        'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=200&fit=crop', // Puzzle
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=200&fit=crop', // Brain
        'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=200&fit=crop', // Logic gates
      ];
      return booleanImages[(parseInt(levelNumber) - 1) % booleanImages.length];
      
    case 'forloop':
      // Loop/infinity themed images  
      const loopImages = [
        'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=400&h=200&fit=crop', // Pattern
        'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=200&fit=crop', // Gears
        'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=200&fit=crop', // AI
      ];
      return loopImages[(parseInt(levelNumber) - 1) % loopImages.length];
      
    default:
      return DEFAULT_THUMBNAILS.basic;
  }
}

// Get thumbnail for a specific level
export function getLevelThumbnail(levelId: string, category: string): string {
  // First check if we have a specific thumbnail
  if (LEVEL_THUMBNAILS[levelId]) {
    return LEVEL_THUMBNAILS[levelId];
  }
  
  // Otherwise generate a placeholder
  return generatePlaceholderThumbnail(levelId, category);
}

// Category gradient overlays for better visual effect
export const CATEGORY_OVERLAYS = {
  basic: 'linear-gradient(180deg, transparent 0%, rgba(25, 118, 210, 0.8) 100%)',
  boolean: 'linear-gradient(180deg, transparent 0%, rgba(123, 31, 162, 0.8) 100%)',
  forloop: 'linear-gradient(180deg, transparent 0%, rgba(56, 142, 60, 0.8) 100%)',
};
