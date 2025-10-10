import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Product } from "@/services/productApi";

interface ProductCardProps {
  product?: Product;
  isEmpty?: boolean;
  onViewDetails?: (productId: number) => void;
}

export const ProductCard = ({ product, isEmpty = false, onViewDetails }: ProductCardProps) => {
  // Loading skeleton
  if (isEmpty || !product) {
    return (
      <Card className="overflow-hidden">
        <Skeleton className="w-full h-48" />
        <CardContent className="p-4 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-4 w-1/4" />
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Skeleton className="h-9 w-full" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
      {/* Product Image */}
      <div
        className="aspect-square bg-muted overflow-hidden"
        onClick={() => onViewDetails?.(product.id)}
      >
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-sm text-muted-foreground">No image</p>
          </div>
        )}
      </div>

      {/* Product Info */}
      <CardContent className="p-3 md:p-4">
        <h3 className="font-semibold text-sm md:text-base truncate" title={product.name}>
          {product.name}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">{product.brand}</p>
        <div className="flex items-center gap-2 mt-2">
          <p className="font-semibold text-base md:text-lg">${product.price.toLocaleString()}</p>
          {product.color && (
            <span className="text-xs bg-muted px-2 py-0.5 md:py-1 rounded">{product.color}</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
          {product.description}
        </p>
      </CardContent>

      {/* View Details Button */}
      <CardFooter className="p-3 md:p-4 pt-0">
        <Button
          className="w-full text-sm h-9"
          onClick={() => onViewDetails?.(product.id)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};
