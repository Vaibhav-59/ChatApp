import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../lib/axios';

const AdminUserNew = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user', avatar: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Email and password are required');
      return;
    }
    setSaving(true);
    try {
      await axiosInstance.post('/users', form);
      navigate('/admin/users');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to create user';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">Add New User</h1>
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-4 space-y-4 max-w-xl">
        {error && <div className="text-sm text-red-600">{error}</div>}
        <div>
          <label className="block text-sm text-gray-700">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 focus:border-lightgreen-500 focus:ring-lightgreen-500"
            placeholder="Full name"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Email *</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 focus:border-lightgreen-500 focus:ring-lightgreen-500"
            placeholder="email@example.com"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Password *</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 focus:border-lightgreen-500 focus:ring-lightgreen-500"
            placeholder="••••••••"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Role</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 focus:border-lightgreen-500 focus:ring-lightgreen-500"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700">Avatar URL</label>
          <input
            name="avatar"
            value={form.avatar}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 focus:border-lightgreen-500 focus:ring-lightgreen-500"
            placeholder="https://..."
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded bg-lightgreen-500 text-white hover:bg-lightgreen-600 disabled:opacity-60"
          >
            {saving ? 'Creating...' : 'Create User'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/users')}
            className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminUserNew;
