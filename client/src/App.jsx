import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Contact } from "./pages/Contact";
import { Register } from "./pages/Register";
import { Login } from "./pages/Login";
import { Navbar } from "./pages/Navbar";
import { Error } from "./pages/Error";
// import { Footer } from "./components/Footer/Footer";
import { Logout } from "./pages/Logout";
import AdminLayout from "./pages/AdminLayout.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import AdminUserNew from "./pages/admin/AdminUserNew.jsx";
import AdminRoles from "./pages/admin/AdminRoles.jsx";
import AdminUserDetails from "./pages/admin/AdminUserDetails.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import ChatPage from "./pages/chat/ChatPage.jsx";
import Profile from "./Profile.jsx";

const App = () => {
  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* Public routes */}
          <Route path="/contact" element={<Contact />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />

          {/* Chat - protected */}
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />

          {/* Profile - protected */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Admin area with Sidebar - protected */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="users/new" element={<AdminUserNew />} />
            <Route path="roles" element={<AdminRoles />} />
            <Route path="users/:id" element={<AdminUserDetails />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Error />} />
        </Routes>
        {/* <Footer /> */}
      </BrowserRouter>
    </>
  )
}

export default App
