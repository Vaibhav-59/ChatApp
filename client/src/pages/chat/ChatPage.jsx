import React, { useEffect } from 'react';
import ChatSidebar from './ChatSidebar.jsx';
import ChatContainer from './ChatContainer.jsx';
import NoChatSelected from './NoChatSelected.jsx';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/auth';

const ChatPage = () => {
  const selectedUser = useChatStore((s) => s.selectedUser);
  const setSelectedUser = useChatStore((s) => s.setSelectedUser);
  const socket = useAuthStore((s) => s.socket);
  const authUser = useAuthStore((s) => s.authUser);

  // Allow deep-link via hash, e.g. /chat#dm:<userId>
  useEffect(() => {
    const hash = window.location.hash?.replace('#', '') || '';
    if (hash.startsWith('dm:')) {
      const userId = hash.substring(3);
      // set a minimal selectedUser; store will resolve full user when needed
      setSelectedUser({ _id: userId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debug logging
  useEffect(() => {
    console.log("ChatPage - Auth Status:", {
      authUser: !!authUser,
      socket: !!socket,
      socketConnected: socket?.connected
    });
  }, [authUser, socket]);

  return (
    <div className="h-[calc(100vh-64px)] md:h-[calc(100vh-64px)] flex bg-white">
      <ChatSidebar />
      <div className="flex-1 border-l border-gray-200">
        {!socket?.connected ? (
          <div className="h-full flex flex-col items-center justify-center bg-zinc-50">
            <div className="text-center">
              <div className="mb-4 text-4xl">🔄</div>
              <p className="text-sm font-medium text-zinc-700">Connecting to chat...</p>
              <p className="text-xs text-zinc-500 mt-2">Please wait while we establish your connection</p>
            </div>
          </div>
        ) : selectedUser ? (
          <ChatContainer />
        ) : (
          <NoChatSelected />
        )}
      </div>
    </div>
  );
};

export default ChatPage;