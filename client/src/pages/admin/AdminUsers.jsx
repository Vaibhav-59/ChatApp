import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../lib/axios';

const PAGE_SIZE = 8;

const Badge = ({ children, color = 'gray' }) => {
  const colors = {
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    blue: 'bg-blue-100 text-blue-700',
    gray: 'bg-gray-100 text-gray-700',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[color]}`}>{children}</span>
  );
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get('/users');
      const arr = Array.isArray(res.data) ? res.data : [];
      setUsers(arr);
      setFiltered(arr);
      setPage(1);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to load users';
      setError(msg);
      if (err?.response?.status === 401) navigate('/login');
      if (err?.response?.status === 403) setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter by search
  useEffect(() => {
    const q = search.trim().toLowerCase();
    const next = !q
      ? users
      : users.filter((u) =>
        [u.name, u.username, u.email, u.role]
          .map((s) => String(s || '').toLowerCase())
          .some((v) => v.includes(q))
      );
    setFiltered(next);
    setPage(1);
  }, [search, users]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getStatus = (u) => {
    // Heuristic: inactive if last update > 180 days ago; else active
    const updated = new Date(u.updatedAt || u.createdAt || Date.now());
    const days = (Date.now() - updated.getTime()) / (1000 * 60 * 60 * 24);
    const inactive = days > 180;
    return inactive ? 'inactive' : 'active';
  };

  if (loading) return <div className="text-gray-600">Loading users...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <h1 className="text-2xl font-semibold text-gray-800">Users</h1>
        <div className="md:ml-auto flex gap-2 w-full md:w-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, role..."
            className="flex-1 md:w-80 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lightgreen-300 focus:border-lightgreen-300"
          />
          <button
            onClick={fetchUsers}
            className="px-3 py-2 rounded-md bg-lightgreen-500 text-white hover:bg-lightgreen-600"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Table (desktop) */}
      <div className="hidden md:block">
        <div className="overflow-hidden border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((u) => {
                const status = getStatus(u);
                return (
                  <tr key={u._id} className="hover:bg-lightgreen-50">
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
                      {u.role === 'admin' ? (
                        <Badge color="blue">Admin</Badge>
                      ) : (
                        <Badge color="gray">User</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {status === 'active' ? (
                        <Badge color="green">Active</Badge>
                      ) : (
                        <Badge color="yellow">Inactive</Badge>
                      )}
                    </td>
                    {/* <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => navigate(`/admin/users/${u._id}`)}
                        className="text-sm px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50"
                      >
                        View
                      </button>
                    </td> */}
                  </tr>
                );
              })}
              {currentItems.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-6 text-center text-gray-500 text-sm">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards (mobile) */}
      <div className="grid md:hidden grid-cols-1 gap-3">
        {currentItems.map((u) => {
          const status = getStatus(u);
          return (
            <div key={u._id} className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-lightgreen-100 text-lightgreen-800 flex items-center justify-center font-semibold">
                  {(u.name || u.username || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{u.name || u.username}</p>
                  <p className="text-xs text-gray-500 truncate">{u.email || '—'}</p>
                </div>
                <button
                  onClick={() => navigate(`/admin/users/${u._id}`)}
                  className="text-sm px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50"
                >
                  View
                </button>
              </div>
              <div className="mt-2 flex items-center gap-2">
                {u.role === 'admin' ? <Badge color="blue">Admin</Badge> : <Badge color="gray">User</Badge>}
                {status === 'active' ? <Badge color="green">Active</Badge> : <Badge color="yellow">Inactive</Badge>}
              </div>
            </div>
          );
        })}
        {currentItems.length === 0 && (
          <div className="text-center text-gray-500 text-sm py-6">No users found</div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-2">
        <p className="text-sm text-gray-600">Page {page} of {totalPages} • {filtered.length} users</p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-md border border-gray-300 disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-md border border-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
