
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
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          product_id,
          color_id,
          size_id,
          quantity,
          product:products(title, price_original, price_discounted, slug),
          color:product_colors(name, color_code),
          size:product_sizes(name),
          product_images!inner(image_url, is_primary)
        `)
        .eq('customer_id', user.id)
        .eq('product_images.color_id', 'color_id');

      if (error) throw error;
      return data as CartItem[];
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
      if (!user?.id) throw new Error('User not authenticated');

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
      logInfo('cart_item_added', { userId: user?.id });
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart.",
      });
    },
    onError: (error) => {
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
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      logInfo('cart_item_updated', { userId: user?.id });
    },
    onError: (error) => {
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
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);
      
      if (error) throw error;
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
      
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('customer_id', user.id);
      
      if (error) throw error;
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
    updateCartItem: updateCartMutation.mutate,
    removeFromCart: removeFromCartMutation.mutate,
    clearCart: clearCartMutation.mutate,
    isAddingToCart: addToCartMutation.isPending,
    isUpdatingCart: updateCartMutation.isPending,
    isRemovingFromCart: removeFromCartMutation.isPending,
  };
};
