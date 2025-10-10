import { ProductCard } from "./ProductCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search } from "lucide-react";
import { ConversationStage } from "@/config/prompts";

interface ProductsPanelProps {
  currentStage: ConversationStage;
  productName: string;
  onBackToSearch: () => void;
}

export const ProductsPanel = ({ currentStage, productName, onBackToSearch }: ProductsPanelProps) => {
  // Empty product cards for now
  const emptyCards = Array.from({ length: 6 }, (_, i) => i);

  // Stage 2: Product Detail View
  if (currentStage === 2) {
    return (
      <div className="hidden lg:flex lg:w-80 xl:w-96 border-l flex-col h-full">
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
          {productName && (
            <h2 className="font-semibold text-lg text-center">{productName}</h2>
          )}
        </div>

        {/* Product Detail Content */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {/* Product Image Placeholder */}
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Product Image</p>
            </div>

            {/* Product Details */}
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-2">Product Details</h3>
                <p className="text-sm text-muted-foreground">
                  Detailed information about this product will appear here.
                </p>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-1">Price</h4>
                <p className="text-lg font-semibold">$0.00</p>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-1">Description</h4>
                <p className="text-sm text-muted-foreground">
                  Product description will be displayed here.
                </p>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-1">Specifications</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Feature 1</li>
                  <li>• Feature 2</li>
                  <li>• Feature 3</li>
                </ul>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Stage 0 & 1: Product Cards View
  return (
    <div className="hidden lg:flex lg:w-80 xl:w-96 border-l flex-col h-full">
      <div className="border-b p-4">
        {currentStage === 1 && productName ? (
          <>
            <div className="flex items-center gap-2 mb-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-semibold text-lg">Searching for</h2>
            </div>
            <p className="text-base font-medium text-primary">"{productName}"</p>
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
          {emptyCards.map((index) => (
            <ProductCard key={index} isEmpty />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
