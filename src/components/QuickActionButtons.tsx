import { Button } from "./ui/button";

interface QuickActionButtonsProps {
  actions: string[];
  onActionClick: (action: string) => void;
}

export function QuickActionButtons({ actions, onActionClick }: QuickActionButtonsProps) {
  if (actions.length === 0) return null;

  return (
    <div className="border-t px-4 py-3">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-wrap gap-2">
          {actions.slice(0, 4).map((action, index) => (
            <Button
              key={index}
              onClick={() => onActionClick(action)}
              variant="outline"
              size="sm"
            >
              {action}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
