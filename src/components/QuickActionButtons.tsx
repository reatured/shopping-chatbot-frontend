import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

interface QuickActionButtonsProps {
  actions: string[];
  onActionClick: (action: string) => void;
}

export const QuickActionButtons = ({ actions, onActionClick }: QuickActionButtonsProps) => {
  return (
    <div className="px-3 md:px-4 py-2 md:py-3 border-t bg-background/95 backdrop-blur animate-in slide-in-from-bottom duration-200">
      <div className="max-w-3xl mx-auto">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => onActionClick(action)}
              className="flex items-center gap-1.5 md:gap-2 whitespace-nowrap flex-shrink-0 text-xs md:text-sm h-8 md:h-9 px-3 md:px-4"
            >
              <Zap className="h-3 w-3 md:h-4 md:w-4" />
              {action}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
