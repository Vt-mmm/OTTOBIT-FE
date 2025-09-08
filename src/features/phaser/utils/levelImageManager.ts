/**
 * Level Image Manager
 * Handles loading and caching of level images
 */

import { getLevelThumbnail } from '../config/levelThumbnails';

// Cache for loaded images
const imageCache = new Map<string, string>();

/**
 * Preload images for better performance
 */
export function preloadLevelImages(levelIds: string[], categories: string[]) {
  levelIds.forEach((id, index) => {
    const category = categories[index];
    const imageUrl = getLevelThumbnail(id, category);
    
    // Preload image
    const img = new Image();
    img.src = imageUrl;
    
    // Cache the URL
    imageCache.set(id, imageUrl);
  });
}

/**
 * Get cached image URL or load it
 */
export function getCachedLevelImage(levelId: string, category: string): string {
  if (imageCache.has(levelId)) {
    return imageCache.get(levelId)!;
  }
  
  const imageUrl = getLevelThumbnail(levelId, category);
  imageCache.set(levelId, imageUrl);
  return imageUrl;
}

/**
 * Generate a data URL for a simple SVG placeholder
 * This can be used as a fallback when images fail to load
 */
export function generateSVGPlaceholder(levelId: string, category: string): string {
  const colors = {
    basic: '#1976D2',
    boolean: '#7B1FA2',
    forloop: '#388E3C',
  };
  
  const color = colors[category as keyof typeof colors] || colors.basic;
  const text = levelId.toUpperCase().replace('-', ' ');
  
  const svg = `
    <svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:${color};stop-opacity:0.3" />
        </linearGradient>
      </defs>
      <rect width="400" height="200" fill="url(#grad)"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" 
            fill="white" font-family="Arial, sans-serif" 
            font-size="24" font-weight="bold">${text}</text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Handle image load errors with fallback
 */
export function handleImageError(event: React.SyntheticEvent<HTMLImageElement>, levelId: string, category: string) {
  const target = event.target as HTMLImageElement;
  // Use SVG placeholder as fallback
  target.src = generateSVGPlaceholder(levelId, category);
}
