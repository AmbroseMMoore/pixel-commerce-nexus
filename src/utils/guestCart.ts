// Guest Cart Utilities - Manages cart in localStorage for non-authenticated users

export interface GuestCartItem {
  id: string;
  product_id: string;
  color_id: string;
  size_id: string;
  quantity: number;
}

const GUEST_CART_KEY = 'guestCart';

/**
 * Get guest cart items from localStorage
 */
export const getGuestCart = (): GuestCartItem[] => {
  try {
    const cartData = localStorage.getItem(GUEST_CART_KEY);
    if (!cartData) return [];
    
    const cart = JSON.parse(cartData);
    return Array.isArray(cart) ? cart : [];
  } catch (error) {
    console.error('Error reading guest cart:', error);
    return [];
  }
};

/**
 * Save guest cart items to localStorage
 */
export const setGuestCart = (items: GuestCartItem[]): void => {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving guest cart:', error);
  }
};

/**
 * Generate unique ID for guest cart items
 */
export const generateGuestCartItemId = (): string => {
  return `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Add item to guest cart
 */
export const addGuestCartItem = (
  productId: string,
  colorId: string,
  sizeId: string,
  quantity: number = 1
): void => {
  try {
    const cart = getGuestCart();
    
    // Check if item already exists
    const existingItemIndex = cart.findIndex(
      item => item.product_id === productId && 
              item.color_id === colorId && 
              item.size_id === sizeId
    );
    
    if (existingItemIndex >= 0) {
      // Update quantity if item exists
      cart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.push({
        id: generateGuestCartItemId(),
        product_id: productId,
        color_id: colorId,
        size_id: sizeId,
        quantity
      });
    }
    
    setGuestCart(cart);
  } catch (error) {
    console.error('Error adding item to guest cart:', error);
    throw error;
  }
};

/**
 * Update guest cart item quantity
 */
export const updateGuestCartItem = (itemId: string, quantity: number): void => {
  try {
    const cart = getGuestCart();
    const itemIndex = cart.findIndex(item => item.id === itemId);
    
    if (itemIndex >= 0) {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        cart.splice(itemIndex, 1);
      } else {
        cart[itemIndex].quantity = quantity;
      }
      setGuestCart(cart);
    }
  } catch (error) {
    console.error('Error updating guest cart item:', error);
    throw error;
  }
};

/**
 * Remove item from guest cart
 */
export const removeGuestCartItem = (itemId: string): void => {
  try {
    const cart = getGuestCart();
    const filteredCart = cart.filter(item => item.id !== itemId);
    setGuestCart(filteredCart);
  } catch (error) {
    console.error('Error removing item from guest cart:', error);
    throw error;
  }
};

/**
 * Clear entire guest cart
 */
export const clearGuestCart = (): void => {
  try {
    localStorage.removeItem(GUEST_CART_KEY);
  } catch (error) {
    console.error('Error clearing guest cart:', error);
  }
};

/**
 * Get guest cart count
 */
export const getGuestCartCount = (): number => {
  const cart = getGuestCart();
  return cart.reduce((total, item) => total + item.quantity, 0);
};
