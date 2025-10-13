import { ScrollArea } from "./ui/scroll-area";
import { ProductCard } from "./ProductCard";
import { ProductDetail } from "./ProductDetail";
import { OptionsBar } from "./OptionsBar";
import { ProductCard as ProductCardType } from "@/utils/storage";

interface ProductsPanelProps {
  products: ProductCardType[];
  selectedProductId: number | null;
  detailMode: boolean;
  facets?: Record<string, string[]>;
  onProductClick: (id: number) => void;
  onBackToList: () => void;
  onOptionClick: (column: string, option: string) => void;
}

export function ProductsPanel({
  products,
  selectedProductId,
  detailMode,
  facets,
  onProductClick,
  onBackToList,
  onOptionClick,
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

      {/* Options Bar for filtering */}
      <OptionsBar facets={facets} onOptionClick={onOptionClick} />

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {products.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No products to display</p>
              <p className="text-xs mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => onProductClick(product.id)}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
