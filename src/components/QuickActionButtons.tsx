import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Zap } from "lucide-react";

interface QuickActionButtonsProps {
  actions: string[];
  onActionClick: (action: string) => void;
  isLoading?: boolean;
}

export const QuickActionButtons = ({
  actions,
  onActionClick,
  isLoading = false
}: QuickActionButtonsProps) => {
  return (
    <div
      className="px-4 py-3 border-t bg-background/95 backdrop-blur animate-in slide-in-from-bottom duration-200"
      role="region"
      aria-label="Quick action buttons"
    >
      <div className="max-w-3xl mx-auto">
        <div className="flex gap-2 overflow-x-auto pb-1 -webkit-overflow-scrolling-touch [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {isLoading ? (
            // Show skeleton loading state
            <>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-8 w-24 flex-shrink-0 rounded-md" />
              ))}
            </>
          ) : (
            // Show actual buttons
            actions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => onActionClick(action)}
                className="flex items-center gap-2 whitespace-nowrap flex-shrink-0"
                aria-label={`Browse ${action}`}
              >
                <Zap className="h-4 w-4" />
                {action}
              </Button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
