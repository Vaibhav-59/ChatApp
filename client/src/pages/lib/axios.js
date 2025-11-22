import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "https://chatapp-0-bmye.onrender.com/api" : "/api",
  withCredentials: true,
});

// Attach Authorization header from localStorage for every request if token exists
axiosInstance.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        // If token already contains "Bearer ", keep it; otherwise prefix
        config.headers = config.headers || {};
        config.headers.Authorization = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
      }
    } catch (e) {
      // ignore
    }
    return config;
  },
  (error) => Promise.reject(error)
);
