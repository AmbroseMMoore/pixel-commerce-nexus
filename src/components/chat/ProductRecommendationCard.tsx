import { Link } from "react-router-dom";
import { ProductRecommendation } from "@/types/chat";
import { ExternalLink } from "lucide-react";

interface ProductRecommendationCardProps {
  recommendation: ProductRecommendation;
}

const ProductRecommendationCard = ({ recommendation }: ProductRecommendationCardProps) => {
  const { product, relevanceReason } = recommendation;
  
  // Get first image from first color variant
  const primaryImage = product.colorVariants?.[0]?.images?.[0] || "/placeholder.svg";
  
  // Get price
  const displayPrice = product.price.discounted || product.price.original;
  const hasDiscount = product.price.discounted && product.price.discounted < product.price.original;

  return (
    <Link 
      to={`/product/${product.slug}`}
      className="flex gap-3 p-3 bg-card border rounded-lg hover:shadow-md transition-shadow group"
    >
      {/* Product Image */}
      <div className="w-16 h-16 shrink-0 rounded-md overflow-hidden bg-muted">
        <img 
          src={primaryImage} 
          alt={product.title}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
          {product.title}
        </h4>
        
        {/* Price */}
        <div className="flex items-center gap-2 mt-1">
          <span className="font-semibold text-sm">₹{displayPrice}</span>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through">
              ₹{product.price.original}
            </span>
          )}
        </div>
        
        {/* Relevance Reason */}
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {relevanceReason}
        </p>
      </div>
      
      {/* View Icon */}
      <div className="shrink-0 self-center">
        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </Link>
  );
};

export default ProductRecommendationCard;
