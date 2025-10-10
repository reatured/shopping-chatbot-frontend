import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

interface QuickActionButtonsProps {
  actions: string[];
  onActionClick: (action: string) => void;
}

export const QuickActionButtons = ({ actions, onActionClick }: QuickActionButtonsProps) => {
  return (
    <div className="px-4 py-3 border-t bg-background/95 backdrop-blur animate-in slide-in-from-bottom duration-200">
      <div className="max-w-3xl mx-auto">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => onActionClick(action)}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <Zap className="h-4 w-4" />
              {action}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
