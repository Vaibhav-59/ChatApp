import { X } from "lucide-react";
import useAuthStore from "../store/auth";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const onlineUsers = useAuthStore((s) => s.onlineUsers) || [];

  if (!selectedUser) {
    return (
      <header className="sticky top-0 z-10 bg-white border-b border-zinc-200 px-3 sm:px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-zinc-100 flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
            💬
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-zinc-900">No conversation</div>
            <div className="text-xs text-zinc-400">Select a contact to start chatting</div>
          </div>
        </div>
      </header>
    );
  }

  const userId = String(selectedUser._id || selectedUser.id);
  const displayName = selectedUser.fullName || selectedUser.name || selectedUser.username || "User";
  const avatar = selectedUser.avatar || selectedUser.profilePic || "/avatar.png";
  const isOnline = onlineUsers.map(String).includes(userId);

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-zinc-200 px-3 sm:px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between gap-3 sm:gap-4">
        {/* User Info */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="relative flex-shrink-0">
            <img
              src={avatar}
              alt={displayName}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-white"
            />
            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-white transition-all ${isOnline ? "bg-emerald-500" : "bg-zinc-400"}`} />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-zinc-900 truncate">{displayName}</h2>
            <p className={`text-xs font-medium ${isOnline ? "text-emerald-600" : "text-zinc-400"}`}>
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={() => setSelectedUser(null)}
          className="p-2 rounded-lg hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-emerald-400 transition-colors flex-shrink-0"
          aria-label="Close conversation"
        >
          <X className="w-5 h-5 text-zinc-600 hover:text-zinc-900" />
        </button>
      </div>
    </header>
  );
};

export default ChatHeader;
