import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Loader2 } from "lucide-react";
import { getOptions } from "@/services/chatApi";
import { toast } from "sonner";

interface MoreOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  column: string;
  onOptionSelect: (option: string) => void;
}

export function MoreOptionsModal({
  isOpen,
  onClose,
  column,
  onOptionSelect,
}: MoreOptionsModalProps) {
  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && column) {
      loadOptions();
    }
  }, [isOpen, column]);

  const loadOptions = async () => {
    setLoading(true);
    try {
      const fetchedOptions = await getOptions(column);
      // Filter out "More" option
      setOptions(fetchedOptions.filter(opt => opt !== "More"));
    } catch (error) {
      toast.error(`Failed to load options for ${column}`);
      console.error("Error loading options:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionClick = (option: string) => {
    onOptionSelect(option);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            All {column.charAt(0).toUpperCase() + column.slice(1)} Options
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-2 pr-4">
                {options.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No options available
                  </p>
                ) : (
                  options.map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleOptionClick(option)}
                    >
                      {option}
                    </Button>
                  ))
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
