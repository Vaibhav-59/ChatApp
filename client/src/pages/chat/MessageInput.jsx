import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });

      // Clear form
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="p-3 sm:p-4 w-full bg-white border-t border-zinc-200">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative group">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border-2 border-zinc-200 shadow-sm"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
              type="button"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="text-xs text-zinc-500">Image attached</div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-end gap-2 sm:gap-3">
        {/* Image upload button (mobile) */}
        <button
          type="button"
          className="sm:hidden p-2 rounded-lg hover:bg-zinc-100 text-zinc-600 hover:text-emerald-600 transition-colors flex-shrink-0"
          onClick={() => fileInputRef.current?.click()}
          title="Attach image"
        >
          <Image className="w-5 h-5" />
        </button>

        {/* Text input */}
        <div className="flex-1 flex items-center gap-2">
          <input
            type="text"
            className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-0 bg-white text-sm sm:text-base transition-all placeholder:text-zinc-400"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          {/* Image upload button (desktop) */}
          <button
            type="button"
            className={`hidden sm:flex p-2 rounded-lg transition-colors flex-shrink-0 ${imagePreview
                ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                : "hover:bg-zinc-100 text-zinc-600 hover:text-emerald-600"
              }`}
            onClick={() => fileInputRef.current?.click()}
            title="Attach image"
          >
            <Image className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden file input */}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageChange}
        />

        {/* Send button */}
        <button
          type="submit"
          className={`p-2.5 rounded-lg transition-all flex-shrink-0 flex items-center justify-center ${text.trim() || imagePreview
              ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-md hover:shadow-lg"
              : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
            }`}
          disabled={!text.trim() && !imagePreview}
          title="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
export default MessageInput;
