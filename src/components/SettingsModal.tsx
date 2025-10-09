import { Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface SettingsModalProps {
  mode: 'anthropic' | 'perplexity';
  onModeChange: (mode: 'anthropic' | 'perplexity') => void;
  apiUrl: string;
}

export const SettingsModal = ({ mode, onModeChange, apiUrl }: SettingsModalProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Settings & Debug</DialogTitle>
          <DialogDescription>
            Configure AI mode and view debug information
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Mode Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">AI Mode</Label>
            <RadioGroup value={mode} onValueChange={(value) => onModeChange(value as 'anthropic' | 'perplexity')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="anthropic" id="anthropic" />
                <Label htmlFor="anthropic" className="font-normal cursor-pointer">
                  Anthropic (Claude)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="perplexity" id="perplexity" />
                <Label htmlFor="perplexity" className="font-normal cursor-pointer">
                  Perplexity (Search)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Debug Information */}
          <div className="space-y-3 pt-4 border-t">
            <Label className="text-base font-semibold">Debug Information</Label>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Mode:</span>
                <span className="font-medium">{mode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">API URL:</span>
                <span className="font-mono text-xs truncate max-w-[300px]">{apiUrl}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="text-green-600 font-medium">Connected</span>
              </div>
            </div>
          </div>

          {/* Additional Debug Info */}
          <div className="p-3 bg-muted rounded-lg text-xs font-mono space-y-1">
            <div>User Agent: {navigator.userAgent.substring(0, 50)}...</div>
            <div>Timestamp: {new Date().toISOString()}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};