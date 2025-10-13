import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';

interface ProductDetailProps {
  product: any;
  onBack: () => void;
}

export function ProductDetail({ product, onBack }: ProductDetailProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to List
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <Card className="overflow-hidden">
          {product.image_url && (
            <div className="aspect-video w-full bg-muted">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6 space-y-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
              {product.brand && (
                <p className="text-muted-foreground">{product.brand}</p>
              )}
            </div>

            {product.price && (
              <div className="text-3xl font-bold text-primary">
                ${product.price.toLocaleString()}
              </div>
            )}

            {product.category && (
              <div>
                <Badge variant="secondary">{product.category}</Badge>
              </div>
            )}

            {product.color && (
              <div>
                <span className="text-sm font-medium">Color: </span>
                <span className="text-sm">{product.color}</span>
              </div>
            )}

            {product.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{product.description}</p>
              </div>
            )}

            {product.tags && product.tags.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {product.selling_quantity && (
              <div className="text-sm text-muted-foreground">
                {product.selling_quantity} sold
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
