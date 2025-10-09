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

interface SettingsModalProps {
  apiUrl: string;
}

export const SettingsModal = ({ apiUrl }: SettingsModalProps) => {
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
            View API configuration and debug information
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* API Configuration */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">API Configuration</Label>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Model:</span>
                <span className="font-medium">Claude (Anthropic)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Endpoint:</span>
                <span className="font-mono text-xs truncate max-w-[300px]">{apiUrl}/api/chat/anthropic/stream</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Streaming:</span>
                <span className="text-green-600 font-medium">Enabled</span>
              </div>
            </div>
          </div>

          {/* Debug Information */}
          <div className="space-y-3 pt-4 border-t">
            <Label className="text-base font-semibold">Debug Information</Label>
            <div className="p-3 bg-muted rounded-lg text-xs font-mono space-y-1">
              <div>User Agent: {navigator.userAgent.substring(0, 50)}...</div>
              <div>Timestamp: {new Date().toISOString()}</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};