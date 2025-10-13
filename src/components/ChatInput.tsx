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
    <div className="border-t border-gray-200 p-2 sm:p-3 md:p-4 glass w-full">
      {selectedImage && (
        <div className="mb-2 flex items-start gap-2 p-2 glass rounded-lg w-fit max-w-full">
          <div className="relative shrink-0">
            <img
              src={selectedImage.preview}
              alt="Preview"
              className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] object-cover rounded border border-white/20"
            />
            {/* Badge to indicate AI search will be performed */}
            <div className="absolute bottom-0 right-0 bg-blue-500 text-white text-[10px] sm:text-xs px-1 py-0.5 rounded-tl">
              AI Search
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{selectedImage.filename}</p>
            <p className="text-[10px] sm:text-xs text-blue-600 mt-0.5 sm:mt-1">Will search for similar products</p>
            <Button
              onClick={handleRemoveImage}
              variant="ghost"
              size="icon"
              className="h-5 w-5 sm:h-6 sm:w-6 mt-1"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-end gap-1 sm:gap-2 w-full min-w-0">
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
          className="glass-hover flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10"
          disabled={disabled}
        >
          <Camera className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
        </Button>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about products..."
          className="flex-1 min-w-0 bg-white border border-gray-300 rounded-lg px-2 py-2 sm:px-3 sm:py-2.5 text-xs sm:text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-400 min-h-[36px] sm:min-h-[44px] max-h-[100px] sm:max-h-[120px]"
          disabled={disabled}
          rows={1}
        />

        <Button
          onClick={handleSend}
          disabled={disabled || (!message.trim() && !selectedImage)}
          className="flex-shrink-0 bg-gray-800 hover:bg-gray-900 text-white h-9 w-9 sm:h-10 sm:w-10"
          size="icon"
        >
          <Send className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
        </Button>
      </div>
    </div>
  );
};
