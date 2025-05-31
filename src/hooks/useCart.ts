
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useLogging } from '@/hooks/useLogging';

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

  // Fetch cart items
  const { data: cartItems = [], isLoading, error } = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('[Cart] No user ID found');
        return [];
      }
      
      console.log('[Cart] Fetching cart items for user:', user.id);
      
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
          size:size_id(name)
        `)
        .eq('customer_id', user.id);

      if (error) {
        console.error('[Cart] Error fetching cart items:', error);
        throw error;
      }

      console.log('[Cart] Raw cart data:', data);

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

      console.log('[Cart] Processed cart items:', cartItemsWithImages);
      return cartItemsWithImages as CartItem[];
    },
    enabled: !!user?.id,
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, colorId, sizeId, quantity = 1 }: {
      productId: string;
      colorId: string;
      sizeId: string;
      quantity?: number;
    }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      console.log('[Cart] Adding to cart:', { productId, colorId, sizeId, quantity, customerId: user.id });

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
        console.log('[Cart] Item exists, updating quantity:', existing);
        // Update quantity if item exists
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id);
        
        if (error) {
          console.error('[Cart] Error updating cart item:', error);
          throw error;
        }
        console.log('[Cart] Successfully updated cart item quantity');
      } else {
        console.log('[Cart] Item does not exist, inserting new item');
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
        
        if (error) {
          console.error('[Cart] Error inserting cart item:', error);
          throw error;
        }
        console.log('[Cart] Successfully added new cart item');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      logInfo('cart_item_added', { userId: user?.id });
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart.",
      });
    },
    onError: (error) => {
      console.error("[Cart] Add to cart error:", error);
      logError('cart_add_failed', { error: error.message, userId: user?.id });
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
      console.log('[Cart] Updating cart item:', { itemId, quantity });
      
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId);
      
      if (error) {
        console.error('[Cart] Error updating cart item:', error);
        throw error;
      }
      console.log('[Cart] Successfully updated cart item');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      logInfo('cart_item_updated', { userId: user?.id });
    },
    onError: (error) => {
      console.error('[Cart] Update cart error:', error);
      logError('cart_update_failed', { error: error.message, userId: user?.id });
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
      console.log('[Cart] Removing cart item:', itemId);
      
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);
      
      if (error) {
        console.error('[Cart] Error removing cart item:', error);
        throw error;
      }
      console.log('[Cart] Successfully removed cart item');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      logInfo('cart_item_removed', { userId: user?.id });
      toast({
        title: "Removed from cart",
        description: "Item has been removed from your cart.",
      });
    },
    onError: (error) => {
      console.error('[Cart] Remove from cart error:', error);
      logError('cart_remove_failed', { error: error.message, userId: user?.id });
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
      if (!user?.id) throw new Error('User not authenticated');
      
      console.log('[Cart] Clearing cart for user:', user.id);
      
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('customer_id', user.id);
      
      if (error) {
        console.error('[Cart] Error clearing cart:', error);
        throw error;
      }
      console.log('[Cart] Successfully cleared cart');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      logInfo('cart_cleared', { userId: user?.id });
    }
  });

  // Calculate totals
  const cartTotal = cartItems.reduce((total, item) => {
    const price = item.product.price_discounted || item.product.price_original;
    return total + (price * item.quantity);
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
