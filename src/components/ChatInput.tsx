import { useState, useRef } from "react";
import { Camera, Send, X } from "lucide-react";
import { Button } from "./ui/button";
import { convertImageToBase64 } from "@/services/api";
import { toast } from "sonner";

interface ChatInputProps {
  onSendMessage: (message: string, image?: string, imageMediaType?: string) => void;
  disabled: boolean;
}

export const ChatInput = ({ onSendMessage, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<{
    data: string;
    mediaType: string;
    filename: string;
    preview: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error("Only JPEG, PNG, and WebP images are supported");
      return;
    }

    try {
      const { data, mediaType, filename } = await convertImageToBase64(file);
      const preview = URL.createObjectURL(file);
      setSelectedImage({ data, mediaType, filename, preview });
    } catch (error) {
      toast.error("Failed to process image");
    }
  };

  const handleRemoveImage = () => {
    if (selectedImage?.preview) {
      URL.revokeObjectURL(selectedImage.preview);
    }
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSend = () => {
    if (!message.trim() && !selectedImage) return;

    // If only image is uploaded without text, provide helpful default message
    const messageToSend = message.trim() ||
      (selectedImage ? "I uploaded this image. Can you help me find similar products?" : "");

    if (selectedImage) {
      console.log('📤 Uploading image for product search...');
    }

    onSendMessage(
      messageToSend,
      selectedImage?.data,
      selectedImage?.mediaType
    );

    setMessage("");
    handleRemoveImage();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-gray-200 p-4 glass">
      {selectedImage && (
        <div className="mb-3 flex items-start gap-2 p-2 glass rounded-lg w-fit">
          <div className="relative">
            <img
              src={selectedImage.preview}
              alt="Preview"
              className="w-[100px] h-[100px] object-cover rounded border border-white/20"
            />
            {/* Badge to indicate AI search will be performed */}
            <div className="absolute bottom-0 right-0 bg-blue-500 text-white text-xs px-1 py-0.5 rounded-tl">
              AI Search
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">{selectedImage.filename}</p>
            <p className="text-xs text-blue-600 mt-1">Will search for similar products</p>
            <Button
              onClick={handleRemoveImage}
              variant="ghost"
              size="icon"
              className="h-6 w-6 mt-1"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-end gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageSelect}
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          disabled={disabled}
        />
        
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="ghost"
          size="icon"
          className="glass-hover flex-shrink-0"
          disabled={disabled}
        >
          <Camera className="w-5 h-5" />
        </Button>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about products..."
          className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-400 min-h-[48px] max-h-[120px]"
          disabled={disabled}
          rows={1}
        />

        <Button
          onClick={handleSend}
          disabled={disabled || (!message.trim() && !selectedImage)}
          className="flex-shrink-0 bg-gray-800 hover:bg-gray-900 text-white"
          size="icon"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};
