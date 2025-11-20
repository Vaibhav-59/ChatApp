import { Link } from "react-router-dom";
import useAuthStore from "./store/auth";

export const Navbar = () => {
  const authUser = useAuthStore((s) => s.authUser);

  return (
    <header className="bg-emerald-600 text-white">
      <nav className="mx-auto max-w-[72rem] px-4 flex items-center justify-between py-3">
        {/* Brand */}
        <Link to="/" className="text-lg font-extrabold tracking-wide">
          ChatApp
        </Link>

        {/* Links */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Show Contact link only when not logged in */}
          {!authUser && (
            <Link className="px-3 py-2 rounded-md font-medium hover:bg-white/20 transition-colors" to="/contact">
              Contact
            </Link>
          )}

          {!authUser && (
            <>
              <Link className="px-3 py-2 rounded-md font-medium hover:bg-white/20 transition-colors" to="/login">
                Login
              </Link>
              <Link className="px-3 py-2 rounded-md font-medium hover:bg-white/20 transition-colors" to="/register">
                Register
              </Link>
            </>
          )}
          {authUser && (
            <>
              <Link className="px-3 py-2 rounded-md font-medium hover:bg-white/20 transition-colors" to="/chat">
                Chat
              </Link>
              <Link className="px-3 py-2 rounded-md font-medium hover:bg-white/20 transition-colors" to="/profile">
                Profile
              </Link>
              <Link
                className="px-3 py-2 rounded-md bg-white text-emerald-700 font-semibold hover:bg-emerald-50 transition-colors"
                to="/logout"
              >
                Logout
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};
