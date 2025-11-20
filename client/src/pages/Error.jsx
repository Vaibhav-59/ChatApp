import { NavLink } from "react-router-dom";

export const Error = () => {
  return (
    <>
      <section className="min-h-screen bg-emerald-50 flex items-center justify-center p-4 sm:p-6">
        <main className="w-full">
          <div className="w-full max-w-xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-emerald-200 p-6 sm:p-10 text-center">
              <div className="text-6xl font-extrabold text-emerald-600">404</div>
              <h2 className="mt-2 text-2xl font-bold text-gray-800">Sorry! Page not found</h2>
              <p className="mt-2 text-gray-600">
                Oops! It seems like the page you're trying to access doesn't exist. If you
                believe there's an issue, feel free to report it, and we'll look into it.
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <NavLink
                  to="/"
                  className="px-4 py-2 rounded-lg bg-emerald-500 text-white font-semibold shadow hover:bg-emerald-600 transition-colors"
                >
                  Return Home
                </NavLink>
                <NavLink
                  to="/contact"
                  className="px-4 py-2 rounded-lg border border-emerald-300 text-emerald-700 font-semibold hover:bg-emerald-50 transition-colors"
                >
                  Report Problem
                </NavLink>
              </div>
            </div>
          </div>
        </main>
      </section>
    </>
  );
};