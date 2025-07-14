
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProductNavigationProps {
  currentSlug: string;
  categoryId?: string;
  subCategoryId?: string;
}

const ProductNavigation = ({ currentSlug, categoryId, subCategoryId }: ProductNavigationProps) => {
  const navigate = useNavigate();
  const [prevProduct, setPrevProduct] = React.useState<{ slug: string; title: string } | null>(null);
  const [nextProduct, setNextProduct] = React.useState<{ slug: string; title: string } | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchAdjacentProducts = async () => {
      try {
        setIsLoading(true);
        
        // This is a simplified approach - in a real app you'd want to optimize this
        // by creating a proper API endpoint or using pagination
        const { data: products, error } = await import('@/integrations/supabase/client').then(({ supabase }) => 
          supabase
            .from('products')
            .select('slug, title, created_at')
            .eq('category_id', categoryId || '')
            .eq('subcategory_id', subCategoryId || '')
            .order('created_at', { ascending: false })
        );

        if (error) throw error;

        if (products && products.length > 0) {
          const currentIndex = products.findIndex(p => p.slug === currentSlug);
          
          if (currentIndex > 0) {
            setPrevProduct({
              slug: products[currentIndex - 1].slug,
              title: products[currentIndex - 1].title
            });
          }
          
          if (currentIndex < products.length - 1 && currentIndex !== -1) {
            setNextProduct({
              slug: products[currentIndex + 1].slug,
              title: products[currentIndex + 1].title
            });
          }
        }
      } catch (error) {
        console.error('Error fetching adjacent products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentSlug && categoryId && subCategoryId) {
      fetchAdjacentProducts();
    }
  }, [currentSlug, categoryId, subCategoryId]);

  if (isLoading || (!prevProduct && !nextProduct)) {
    return null;
  }

  return (
    <div className="flex justify-between items-center py-6 border-t border-gray-200">
      <div className="flex-1">
        {prevProduct && (
          <Button
            variant="ghost"
            onClick={() => navigate(`/product/${prevProduct.slug}`)}
            className="flex items-center gap-2 text-left hover:bg-gray-50 p-4 h-auto"
          >
            <ChevronLeft className="h-4 w-4 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-sm text-gray-500">Previous</div>
              <div className="font-medium truncate">{prevProduct.title}</div>
            </div>
          </Button>
        )}
      </div>
      
      <div className="flex-1 text-right">
        {nextProduct && (
          <Button
            variant="ghost"
            onClick={() => navigate(`/product/${nextProduct.slug}`)}
            className="flex items-center gap-2 text-right hover:bg-gray-50 p-4 h-auto justify-end"
          >
            <div className="min-w-0">
              <div className="text-sm text-gray-500">Next</div>
              <div className="font-medium truncate">{nextProduct.title}</div>
            </div>
            <ChevronRight className="h-4 w-4 flex-shrink-0" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProductNavigation;
