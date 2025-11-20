import React, { useEffect } from "react";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5000" : "/";

// Zustand store for auth + socket state
export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  // set token in localStorage and re-check auth
  storeTokenInLS: (token) => {
    try {
      localStorage.setItem("token", token || "");
    } catch (e) {
      /* ignore */
    }
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await axiosInstance.get("/auth/check");
      // backend may return user object in res.data.user or res.data.userData
      const user = res.data?.user || res.data?.userData || res.data;
      set({ authUser: user });
      get().connectSocket();
    } catch (error) {
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      // persist token if provided
      if (res.data?.token) {
        get().storeTokenInLS(res.data.token);
      }
      const user = res.data?.user || res.data?.userData || res.data;
      set({ authUser: user });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      const payload = res.data;
      // if server returns token, store it
      if (payload?.token) {
        get().storeTokenInLS(payload.token);
      }
      const user = payload?.user || payload;
      set({ authUser: user });
      toast.success("Logged in successfully");
      get().connectSocket();
      return payload;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed");
      throw error;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch (e) {
      /* ignore */
    }
    set({ authUser: null });
    get().disconnectSocket();
    try {
      localStorage.removeItem("token");
    } catch (e) { }
    toast.success("Logged out");
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      const user = res.data?.user || res.data;
      set({ authUser: user });
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Update failed");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser, socket } = get();

    // Don't connect if no auth user or already connected
    if (!authUser) {
      console.warn("No authUser, skipping socket connection");
      return;
    }
    if (socket && socket.connected) {
      console.log("Socket already connected");
      return;
    }

    const token = localStorage.getItem("token") || "";
    if (!token) {
      console.warn("No token found, cannot connect socket");
      return;
    }

    console.log("Connecting socket...");
    const s = io(BASE_URL, {
      transports: ["websocket", "polling"],
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10
    });

    set({ socket: s });

    s.on("connect", () => {
      console.log("✅ Socket connected:", s.id);
    });

    s.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error.message);
      toast.error("Socket connection failed. Retrying...");
    });

    s.on("presence:list", ({ users = [] }) => {
      console.log("Online users:", users);
      set({ onlineUsers: users });
    });

    s.on("presence:update", ({ online = 0 }) => {
      console.log("Online count:", online);
    });

    s.on("disconnect", () => {
      console.log("⚠️  Socket disconnected");
      set({ socket: null, onlineUsers: [] });
    });

    s.on("error", (error) => {
      console.error("Socket error:", error);
    });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket && socket.connected) socket.disconnect();
    set({ socket: null, onlineUsers: [] });
  },
}));

// Lightweight AuthProvider: triggers auth check on mount
export const AuthProvider = ({ children }) => {
  useEffect(() => {
    // If a token exists in localStorage, check auth
    const t = localStorage.getItem("token");
    if (t) {
      useAuthStore.getState().checkAuth();
    } else {
      // still mark checking as finished
      useAuthStore.setState({ isCheckingAuth: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return React.createElement(React.Fragment, null, children);
};

export default useAuthStore;
