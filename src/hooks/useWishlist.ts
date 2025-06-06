
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface WishlistItem {
  id: string;
  product_id: string;
  color_id: string;
  size_id: string;
  created_at: string;
  product: {
    id: string;
    title: string;
    slug: string;
    price_original: number;
    price_discounted?: number;
  };
  color: {
    id: string;
    name: string;
    color_code: string;
  };
  size: {
    id: string;
    name: string;
  };
}

export const useWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchWishlist = async () => {
    if (!user) {
      setWishlistItems([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          id,
          product_id,
          color_id,
          size_id,
          created_at
        `)
        .eq('customer_id', user.id);

      if (error) throw error;

      // Fetch related data separately
      const wishlistWithDetails = await Promise.all(
        (data || []).map(async (item) => {
          // Fetch product details
          const { data: product } = await supabase
            .from('products')
            .select('id, title, slug, price_original, price_discounted')
            .eq('id', item.product_id)
            .single();

          // Fetch color details
          const { data: color } = await supabase
            .from('product_colors')
            .select('id, name, color_code')
            .eq('id', item.color_id)
            .single();

          // Fetch size details
          const { data: size } = await supabase
            .from('product_sizes')
            .select('id, name')
            .eq('id', item.size_id)
            .single();

          return {
            ...item,
            product: product || { id: '', title: '', slug: '', price_original: 0 },
            color: color || { id: '', name: '', color_code: '' },
            size: size || { id: '', name: '' }
          };
        })
      );

      setWishlistItems(wishlistWithDetails);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to load wishlist items.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addToWishlist = async (productId: string, colorId: string, sizeId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to add items to your wishlist.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('wishlists')
        .insert({
          customer_id: user.id,
          product_id: productId,
          color_id: colorId,
          size_id: sizeId
        });

      if (error) throw error;

      toast({
        title: "Added to Wishlist",
        description: "Item has been added to your wishlist.",
      });

      fetchWishlist();
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to add item to wishlist.",
        variant: "destructive"
      });
    }
  };

  const removeFromWishlist = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: "Removed from Wishlist",
        description: "Item has been removed from your wishlist.",
      });

      fetchWishlist();
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  return {
    wishlistItems,
    isLoading,
    addToWishlist,
    removeFromWishlist,
    refetch: fetchWishlist
  };
};
