import { Card, CardContent } from "./ui/card";
import { ProductCard as ProductCardType } from "@/utils/storage";

interface ProductCardProps {
  product: ProductCardType;
  onClick: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
      {product.image_url && (
        <div className="aspect-square w-full overflow-hidden">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <CardContent className="p-3">
        <h3 className="font-semibold text-sm truncate">{product.name}</h3>
        {product.brand && (
          <p className="text-xs text-muted-foreground">{product.brand}</p>
        )}
        {product.price && (
          <p className="font-bold text-primary mt-1">${product.price.toLocaleString()}</p>
        )}
        {product.color && (
          <span className="text-xs text-muted-foreground">{product.color}</span>
        )}
      </CardContent>
    </Card>
  );
}
