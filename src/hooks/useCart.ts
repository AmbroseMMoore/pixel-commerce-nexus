import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useLogging } from '@/hooks/useLogging';
import { 
  getGuestCart, 
  addGuestCartItem, 
  updateGuestCartItem, 
  removeGuestCartItem, 
  clearGuestCart 
} from '@/utils/guestCart';

export interface CartItem {
  id: string;
  product_id: string;
  color_id: string;
  size_id: string;
  quantity: number;
  product: {
    title: string;
    price_original: number;
    price_discounted?: number;
    slug: string;
    image_url?: string;
  };
  color: {
    name: string;
    color_code: string;
  };
  size: {
    name: string;
    price_original?: number;
    price_discounted?: number;
  };
  product_images: Array<{
    image_url: string;
    is_primary: boolean;
  }>;
}

export const useCart = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { logInfo, logError } = useLogging();

  // Fetch cart items with size-specific pricing
  const { data: cartItems = [], isLoading, error } = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: async () => {
      // Guest cart - load from localStorage
      if (!user?.id) {
        const guestItems = getGuestCart();
        if (guestItems.length === 0) return [];

        // Fetch product details for guest cart items
        const cartItemsWithDetails = await Promise.all(
          guestItems.map(async (item) => {
            try {
              // Fetch product details
              const { data: product, error: productError } = await supabase
                .from('products')
                .select('title, price_original, price_discounted, slug')
                .eq('id', item.product_id)
                .single();

              if (productError) throw productError;

              // Fetch color details
              const { data: colorData, error: colorError } = await supabase
                .from('product_colors')
                .select('name, color_code')
                .eq('id', item.color_id)
                .maybeSingle();

              if (colorError) throw colorError;

              // Fetch size details
              const { data: sizeData, error: sizeError } = await supabase
                .from('product_sizes')
                .select('name, price_original, price_discounted')
                .eq('id', item.size_id)
                .maybeSingle();

              if (sizeError) throw sizeError;

              if (!product || !colorData || !sizeData) {
                return null;
              }

              const color = {
                name: colorData.name,
                color_code: colorData.color_code
              };

              const size = {
                name: sizeData.name,
                price_original: sizeData.price_original,
                price_discounted: sizeData.price_discounted
              };

              // Fetch product images
              const { data: images } = await supabase
                .from('product_images')
                .select('image_url, is_primary')
                .eq('product_id', item.product_id)
                .eq('color_id', item.color_id)
                .order('is_primary', { ascending: false });

              const primaryImage = images?.find(img => img.is_primary) || images?.[0];

              return {
                id: item.id,
                product_id: item.product_id,
                color_id: item.color_id,
                size_id: item.size_id,
                quantity: item.quantity,
                product: {
                  ...product,
                  image_url: primaryImage?.image_url || "/placeholder.svg"
                },
                color,
                size,
                product_images: images || []
              };
            } catch (error) {
              console.error('Error fetching guest cart item details:', error);
              return null;
            }
          })
        );

        return cartItemsWithDetails.filter(item => item !== null) as CartItem[];
      }

      // Authenticated user - fetch from database
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          product_id,
          color_id,
          size_id,
          quantity,
          product:product_id(title, price_original, price_discounted, slug),
          color:color_id(name, color_code),
          size:size_id(name, price_original, price_discounted)
        `)
        .eq('customer_id', user.id);

      if (error) throw error;

      // Fetch product images separately for each cart item
      const cartItemsWithImages = await Promise.all(
        (data || []).map(async (item) => {
          const { data: images, error: imagesError } = await supabase
            .from('product_images')
            .select('image_url, is_primary')
            .eq('product_id', item.product_id)
            .eq('color_id', item.color_id)
            .order('is_primary', { ascending: false });

          if (imagesError) {
            console.error('Error fetching product images:', imagesError);
            return {
              ...item,
              product: {
                ...item.product,
                image_url: "/placeholder.svg"
              },
              product_images: []
            };
          }

          const primaryImage = images?.find(img => img.is_primary) || images?.[0];
          
          return {
            ...item,
            product: {
              ...item.product,
              image_url: primaryImage?.image_url || "/placeholder.svg"
            },
            product_images: images || []
          };
        })
      );

      return cartItemsWithImages as CartItem[];
    },
    enabled: true, // Always enabled for both guest and authenticated users
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, colorId, sizeId, quantity = 1 }: {
      productId: string;
      colorId: string;
      sizeId: string;
      quantity?: number;
    }) => {
      // Guest user - add to localStorage
      if (!user?.id) {
        addGuestCartItem(productId, colorId, sizeId, quantity);
        return;
      }

      // Authenticated user - add to database
      // Check if item already exists in cart
      const { data: existing } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('customer_id', user.id)
        .eq('product_id', productId)
        .eq('color_id', colorId)
        .eq('size_id', sizeId)
        .single();

      if (existing) {
        // Update quantity if item exists
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id);
        
        if (error) throw error;
      } else {
        // Insert new item
        const { error } = await supabase
          .from('cart_items')
          .insert({
            customer_id: user.id,
            product_id: productId,
            color_id: colorId,
            size_id: sizeId,
            quantity
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      logInfo('cart_item_added', { userId: user?.id || 'guest' });
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart.",
      });
    },
    onError: (error) => {
      logError('cart_add_failed', { error: error.message, userId: user?.id || 'guest' });
      toast({
        title: "Error",
        description: "Failed to add item to cart.",
        variant: "destructive"
      });
    }
  });

  // Update cart item mutation
  const updateCartMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      // Guest user - update in localStorage
      if (!user?.id) {
        updateGuestCartItem(itemId, quantity);
        return;
      }

      // Authenticated user - update in database
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      logInfo('cart_item_updated', { userId: user?.id || 'guest' });
    },
    onError: (error) => {
      logError('cart_update_failed', { error: error.message, userId: user?.id || 'guest' });
      toast({
        title: "Error",
        description: "Failed to update cart item.",
        variant: "destructive"
      });
    }
  });

  // Remove from cart mutation
  const removeFromCartMutation = useMutation({
    mutationFn: async (itemId: string) => {
      // Guest user - remove from localStorage
      if (!user?.id) {
        removeGuestCartItem(itemId);
        return;
      }

      // Authenticated user - remove from database
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      logInfo('cart_item_removed', { userId: user?.id || 'guest' });
      toast({
        title: "Removed from cart",
        description: "Item has been removed from your cart.",
      });
    },
    onError: (error) => {
      logError('cart_remove_failed', { error: error.message, userId: user?.id || 'guest' });
      toast({
        title: "Error",
        description: "Failed to remove item from cart.",
        variant: "destructive"
      });
    }
  });

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      // Guest user - clear localStorage
      if (!user?.id) {
        clearGuestCart();
        return;
      }

      // Authenticated user - clear database
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('customer_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      logInfo('cart_cleared', { userId: user?.id || 'guest' });
    }
  });

  // Calculate totals using size-specific pricing
  const cartTotal = cartItems.reduce((total, item) => {
    // Use size-specific price if available, otherwise fall back to product price
    const sizePrice = item.size.price_discounted || item.size.price_original;
    const productPrice = item.product.price_discounted || item.product.price_original;
    const finalPrice = sizePrice || productPrice;
    
    return total + (finalPrice * item.quantity);
  }, 0);

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return {
    cartItems,
    cartTotal,
    cartCount,
    isLoading,
    error,
    addToCart: addToCartMutation.mutate,
    updateQuantity: updateCartMutation.mutate,
    removeFromCart: removeFromCartMutation.mutate,
    clearCart: clearCartMutation.mutate,
    getCartTotal: () => cartTotal,
    getCartCount: () => cartCount,
    isAddingToCart: addToCartMutation.isPending,
    isUpdatingCart: updateCartMutation.isPending,
    isRemovingFromCart: removeFromCartMutation.isPending,
  };
};
