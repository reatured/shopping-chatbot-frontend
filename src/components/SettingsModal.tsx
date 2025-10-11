import { Settings, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { API_URLS } from "@/config/api";
import { ConversationStage, STAGE_NAMES } from "@/config/prompts";

interface SettingsModalProps {
  apiUrl: string;
  onApiUrlChange: (url: string) => void;
  currentStage: ConversationStage;
  conversationSummary: string;
}

type ConnectionStatus = 'connected' | 'disconnected' | 'testing' | 'mixed-content';

export const SettingsModal = ({ apiUrl, onApiUrlChange, currentStage, conversationSummary }: SettingsModalProps) => {
  const [status, setStatus] = useState<ConnectionStatus>('testing');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const isLocal = apiUrl === API_URLS.LOCAL;

  const testConnection = async () => {
    setStatus('testing');
    setErrorMessage('');

    // Check for mixed content (HTTPS -> HTTP)
    const isHttps = window.location.protocol === 'https:';
    const isApiHttp = apiUrl.startsWith('http://');
    
    if (isHttps && isApiHttp) {
      setStatus('mixed-content');
      setErrorMessage('Mixed content blocked: HTTPS page cannot connect to HTTP API');
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(apiUrl, {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      setStatus('connected');
    } catch (error) {
      setStatus('disconnected');
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          setErrorMessage('Connection timeout - backend not responding');
        } else {
          setErrorMessage(error.message);
        }
      } else {
        setErrorMessage('Failed to connect to backend');
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      testConnection();
    }
  }, [isOpen, apiUrl]);

  const handleEnvironmentToggle = (checked: boolean) => {
    const newUrl = checked ? API_URLS.LOCAL : API_URLS.PRODUCTION;
    onApiUrlChange(newUrl);
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'connected':
        return <Badge variant="default" className="bg-green-600">Connected</Badge>;
      case 'disconnected':
        return <Badge variant="destructive">Disconnected</Badge>;
      case 'testing':
        return <Badge variant="secondary">Testing...</Badge>;
      case 'mixed-content':
        return <Badge variant="destructive">Mixed Content</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Settings & Debug</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            View API configuration and connection status
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
          {/* Environment Toggle */}
          <div className="space-y-2 sm:space-y-3">
            <Label className="text-sm sm:text-base font-semibold">Backend Environment</Label>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 bg-muted rounded-lg">
              <div className="space-y-1 flex-1 min-w-0">
                <div className="font-medium text-sm sm:text-base">
                  {isLocal ? 'Local Development' : 'Production'}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground font-mono break-all">
                  {apiUrl}
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto">
                <span className="text-xs sm:text-sm text-muted-foreground">Local</span>
                <Switch
                  checked={isLocal}
                  onCheckedChange={handleEnvironmentToggle}
                />
              </div>
            </div>
          </div>

          {/* Connection Status */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-sm sm:text-base font-semibold">Connection Status</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={testConnection}
                disabled={status === 'testing'}
                className="text-xs sm:text-sm"
              >
                <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 ${status === 'testing' ? 'animate-spin' : ''}`} />
                Test
              </Button>
            </div>
            <div className="p-3 sm:p-4 bg-muted rounded-lg space-y-2 sm:space-y-3">
              <div className="flex justify-between items-center gap-2">
                <span className="text-xs sm:text-sm text-muted-foreground">Backend Status:</span>
                {getStatusBadge()}
              </div>

              {errorMessage && (
                <div className="p-2 sm:p-3 bg-destructive/10 border border-destructive/20 rounded text-xs sm:text-sm text-destructive">
                  <div className="font-semibold mb-1">Error:</div>
                  <div className="text-xs break-words">{errorMessage}</div>

                  {status === 'mixed-content' && (
                    <div className="mt-2 text-xs">
                      <div className="font-semibold mb-1">Solutions:</div>
                      <ul className="list-disc list-inside space-y-1 text-[10px] sm:text-xs">
                        <li className="break-words">Use ngrok: <code className="bg-black/20 px-1 rounded text-[10px]">ngrok http 8000</code></li>
                        <li className="break-words">Deploy backend to HTTPS service</li>
                        <li className="break-words">Test locally using HTTP for both</li>
                      </ul>
                    </div>
                  )}

                  {status === 'disconnected' && !errorMessage.includes('Mixed content') && (
                    <div className="mt-2 text-xs">
                      <div className="font-semibold mb-1">Check:</div>
                      <ul className="list-disc list-inside space-y-1 text-[10px] sm:text-xs">
                        <li>Backend server is running</li>
                        <li>API URL is correct</li>
                        <li>CORS is configured properly</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* API Configuration */}
          <div className="space-y-2 sm:space-y-3 pt-3 sm:pt-4 border-t">
            <Label className="text-sm sm:text-base font-semibold">API Configuration</Label>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between gap-2 sm:gap-4">
                <span className="text-muted-foreground">Model:</span>
                <span className="font-medium text-right">Claude (Anthropic)</span>
              </div>
              <div className="flex justify-between gap-2 sm:gap-4">
                <span className="text-muted-foreground shrink-0">Endpoint:</span>
                <span className="font-mono text-[10px] sm:text-xs text-right break-all">{apiUrl}/api/chat/anthropic/stream</span>
              </div>
              <div className="flex justify-between gap-2 sm:gap-4">
                <span className="text-muted-foreground">Streaming:</span>
                <span className="text-green-600 font-medium">Enabled</span>
              </div>
              <div className="flex justify-between gap-2 sm:gap-4">
                <span className="text-muted-foreground">Protocol:</span>
                <span className="font-medium">{window.location.protocol.toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* Conversation Stage Debug */}
          <div className="space-y-2 sm:space-y-3 pt-3 sm:pt-4 border-t">
            <Label className="text-sm sm:text-base font-semibold">Conversation Stage (Debug)</Label>
            <div className="p-3 sm:p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <span className="text-xs sm:text-sm text-muted-foreground">Current Stage:</span>
                <Badge variant="outline" className="text-sm sm:text-base">
                  Stage {currentStage}
                </Badge>
              </div>
              <div className="text-xs sm:text-sm font-medium mb-1 sm:mb-2">{STAGE_NAMES[currentStage]}</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground mb-2 sm:mb-3">
                {currentStage === 0 && "Bot is in general conversation mode"}
                {currentStage === 1 && "Bot is helping narrow down products"}
                {currentStage === 2 && "Bot is providing detailed product information"}
              </div>
              {conversationSummary && (
                <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-border">
                  <div className="text-[10px] sm:text-xs text-muted-foreground mb-1">Summary:</div>
                  <div className="text-xs sm:text-sm font-medium bg-background p-2 rounded border break-words">
                    {conversationSummary}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Debug Information */}
          <div className="space-y-2 sm:space-y-3 pt-3 sm:pt-4 border-t">
            <Label className="text-sm sm:text-base font-semibold">Environment</Label>
            <div className="p-2 sm:p-3 bg-muted rounded-lg text-[10px] sm:text-xs font-mono space-y-1">
              <div className="break-all">Origin: {window.location.origin}</div>
              <div className="break-all">User Agent: {navigator.userAgent.substring(0, 40)}...</div>
              <div>Timestamp: {new Date().toISOString()}</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};