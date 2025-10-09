import { ProductCard } from "./ProductCard";
import { ScrollArea } from "@/components/ui/scroll-area";

export const ProductsPanel = () => {
  // Empty product cards for now
  const emptyCards = Array.from({ length: 6 }, (_, i) => i);

  return (
    <div className="hidden lg:flex lg:w-80 xl:w-96 border-l flex-col h-full">
      <div className="border-b p-4">
        <h2 className="font-semibold text-lg">Suggested Products</h2>
        <p className="text-sm text-muted-foreground">Products based on your conversation</p>
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
