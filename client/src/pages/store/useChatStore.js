import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./auth";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSendingMessage: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/users/contacts");
      const list = Array.isArray(res.data) ? res.data : (res.data?.users || []);
      set({ users: list });
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || "Failed to load contacts";
      toast.error(msg);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      // Build deterministic DM room id: dm:<sorted myId>:<sorted otherId>
      const authUser = useAuthStore.getState().authUser;
      const myId = String(authUser?._id || authUser?.id || authUser?.userId || authUser?.uid || "");
      const otherId = String(userId || "");
      const sorted = [myId, otherId].sort();
      const roomId = `dm:${sorted[0]}:${sorted[1]}`;
      const res = await axiosInstance.get(`/messages/${encodeURIComponent(roomId)}`);
      const msgList = res.data?.messages || [];

      // Helper to normalize any message shape into consistent fields
      const normalize = (msg) => {
        const sender = msg.senderId || msg.from || msg.sender || null;
        const receiver = msg.receiverId || msg.to || msg.receiver || null;
        const id = msg._id || msg.id || msg.messageId || null;
        const sId = sender && (sender._id || sender.id) ? String(sender._id || sender.id) : (sender ? String(sender) : "");
        const rId = receiver && (receiver._id || receiver.id) ? String(receiver._id || receiver.id) : (receiver ? String(receiver) : "");
        return {
          ...msg,
          _id: id ? String(id) : `srv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          senderId: sId,
          receiverId: rId,
          text: msg.text || msg.content || msg.body || "",
          content: msg.text || msg.content || msg.body || "",
          image: msg.image || null,
          createdAt: msg.createdAt || msg.created_at || new Date().toISOString(),
          clientTempId: msg.clientTempId || null,
        };
      };

      const normalized = msgList.map(normalize);

      set({ messages: normalized });
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || "Failed to load messages";
      toast.error(msg);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser } = get();
    if (!selectedUser) {
      toast.error("No user selected");
      return;
    }

    try {
      set({ isSendingMessage: true });
      const authState = useAuthStore.getState();
      const socket = authState.socket;
      const authUser = authState.authUser;
      const messages = get().messages || [];

      console.log("Attempting to send message...");
      console.log("Socket status:", { socket: !!socket, connected: socket?.connected });

      if (!socket) {
        throw new Error("Socket instance not found. Try refreshing the page.");
      }

      if (!socket.connected) {
        throw new Error("Socket not connected. Attempting to reconnect...");
      }

      // Convert base64 image to ensure it's properly formatted
      let imageData = messageData.image || null;
      if (imageData && typeof imageData === 'string' && !imageData.startsWith('data:')) {
        imageData = null;
      }

      console.log("Emitting message:send event...");
      // Optimistic UI: show the message immediately with a temporary id
      const tempId = `temp-${Date.now()}`;
      const myId = String(authUser?._id || authUser?.id || authUser?.userId || authUser?.uid || "");
      const otherId = String(selectedUser?._id || selectedUser?.id || selectedUser?.userId || selectedUser?.uid || "");
      const sorted = [myId, otherId].sort();
      const tempMsg = {
        _id: tempId,
        senderId: myId,
        receiverId: otherId,
        roomId: `dm:${sorted[0]}:${sorted[1]}`,
        text: messageData.text?.trim() || "",
        content: messageData.text?.trim() || "",
        image: imageData || null,
        readBy: [],
        createdAt: new Date().toISOString(),
        clientTempId: tempId,
      };

      set({ messages: [...messages, tempMsg] });

      // Send message via socket (include temp id for reconciliation)
      socket.emit('message:send', {
        to: otherId,
        content: messageData.text?.trim() || "",
        image: imageData,
        clientTempId: tempId,
      });

      // keep UI responsive
      set({ isSendingMessage: false });
    } catch (error) {
      set({ isSendingMessage: false });
      const msg = error?.response?.data?.message || error.message || 'Failed to send message';
      console.error("Send message error:", msg);
      toast.error(msg);
      throw error;
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    // Remove old listener if it exists to avoid duplicates
    socket.off("message:new");

    socket.on("message:new", (newMessage) => {
      const { selectedUser, messages } = get();
      if (!selectedUser) return;

      const authUser = useAuthStore.getState().authUser;

      // Normalize incoming message to consistent shape
      const normalize = (msg) => {
        const sender = msg.senderId || msg.from || msg.sender || null;
        const receiver = msg.receiverId || msg.to || msg.receiver || null;
        const id = msg._id || msg.id || msg.messageId || null;
        const sId = sender && (sender._id || sender.id) ? String(sender._id || sender.id) : (sender ? String(sender) : "");
        const rId = receiver && (receiver._id || receiver.id) ? String(receiver._id || receiver.id) : (receiver ? String(receiver) : "");
        return {
          ...msg,
          _id: id ? String(id) : `srv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          senderId: sId,
          receiverId: rId,
          text: msg.text || msg.content || msg.body || "",
          content: msg.text || msg.content || msg.body || "",
          image: msg.image || null,
          createdAt: msg.createdAt || msg.created_at || new Date().toISOString(),
          clientTempId: msg.clientTempId || null,
        };
      };

      const normalized = normalize(newMessage);

      const senderId = String(normalized.senderId || "");
      const receiverId = String(normalized.receiverId || "");
      const selId = String(selectedUser._id || selectedUser.id || "");
      const myId = String(authUser?._id || authUser?.id || "");

      const belongsToOpen = (
        senderId === selId ||
        receiverId === selId ||
        (senderId === myId && receiverId === selId)
      );

      if (!belongsToOpen) return;

      // Deduplicate: if server message _id already exists, skip
      if (messages.some(m => String(m._id) === String(normalized._id))) return;

      // If server returns our clientTempId, replace the temp message exactly
      if (normalized.clientTempId) {
        const exactIndex = messages.findIndex(m => String(m._id) === String(normalized.clientTempId));
        if (exactIndex !== -1) {
          const updated = [...messages];
          updated.splice(exactIndex, 1, normalized);
          set({ messages: updated });
          return;
        }
      }

      // Fallback: If a temp message exists that matches this content/sender/receiver, replace it
      const tempIndex = messages.findIndex(m => String(m._id).startsWith('temp-') && m.text === normalized.text && String(m.senderId) === String(normalized.senderId) && String(m.receiverId) === String(normalized.receiverId));
      if (tempIndex !== -1) {
        const updated = [...messages];
        updated.splice(tempIndex, 1, normalized);
        set({ messages: updated });
        return;
      }

      // Otherwise append
      set({ messages: [...messages, normalized] });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("message:new");
    }
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
