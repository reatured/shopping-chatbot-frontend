import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { MoreOptionsModal } from "./MoreOptionsModal";
import { Filter, X } from "lucide-react";

export interface OptionsBarProps {
  facets?: Record<string, string[]>;
  onOptionClick: (column: string, option: string) => void;
  onClearFilters?: () => void;
}

export function OptionsBar({
  facets = {},
  onOptionClick,
  onClearFilters,
}: OptionsBarProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<string>("");

  const handleMoreClick = (column: string) => {
    setSelectedColumn(column);
    setModalOpen(true);
  };

  const handleOptionSelect = (option: string) => {
    if (selectedColumn) {
      onOptionClick(selectedColumn, option);
    }
  };

  const hasFacets = Object.keys(facets).length > 0;

  if (!hasFacets) {
    return null;
  }

  return (
    <>
      <div className="border-b p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Filter Options</h3>
          </div>
          {onClearFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-7 text-xs"
            >
              <X className="w-3 h-3 mr-1" />
              Clear
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {Object.entries(facets).map(([column, options]) => (
            <div key={column} className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase">
                {column}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {options.map((option, index) => {
                  const isMore = option === "More";

                  if (isMore) {
                    return (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => handleMoreClick(column)}
                      >
                        {option}...
                      </Button>
                    );
                  }

                  return (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => onOptionClick(column, option)}
                    >
                      {option}
                    </Badge>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <MoreOptionsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        column={selectedColumn}
        onOptionSelect={handleOptionSelect}
      />
    </>
  );
}
