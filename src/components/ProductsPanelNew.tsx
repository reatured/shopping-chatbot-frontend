import { ScrollArea } from "./ui/scroll-area";
import { ProductCard } from "./ProductCard";
import { ProductDetail } from "./ProductDetail";
import { ProductCard as ProductCardType } from "@/utils/storage";

interface ProductsPanelProps {
  products: ProductCardType[];
  selectedProductId: number | null;
  detailMode: boolean;
  onProductClick: (id: number) => void;
  onBackToList: () => void;
}

export function ProductsPanel({
  products,
  selectedProductId,
  detailMode,
  onProductClick,
  onBackToList,
}: ProductsPanelProps) {
  const selectedProduct = products.find(p => p.id === selectedProductId);

  if (detailMode && selectedProduct) {
    return <ProductDetail product={selectedProduct} onBack={onBackToList} />;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Products ({products.length})</h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => onProductClick(product.id)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
