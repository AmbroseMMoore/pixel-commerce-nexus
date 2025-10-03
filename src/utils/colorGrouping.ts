/**
 * Color Grouping Utility
 * Automatically maps product colors to 12 major color groups using perceptual color distance
 */

export interface ColorGroup {
  name: string;
  colorCode: string;
  displayName: string;
}

export const MAJOR_COLOR_GROUPS: ColorGroup[] = [
  { name: 'red', colorCode: '#FF0000', displayName: 'Red' },
  { name: 'orange', colorCode: '#FF8C00', displayName: 'Orange' },
  { name: 'yellow', colorCode: '#FFD700', displayName: 'Yellow' },
  { name: 'green', colorCode: '#00FF00', displayName: 'Green' },
  { name: 'blue', colorCode: '#0000FF', displayName: 'Blue' },
  { name: 'purple', colorCode: '#800080', displayName: 'Purple' },
  { name: 'pink', colorCode: '#FFC0CB', displayName: 'Pink' },
  { name: 'brown', colorCode: '#8B4513', displayName: 'Brown' },
  { name: 'black', colorCode: '#000000', displayName: 'Black' },
  { name: 'white', colorCode: '#FFFFFF', displayName: 'White' },
  { name: 'gray', colorCode: '#808080', displayName: 'Gray' },
  { name: 'beige', colorCode: '#F5F5DC', displayName: 'Beige' },
];

// Cache for color group assignments to avoid recalculating
const colorGroupCache = new Map<string, string>();

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Handle 3-digit hex
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  
  if (hex.length !== 6) return null;
  
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  
  return { r, g, b };
}

/**
 * Convert RGB to Lab color space (perceptually uniform)
 * This gives more accurate color distance calculations
 */
function rgbToLab(r: number, g: number, b: number): { l: number; a: number; b: number } {
  // Normalize RGB values
  r = r / 255;
  g = g / 255;
  b = b / 255;
  
  // Convert to linear RGB
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
  
  // Convert to XYZ
  let x = (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) * 100;
  let y = (r * 0.2126729 + g * 0.7151522 + b * 0.0721750) * 100;
  let z = (r * 0.0193339 + g * 0.1191920 + b * 0.9503041) * 100;
  
  // Reference white D65
  x = x / 95.047;
  y = y / 100.000;
  z = z / 108.883;
  
  // Convert to Lab
  x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + (16/116);
  y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + (16/116);
  z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + (16/116);
  
  return {
    l: (116 * y) - 16,
    a: 500 * (x - y),
    b: 200 * (y - z)
  };
}

/**
 * Calculate color distance in Lab color space
 */
function colorDistance(lab1: { l: number; a: number; b: number }, lab2: { l: number; a: number; b: number }): number {
  const deltaL = lab1.l - lab2.l;
  const deltaA = lab1.a - lab2.a;
  const deltaB = lab1.b - lab2.b;
  
  return Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB);
}

/**
 * Assign a color to the nearest major color group
 */
export function getColorGroup(colorCode: string): ColorGroup {
  // Check cache first
  if (colorGroupCache.has(colorCode)) {
    const cachedGroupName = colorGroupCache.get(colorCode)!;
    return MAJOR_COLOR_GROUPS.find(g => g.name === cachedGroupName) || MAJOR_COLOR_GROUPS[0];
  }
  
  // Convert input color to RGB
  const rgb = hexToRgb(colorCode);
  
  // Fallback to gray if invalid
  if (!rgb) {
    return MAJOR_COLOR_GROUPS.find(g => g.name === 'gray') || MAJOR_COLOR_GROUPS[0];
  }
  
  // Convert to Lab
  const inputLab = rgbToLab(rgb.r, rgb.g, rgb.b);
  
  // Find the closest major color group
  let minDistance = Infinity;
  let closestGroup = MAJOR_COLOR_GROUPS[0];
  
  for (const group of MAJOR_COLOR_GROUPS) {
    const groupRgb = hexToRgb(group.colorCode);
    if (!groupRgb) continue;
    
    const groupLab = rgbToLab(groupRgb.r, groupRgb.g, groupRgb.b);
    const distance = colorDistance(inputLab, groupLab);
    
    if (distance < minDistance) {
      minDistance = distance;
      closestGroup = group;
    }
  }
  
  // Cache the result
  colorGroupCache.set(colorCode, closestGroup.name);
  
  return closestGroup;
}

/**
 * Get the color group name for a given color code
 */
export function getColorGroupName(colorCode: string): string {
  return getColorGroup(colorCode).name;
}

/**
 * Check if a color belongs to a specific color group
 */
export function isColorInGroup(colorCode: string, groupName: string): boolean {
  return getColorGroup(colorCode).name === groupName;
}
