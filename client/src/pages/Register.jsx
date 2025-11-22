import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "./store/auth";
import { toast } from "react-hot-toast";

const URL = "https://chatapp-4-jiaz.onrender.com/api/auth/register";

export const Register = () => {
  const [user, setUser] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
  });

  const navigate = useNavigate();

  const { storeTokenInLS } = useAuthStore();

  //handling the input values
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
    if (!user.username || user.username.trim().length < 3) {
      toast.error("Username must be at least 3 characters");
      return false;
    }
    if (!emailRegex.test(user.email)) {
      toast.error("Please enter a valid email");
      return false;
    }
    if (!user.phone || String(user.phone).length < 10) {
      toast.error("Please enter a valid phone number");
      return false;
    }
    if (!user.password || user.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  // handle form on submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      if (response.ok) {
        const res_data = await response.json();
        storeTokenInLS(res_data.token);
        setUser({ username: "", email: "", phone: "", password: "" });
        toast.success("Registered successfully");
        navigate("/login");
        return;
      }

      const err = await response.json().catch(() => null);
      toast.error(err?.message || "Registration failed");
    } catch (error) {
      toast.error("Network error. Please try again");
    }
  };

  //? the CORS(Cross-Origin Resourse Sharing) policy is a security feature implemented by web browsers to restrict webpages from making requests to a different domain tan the one that served the webpage. In the context of a MERN stack application you might encounter CORS issues when the frontend and backend are hosted on different domains

  return (
    <>
      <section className="min-h-screen overflow-y-auto no-scrollbar bg-emerald-50 flex items-center justify-center p-4 sm:p-6">
        <main className="w-full">
          <div>
            <div className="w-full max-w-xl mx-auto">
              {/* our main registration code  */}
              <div className="bg-white rounded-2xl shadow-xl border border-emerald-200 p-5 sm:p-8">
                <h1 className="text-3xl font-bold text-emerald-700">Registration</h1>
                <p className="text-sm text-gray-600 mt-1">Create your account</p>
                <br />
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1">
                    <label htmlFor="username" className="block text-sm font-medium text-emerald-700">Username</label>
                    <input
                      type="text"
                      name="username"
                      placeholder="Your username"
                      id="username"
                      required
                      autoComplete="off"
                      value={user.username}
                      onChange={handleInput}
                      className="block w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 placeholder-gray-400"
                    />
                  </div>
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
                    <label htmlFor="phone" className="block text-sm font-medium text-emerald-700">Phone</label>
                    <input
                      type="number"
                      name="phone"
                      id="phone"
                      required
                      autoComplete="off"
                      value={user.phone}
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
                      Register Now
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
