export interface GuestWishlistItem {
  id: string;
  productId: string;
  colorId: string;
  sizeId: string;
  addedAt: string;
}

const GUEST_WISHLIST_KEY = 'guest_wishlist';

// Get guest wishlist from localStorage
export const getGuestWishlist = (): GuestWishlistItem[] => {
  try {
    const stored = localStorage.getItem(GUEST_WISHLIST_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading guest wishlist:', error);
    return [];
  }
};

// Save guest wishlist to localStorage
const setGuestWishlist = (items: GuestWishlistItem[]): void => {
  try {
    localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving guest wishlist:', error);
  }
};

// Generate unique ID for guest wishlist items
const generateGuestWishlistItemId = (): string => {
  return `guest-wishlist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Add item to guest wishlist
export const addGuestWishlistItem = (
  productId: string,
  colorId: string,
  sizeId: string
): void => {
  const items = getGuestWishlist();
  
  // Check if item already exists (same product, color, size)
  const existingIndex = items.findIndex(
    item => item.productId === productId && 
            item.colorId === colorId && 
            item.sizeId === sizeId
  );
  
  if (existingIndex === -1) {
    // Add new item
    items.push({
      id: generateGuestWishlistItemId(),
      productId,
      colorId,
      sizeId,
      addedAt: new Date().toISOString()
    });
    setGuestWishlist(items);
  }
  // If already exists, do nothing (already in wishlist)
};

// Remove item from guest wishlist
export const removeGuestWishlistItem = (itemId: string): void => {
  const items = getGuestWishlist();
  const updatedItems = items.filter(item => item.id !== itemId);
  setGuestWishlist(updatedItems);
};

// Clear guest wishlist
export const clearGuestWishlist = (): void => {
  try {
    localStorage.removeItem(GUEST_WISHLIST_KEY);
  } catch (error) {
    console.error('Error clearing guest wishlist:', error);
  }
};

// Get guest wishlist count
export const getGuestWishlistCount = (): number => {
  return getGuestWishlist().length;
};
