import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { axiosInstance } from '../lib/axios';

const Field = ({ label, children }) => (
  <label className="block text-sm mb-4">
    <span className="text-gray-700 mb-1 inline-block">{label}</span>
    {children}
  </label>
);

const AdminUserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const fetchUser = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get(`/users/${id}`);
      setUser(res.data);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to load user';
      setError(msg);
      if (err?.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: user.name ?? user.username,
        username: user.username, // keep backward compatibility
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      };
      const res = await axiosInstance.put(`/users/${id}`, payload);
      setUser(res.data);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to save changes';
      setError(msg);
      if (err?.response?.status === 401) navigate('/login');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    setDeleting(true);
    setError(null);
    try {
      await axiosInstance.delete(`/users/${id}`);
      navigate('/admin/users');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to delete user';
      setError(msg);
      if (err?.response?.status === 401) navigate('/login');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="text-gray-600">Loading user...</div>;
  if (error) return (
    <div className="space-y-3">
      <div className="text-red-600 text-sm">{error}</div>
      <button
        onClick={fetchUser}
        className="px-4 py-2 text-sm rounded bg-lightgreen-500 text-white hover:bg-lightgreen-600"
      >
        Retry
      </button>
    </div>
  );
  if (!user) return <div className="text-gray-600">User not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-lightgreen-100 text-lightgreen-800 flex items-center justify-center text-2xl font-semibold">
          {(user.name || user.username || 'U').charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">{user.name || user.username}</h1>
          <p className="text-gray-500 text-sm">User ID: {user._id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Profile</h2>
          <Field label="Name">
            <input
              name="name"
              value={user.name || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 focus:border-lightgreen-500 focus:ring-lightgreen-500"
              placeholder="Full name"
            />
          </Field>
          <Field label="Username (legacy)">
            <input
              name="username"
              value={user.username || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 focus:border-lightgreen-500 focus:ring-lightgreen-500"
              placeholder="Username"
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              name="email"
              value={user.email || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 focus:border-lightgreen-500 focus:ring-lightgreen-500"
              placeholder="email@example.com"
            />
          </Field>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Access</h2>
          <Field label="Role">
            <select
              name="role"
              value={user.role || 'user'}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 focus:border-lightgreen-500 focus:ring-lightgreen-500"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </Field>

          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded bg-lightgreen-500 text-white hover:bg-lightgreen-600 disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={fetchUser}
              className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="ml-auto px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-60"
            >
              {deleting ? 'Deleting...' : 'Delete User'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="text-lg font-medium text-gray-800 mb-3">Metadata</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <p><span className="text-gray-500">Created:</span> {new Date(user.createdAt || user.created_at || Date.now()).toLocaleString()}</p>
          <p><span className="text-gray-500">Updated:</span> {new Date(user.updatedAt || user.updated_at || Date.now()).toLocaleString()}</p>
          <p><span className="text-gray-500">Role:</span> {user.role || 'user'}</p>
          <p><span className="text-gray-500">Email:</span> {user.email || '—'}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetails;
