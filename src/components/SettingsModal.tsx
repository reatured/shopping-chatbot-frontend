import { useState } from "react";
import { Settings } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

interface SettingsModalProps {
  apiUrl: string;
  onApiUrlChange: (url: string) => void;
}

export function SettingsModal({ apiUrl, onApiUrlChange }: SettingsModalProps) {
  const [open, setOpen] = useState(false);
  const [localUrl, setLocalUrl] = useState(apiUrl);

  const handleSave = () => {
    onApiUrlChange(localUrl);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your API endpoint
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="api-url">API URL</Label>
            <Input
              id="api-url"
              value={localUrl}
              onChange={(e) => setLocalUrl(e.target.value)}
              placeholder="http://0.0.0.0:8000"
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
