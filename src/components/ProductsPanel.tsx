import { useState, useEffect } from "react";
import { ProductCard } from "./ProductCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ArrowLeft, Search } from "lucide-react";
import { Product, getProductById } from "@/services/productApi";
import { toast } from "sonner";

interface ProductsPanelProps {
  products: Product[];
  selectedProductId: number | null;
  onBackToSearch: () => void;
  onProductClick: (productId: number) => void;
  apiUrl?: string;
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
}

export const ProductsPanel = ({
  products,
  selectedProductId,
  onBackToSearch,
  onProductClick,
  apiUrl,
  mobileOpen,
  onMobileOpenChange
}: ProductsPanelProps) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use controlled state from parent if provided, otherwise use internal state
  const isOpen = mobileOpen !== undefined ? mobileOpen : false;
  const setIsOpen = onMobileOpenChange || (() => {});

  // Fetch product details when selectedProductId changes
  useEffect(() => {
    if (selectedProductId) {
      fetchProductDetails();
      setIsOpen(true); // Auto-open on mobile when product details are requested
    }
  }, [selectedProductId]);

  const fetchProductDetails = async () => {
    if (!selectedProductId) return;

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Fetching product details for ID:', selectedProductId);
      const product = await getProductById(selectedProductId, apiUrl);
      setSelectedProduct(product);
      console.log('✅ Fetched product:', product.name);
    } catch (err) {
      console.error('❌ Error fetching product details:', err);
      setError('Failed to load product details');
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  // Hide panel if no products and no selected product
  if (products.length === 0 && !selectedProductId) {
    return null;
  }

  // Product Detail Content Component (reusable for both mobile and desktop)
  const ProductDetailContent = () => (
    <>
      {loading ? (
        <div className="p-4 space-y-4">
          <div className="aspect-square bg-muted rounded-lg animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-6 bg-muted rounded animate-pulse w-1/2" />
          </div>
        </div>
      ) : error ? (
        <div className="p-4 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button onClick={fetchProductDetails} className="mt-4" size="sm">
            Retry
          </Button>
        </div>
      ) : selectedProduct ? (
        <div className="p-4 space-y-4">
          {/* Product Image */}
          <div className="aspect-square bg-muted rounded-lg overflow-hidden">
            {selectedProduct.image_url ? (
              <img
                src={selectedProduct.image_url}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-sm text-muted-foreground">No image available</p>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-1">Brand</h3>
              <p className="text-base font-medium">{selectedProduct.brand}</p>
            </div>

            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-1">Price</h3>
              <p className="text-2xl font-bold text-primary">
                ${selectedProduct.price.toLocaleString()}
              </p>
            </div>

            {selectedProduct.color && (
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-1">Color</h3>
                <p className="text-base">{selectedProduct.color}</p>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-1">Description</h3>
              <p className="text-sm leading-relaxed">{selectedProduct.description}</p>
            </div>

            {selectedProduct.tags && (
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-2">Features</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.tags.split(',').map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-muted px-2 py-1 rounded-md"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium capitalize">{selectedProduct.category}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-muted-foreground">Sales</span>
                <span className="font-medium">{selectedProduct.selling_quantity} sold</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-muted-foreground">Listed</span>
                <span className="font-medium">
                  {new Date(selectedProduct.publish_time).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 text-center">
          <p className="text-sm text-muted-foreground">No product selected</p>
        </div>
      )}
    </>
  );

  // Product List Content Component (reusable for both mobile and desktop)
  const ProductListContent = () => (
    <div className="p-4 space-y-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onViewDetails={(id) => {
            onProductClick(id);
            setIsOpen(false); // Close sheet when viewing details
          }}
        />
      ))}
    </div>
  );

  // Product Detail View
  if (selectedProductId) {
    return (
      <>
        {/* Mobile Sheet for Product Details */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="bottom" className="h-[85vh] lg:hidden p-0">
            <SheetHeader className="border-b p-4">
              <div className="flex items-center gap-2 mb-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onBackToSearch}
                  className="h-8 w-8"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <SheetTitle className="flex-1 text-center">
                  {selectedProduct?.name || 'Product Details'}
                </SheetTitle>
              </div>
            </SheetHeader>
            <ScrollArea className="h-[calc(85vh-80px)]">
              <ProductDetailContent />
            </ScrollArea>
          </SheetContent>
        </Sheet>

        {/* Desktop Sidebar for Product Details */}
        <div className="hidden lg:flex lg:w-80 xl:w-96 border-l flex-col h-full animate-in slide-in-from-right duration-300">
          {/* Header with Back Button */}
          <div className="border-b p-4">
            <div className="flex items-center gap-2 mb-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBackToSearch}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </div>
            {selectedProduct && (
              <h2 className="font-semibold text-lg text-center">{selectedProduct.name}</h2>
            )}
          </div>

          {/* Product Detail Content */}
          <ScrollArea className="flex-1">
            <ProductDetailContent />
          </ScrollArea>
        </div>
      </>
    );
  }

  // Product List View
  return (
    <>
      {/* Mobile Sheet for Product List */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="bottom" className="h-[85vh] lg:hidden p-0">
          <SheetHeader className="border-b p-4">
            <div className="flex items-center gap-2 mb-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <SheetTitle className="text-base">Products</SheetTitle>
            </div>
            {products.length > 0 && (
              <p className="text-xs text-muted-foreground text-left">
                {products.length} products found
              </p>
            )}
          </SheetHeader>
          <ScrollArea className="h-[calc(85vh-100px)]">
            <ProductListContent />
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar for Product List */}
      <div className="hidden lg:flex lg:w-80 xl:w-96 border-l flex-col h-full animate-in slide-in-from-right duration-300">
        <div className="border-b p-4">
          <div className="flex items-center gap-2 mb-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold text-lg">Products</h2>
          </div>
          {products.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {products.length} products found
            </p>
          )}
        </div>
        <ScrollArea className="flex-1">
          <ProductListContent />
        </ScrollArea>
      </div>
    </>
  );
};
