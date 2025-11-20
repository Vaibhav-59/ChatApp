import { useState } from "react";
import { useAuthStore } from "./store/auth";
import { toast } from "react-hot-toast";

const defaultContactFormData = {
  username: "",
  email: "",
  message: "",
};

export const Contact = () => {

  const [data, setData] = useState(defaultContactFormData);

  const { user } = useAuthStore();

  const [userData, setUserData] = useState(true);

  if (userData && user) {
    setData({
      username: user.username,
      email: user.email,
      message: "",
    });

    setUserData(false);
  }

  // lets tackle our handleInput
  const handleInput = (e) => {
    const name = e.target.name;
    const value = e.target.value;

    setData({
      ...data,
      [name]: value,
    });
  };

  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.username || data.username.trim().length < 3) {
      toast.error("Username must be at least 3 characters");
      return false;
    }
    if (!emailRegex.test(data.email)) {
      toast.error("Please enter a valid email");
      return false;
    }
    if (!data.message || data.message.trim().length < 10) {
      toast.error("Message must be at least 10 characters");
      return false;
    }
    return true;
  };

  // handle fomr getFormSubmissionInfo
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // If you later add an API call, perform it here and handle response codes.
    // For now, just show a success toast and reset the form.
    toast.success("Thanks! Your message has been submitted.");
    setData(defaultContactFormData);
  };

  return (
    <>
      <section className="min-h-screen overflow-y-auto no-scrollbar bg-emerald-50 flex items-center justify-center p-4 sm:p-6">
        <main className="w-full">
          <div className="w-full max-w-xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-emerald-200 p-5 sm:p-8">
              <h1 className="text-3xl font-bold text-emerald-700">Contact us</h1>
              <p className="text-sm text-gray-600 mt-1">We are always ready to help</p>
              <br />
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                  <label htmlFor="username" className="block text-sm font-medium text-emerald-700">Username</label>
                  <input
                    type="text"
                    name="username"
                    id="username"
                    autoComplete="off"
                    value={data.username}
                    onChange={handleInput}
                    required
                    className="block w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 placeholder-gray-400"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="email" className="block text-sm font-medium text-emerald-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    autoComplete="off"
                    value={data.email}
                    onChange={handleInput}
                    required
                    className="block w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 placeholder-gray-400"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="message" className="block text-sm font-medium text-emerald-700">Message</label>
                  <textarea
                    name="message"
                    id="message"
                    autoComplete="off"
                    value={data.message}
                    onChange={handleInput}
                    required
                    rows="6"
                    className="block w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 placeholder-gray-400 min-h-[120px]"
                  ></textarea>
                </div>

                <div>
                  <button type="submit" className="w-full inline-flex justify-center items-center px-4 py-2 rounded-lg bg-emerald-500 text-white font-semibold shadow hover:bg-emerald-600 transition-colors">
                    Submit
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-6 bg-white rounded-2xl shadow-xl border border-emerald-200 overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3782.2613173278896!2d73.91411937501422!3d18.562253982539413!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2c147b8b3a3bf%3A0x6f7fdcc8e4d6c77e!2sPhoenix%20Marketcity%20Pune!5e0!3m2!1sen!2sin!4v1697604225432!5m2!1sen!2sin"
                className="w-full h-[350px]"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Location Map"
              ></iframe>
            </div>
          </div>
        </main>
      </section>
    </>
  );
};