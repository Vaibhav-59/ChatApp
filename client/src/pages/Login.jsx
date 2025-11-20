import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "./store/auth";
import { toast } from "react-hot-toast";

const URL = "http://localhost:8000/api/auth/login";

export const Login = () => {
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const location = useLocation();

  const { storeTokenInLS } = useAuthStore();

  // let handle the input field value
  const handleInput = (e) => {
    let name = e.target.name;
    let value = e.target.value;

    setUser({
      ...user,
      [name]: value,
    });
  };

  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      toast.error("Please enter a valid email");
      return false;
    }
    if (!user.password || user.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      // Use Zustand auth store login method
      const authStore = useAuthStore.getState();
      await authStore.login({
        email: user.email,
        password: user.password
      });

      setUser({ email: "", password: "" });

      // Give socket time to connect
      await new Promise(resolve => setTimeout(resolve, 1000));

      // If user came from a protected route, go back there; else go to chat (current tab)
      const redirectTo = location.state?.from?.pathname || "/chat";
      navigate(redirectTo, { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error?.response?.data?.message || "Login failed");
    }
  };

  return (
    <>
      <section className="min-h-screen overflow-y-auto no-scrollbar bg-emerald-50 flex items-center justify-center p-4 sm:p-6">
        <main className="w-full">
          <div>
            <div className="w-full max-w-xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl border border-emerald-200 p-5 sm:p-8">
                <h1 className="text-3xl font-bold text-emerald-700">Login</h1>
                <p className="text-sm text-gray-600 mt-1">Welcome back</p>
                <br />
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1">
                    <label htmlFor="email" className="block text-sm font-medium text-emerald-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="name@example.com"
                      id="email"
                      required
                      autoComplete="off"
                      value={user.email}
                      onChange={handleInput}
                      className="block w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 placeholder-gray-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="password" className="block text-sm font-medium text-emerald-700">Password</label>
                    <input
                      type="password"
                      name="password"
                      placeholder="••••••••"
                      id="password"
                      required
                      autoComplete="off"
                      value={user.password}
                      onChange={handleInput}
                      className="block w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <button type="submit" className="w-full inline-flex justify-center items-center px-4 py-2 rounded-lg bg-emerald-500 text-white font-semibold shadow hover:bg-emerald-600 transition-colors">
                      Login
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </section>
    </>
  );
};
