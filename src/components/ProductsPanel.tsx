import { useState, useEffect } from "react";
import { ProductCard } from "./ProductCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search, X } from "lucide-react";
import { ConversationStage } from "@/config/prompts";
import { Product, fetchProductsByName, getProductById, sortProducts } from "@/services/productApi";
import { toast } from "sonner";

interface ProductsPanelProps {
  currentStage: ConversationStage;
  productName: string;
  selectedProductId: number | null;
  onBackToSearch: () => void;
  onProductClick: (productId: number) => void;
  apiUrl?: string;
  categories?: string[];
  activeFilters?: Record<string, string>;
  onRemoveFilter?: (filterKey: string) => void;
  onClearFilters?: () => void;
}

export const ProductsPanel = ({
  currentStage,
  productName,
  selectedProductId,
  onBackToSearch,
  onProductClick,
  apiUrl,
  categories = ['car', 'backpack'],
  activeFilters = {},
  onRemoveFilter,
  onClearFilters
}: ProductsPanelProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch products when in Stage 1 and productName or filters change
  useEffect(() => {
    if (currentStage === 1 && productName) {
      console.log('🔍 Stage 1 detected with productName:', productName, 'and filters:', activeFilters, '(triggered by text or image search)');
      fetchProducts();
    }
  }, [currentStage, productName, activeFilters]);

  // Fetch single product when in Stage 2
  useEffect(() => {
    if (currentStage === 2 && selectedProductId) {
      fetchProductDetails();
    }
  }, [currentStage, selectedProductId]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Fetching products for:', productName, 'with categories:', categories, 'and filters:', activeFilters);
      const fetchedProducts = await fetchProductsByName(productName, apiUrl, categories, activeFilters);

      // Sort by popular for better user experience
      const sortedProducts = sortProducts(fetchedProducts, 'popular');
      setProducts(sortedProducts);

      console.log('✅ Fetched', sortedProducts.length, 'products');
    } catch (err) {
      console.error('❌ Error fetching products:', err);
      setError('Failed to load products');
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

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

  // Empty product cards for loading state
  const emptyCards = Array.from({ length: 6 }, (_, i) => i);

  // Hide panel in Stage 0
  if (currentStage === 0) {
    return null;
  }

  // Stage 2: Product Detail View
  if (currentStage === 2) {
    return (
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
        </ScrollArea>
      </div>
    );
  }

  // Stage 1: Product Cards View
  const hasFilters = Object.keys(activeFilters).length > 0;

  return (
    <div className="hidden lg:flex lg:w-80 xl:w-96 border-l flex-col h-full animate-in slide-in-from-right duration-300">
      <div className="border-b p-4">
        {currentStage === 1 && productName ? (
          <>
            <div className="flex items-center gap-2 mb-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-semibold text-lg">Searching for</h2>
            </div>
            <p className="text-base font-medium text-primary">"{productName}"</p>
            {!loading && products.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {products.length} products found
              </p>
            )}

            {/* Active Filters */}
            {hasFilters && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">Active Filters:</p>
                  {onClearFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClearFilters}
                      className="h-6 text-xs"
                    >
                      Clear All
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(activeFilters).map(([key, value]) => (
                    <div
                      key={key}
                      className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-xs"
                    >
                      <span className="font-medium capitalize">{key}:</span>
                      <span>{value}</span>
                      {onRemoveFilter && (
                        <button
                          onClick={() => onRemoveFilter(key)}
                          className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                          aria-label={`Remove ${key} filter`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <h2 className="font-semibold text-lg">Suggested Products</h2>
            <p className="text-sm text-muted-foreground">Products based on your conversation</p>
          </>
        )}
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {loading ? (
            // Show loading skeletons
            emptyCards.map((index) => (
              <ProductCard key={index} isEmpty />
            ))
          ) : error ? (
            // Show error message
            <div className="text-center py-8">
              <p className="text-sm text-destructive mb-3">{error}</p>
              <Button onClick={fetchProducts} size="sm">
                Retry
              </Button>
            </div>
          ) : products.length > 0 ? (
            // Show product cards
            products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={onProductClick}
              />
            ))
          ) : (
            // No products found
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                No products found for "{productName}"
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
