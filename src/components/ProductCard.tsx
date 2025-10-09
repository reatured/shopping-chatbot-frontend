import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  isEmpty?: boolean;
}

export const ProductCard = ({ isEmpty = true }: ProductCardProps) => {
  if (isEmpty) {
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
    <Card className="overflow-hidden">
      <div className="aspect-square bg-muted" />
      <CardContent className="p-4">
        <h3 className="font-semibold">Product Name</h3>
        <p className="text-sm text-muted-foreground">Product Description</p>
        <p className="font-semibold mt-2">$0.00</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full">View Details</Button>
      </CardFooter>
    </Card>
  );
};
