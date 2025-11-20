import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "../skeletons/MessageSkeleton";
import { useAuthStore } from "../store/auth";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    getMessages(selectedUser._id);

    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Robust id getter: handles objects like { _id } or { id } or plain strings
  const getId = (v) => {
    if (!v && v !== 0) return "";
    if (typeof v === "string") return v;
    if (typeof v === "number") return String(v);
    if (v._id) return String(v._id);
    if (v.id) return String(v.id);
    if (v.userId) return String(v.userId);
    if (v.uid) return String(v.uid);
    try {
      return String(v);
    } catch (e) {
      return "";
    }
  };

  const authId = (
    getId(authUser?._id) ||
    getId(authUser?.id) ||
    getId(authUser?.userId) ||
    getId(authUser?.uid) ||
    ""
  );
  const isMine2 = (senderId) => getId(senderId) === authId;

  if (isMessagesLoading) {
    return (
      <div className="w-full h-full flex flex-col bg-gradient-to-b from-white to-zinc-50">
        <ChatHeader />
        <div className="flex-1 flex items-center justify-center">
          <MessageSkeleton />
        </div>
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-white to-zinc-50">
      <ChatHeader />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 scrollbar-thin scrollbar-thumb-zinc-300">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center text-3xl mb-4">💬</div>
            <p className="text-sm text-zinc-500">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const mine = isMine2(message.senderId || message.from || message.fromId);
            const senderAvatar = mine
              ? authUser?.avatar || authUser?.profilePic || "/avatar.png"
              : selectedUser?.avatar || selectedUser?.profilePic || "/avatar.png";
            const senderName = mine ? (authUser?.name || "You") : (selectedUser?.name || "User");

            // TEMP DEBUG: verify alignment decision
            try {
              // eslint-disable-next-line no-console
              console.log({
                authId,
                msgSender: String(message.senderId || message.from || message.fromId || ""),
                isMine: mine,
                msgId: message._id,
              });
            } catch (_) { }

            return (
              <div key={message._id} className={`flex w-full items-start gap-3 ${mine ? "flex-row-reverse" : ""}`}>
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <img
                    src={senderAvatar}
                    alt={senderName}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-white"
                  />
                </div>

                {/* Message Content */}
                <div className={`flex flex-col gap-1 max-w-xs sm:max-w-md ${mine ? "items-end ml-auto" : "items-start mr-auto"}`}>
                  {/* Timestamp */}
                  <span className="text-xs text-zinc-400 px-2">
                    {formatMessageTime(message.createdAt)}
                  </span>

                  {/* Message Bubble */}
                  <div
                    className={`px-4 py-2.5 rounded-2xl ${mine ? "rounded-br-none" : "rounded-bl-none"} shadow-sm transition-all hover:shadow-md ${mine
                      ? "bg-emerald-500 text-white"
                      : "bg-white text-zinc-800 border border-zinc-200"
                      }`}
                  >
                    {message.image && (
                      <img
                        src={message.image}
                        alt="Attachment"
                        className="max-w-[150px] sm:max-w-[200px] rounded-lg mb-2"
                      />
                    )}
                    {(message.text || message.content) && (
                      <p className="text-sm sm:text-base break-words">{message.text || message.content}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        {/* scroll anchor */}
        <div ref={messageEndRef} />
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="flex-shrink-0 border-t border-zinc-200 bg-white">
        <MessageInput />
      </div>
    </div>
  );
};
export default ChatContainer;
