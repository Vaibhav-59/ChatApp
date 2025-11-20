import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaUsers, FaUserCog, FaUserPlus, FaUserEdit, FaUserTimes, FaBars, FaTimes } from 'react-icons/fa';
import axios from 'axios';

const Sidebar = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
        });
        // Controller returns a plain array
        setUsers(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to fetch users');
        if (err?.response?.status === 401) navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  const toggleSidebar = () => setIsOpen((v) => !v);

  const isActive = (path) =>
    location.pathname === path
      ? 'bg-lightgreen-100 text-green-800'
      : 'text-gray-700 hover:bg-lightgreen-50';

  if (loading) return <div className="p-4 text-gray-600">Loading users...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="flex h-screen bg-white">
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md text-gray-700 bg-white shadow"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static z-50 w-72 max-w-[80vw] h-full bg-white border-r border-gray-200 shadow-sm transform ${isOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">User Management</h2>
          <p className="text-xs text-gray-500 mt-1">Admin tools and quick actions</p>
        </div>

        {/* Nav */}
        <nav className="mt-4 flex-1 overflow-y-auto">
          {/* Main Menu */}
          <div className="px-3">
            <h3 className="text-xs uppercase font-semibold text-gray-500 mb-2">Main Menu</h3>
            <ul className="space-y-1">
              <li>
                <Link
                  to="/admin/dashboard"
                  className={`flex items-center px-3 py-2 rounded-lg transition-colors ${isActive('/admin/dashboard')}`}
                  onClick={() => setIsOpen(false)}
                >
                  <FaUsers className="mr-3" />
                  <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/users"
                  className={`flex items-center px-3 py-2 rounded-lg transition-colors ${isActive('/admin/users')}`}
                  onClick={() => setIsOpen(false)}
                >a
                  <FaUsers className="mr-3" />
                  <span>All Users</span>
                </Link>
              </li>
              {/* <li>
                <Link
                  to="/admin/users/new"
                  className={`flex items-center px-3 py-2 rounded-lg transition-colors ${isActive('/admin/users/new')}`}
                  onClick={() => setIsOpen(false)}
                >
                  <FaUserPlus className="mr-3" />
                  <span>Add New User</span>
                </Link>
              </li> */}
              <li>
                <Link
                  to="/admin/roles"
                  className={`flex items-center px-3 py-2 rounded-lg transition-colors ${isActive('/admin/roles')}`}
                  onClick={() => setIsOpen(false)}
                >
                  <FaUserCog className="mr-3" />
                  <span>Manage Roles</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Actions */}
          <div className="px-3 mt-6">
            <h3 className="text-xs uppercase font-semibold text-gray-500 mb-2">Quick Actions</h3>
            <ul className="space-y-1">
              <li>
                <button
                  className="w-full flex items-center px-3 py-2 rounded-lg text-left text-gray-700 hover:bg-lightgreen-50 transition-colors"
                  onClick={() => {
                    // TODO: Wire to a real endpoint for deactivating inactive users
                    setIsOpen(false);
                  }}
                >
                  <FaUserTimes className="mr-3 text-red-500" />
                  <span>Deactivate Inactive</span>
                </button>
              </li>
              <li>
                <button
                  className="w-full flex items-center px-3 py-2 rounded-lg text-left text-gray-700 hover:bg-lightgreen-50 transition-colors"
                  onClick={() => {
                    // TODO: Wire to a real export endpoint
                    console.log('Export users');
                    setIsOpen(false);
                  }}
                >
                  <FaUserEdit className="mr-3 text-blue-500" />
                  <span>Export Users</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Recent Users */}
          <div className="px-3 mt-6 pb-24 md:pb-28">
            <h3 className="text-xs uppercase font-semibold text-gray-500 mb-2">Recent Users</h3>
            <div className="space-y-2">
              {users.slice(0, 5).map((u) => (
                <button
                  type="button"
                  key={u._id}
                  className="w-full flex items-center p-2 rounded-lg hover:bg-lightgreen-50 transition-colors"
                  onClick={() => {
                    navigate(`/admin/users/${u._id}`);
                    setIsOpen(false);
                  }}
                >
                  <div className="w-9 h-9 rounded-full bg-lightgreen-100 flex items-center justify-center text-lightgreen-800 font-semibold mr-3">
                    {(u.name || u.username || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-sm font-medium text-gray-800 truncate">{u.name || u.username}</p>
                    <p className="text-xs text-gray-500 truncate">{u.role || 'user'}</p>
                  </div>
                </button>
              ))}
              {users.length === 0 && (
                <p className="text-xs text-gray-500">No users found.</p>
              )}
            </div>
          </div>
        </nav>

        {/* Footer (admin profile) */}
        <div className="mt-auto w-full p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-lightgreen-100 flex items-center justify-center text-lightgreen-800 font-semibold mr-3">
              A
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">Admin</p>
              <p className="text-xs text-gray-500 truncate">Super Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main area placeholder for layout composition */}
      <div className="hidden" />
    </div>
  );
};

export default Sidebar;