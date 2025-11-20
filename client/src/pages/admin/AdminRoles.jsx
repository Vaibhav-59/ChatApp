import React, { useEffect, useState } from 'react';
import { axiosInstance } from '../lib/axios';

const AdminRoles = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axiosInstance.get('/users');
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = async (userId, role) => {
    setSavingId(userId);
    setError('');
    try {
      const res = await axiosInstance.put(`/users/${userId}`, { role });
      setUsers((prev) => prev.map((u) => (u._id === userId ? res.data : u)));
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update role');
    } finally {
      setSavingId('');
    }
  };

  if (loading) return <div className="text-gray-600">Loading roles...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold text-gray-800">Manage Roles</h1>
        <button onClick={fetchUsers} className="ml-auto px-3 py-2 rounded-md bg-lightgreen-500 text-white hover:bg-lightgreen-600">Refresh</button>
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="overflow-hidden border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((u) => (
              <tr key={u._id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-lightgreen-100 text-lightgreen-800 flex items-center justify-center font-semibold">
                      {(u.name || u.username || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{u.name || u.username}</div>
                      <div className="text-xs text-gray-500">ID: {u._id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{u.email || '—'}</td>
                <td className="px-4 py-3">
                  <select
                    value={u.role || 'user'}
                    onChange={(e) => handleChange(u._id, e.target.value)}
                    disabled={savingId === u._id}
                    className="rounded-md border-gray-300 focus:border-lightgreen-500 focus:ring-lightgreen-500 text-sm"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="3" className="px-4 py-6 text-center text-gray-500 text-sm">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminRoles;
