import { useEffect, useRef } from "react";
import useAuthStore from "./store/auth";
import { useNavigate } from "react-router-dom";
// import { toast } from "react-hot-toast";

export const Logout = () => {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    try {
      if (typeof logout === "function") logout();
      // toast.success("Logged out successfully");
    } catch (e) {
      // toast.error("Failed to logout. Please try again");
    } finally {
      navigate("/login", { replace: true });
    }
  }, [logout, navigate]);

  return null;
};
