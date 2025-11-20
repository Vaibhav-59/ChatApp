import React, { useEffect, useMemo, useState } from 'react';
import { axiosInstance } from '../lib/axios';
import { useAuthStore } from '../store/auth';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  TimeScale,
);

const formatDateLabel = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString();
};

const SummaryCard = ({ title, value, sub }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="mt-1 text-2xl font-semibold text-gray-800">{value}</p>
    {sub ? <p className="text-xs text-gray-500 mt-1">{sub}</p> : null}
  </div>
);

const AdminDashboard = () => {
  const [items, setItems] = useState([]); // [{date, totalUsers, totalMessages, activeUsers}]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const socket = useAuthStore((s) => s.socket);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const res = await axiosInstance.get('/analytics', { params });
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Refetch when filters change
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  useEffect(() => {
    if (!socket) return; // wait for authenticated socket
    const handler = (doc) => {
      setItems((prev) => {
        const arr = Array.isArray(prev) ? [...prev] : [];
        const idx = arr.findIndex((x) => new Date(x.date).toISOString() === new Date(doc.date).toISOString());
        if (idx >= 0) {
          arr[idx] = doc;
        } else {
          arr.push(doc);
          arr.sort((a, b) => new Date(a.date) - new Date(b.date));
        }
        return arr;
      });
    };
    socket.on('analytics:update', handler);
    return () => {
      try { socket.off('analytics:update', handler); } catch (_) {}
    };
  }, [socket]);

  const totals = useMemo(() => {
    let totalUsers = 0;
    let totalMessages = 0;
    let activeUsers = 0;
    for (const it of items) {
      totalUsers += Number(it.totalUsers || 0);
      totalMessages += Number(it.totalMessages || 0);
    }
    if (items.length) activeUsers = Number(items[items.length - 1].activeUsers || 0);
    return { totalUsers, totalMessages, activeUsers };
  }, [items]);

  const labels = items.map((it) => formatDateLabel(it.date));
  const usersData = items.map((it) => it.totalUsers || 0);
  const messagesData = items.map((it) => it.totalMessages || 0);
  const activeData = items.map((it) => it.activeUsers || 0);

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true } },
    scales: { x: { ticks: { autoSkip: true } }, y: { beginAtZero: true } },
  };

  if (loading) return <div className="text-gray-600">Loading dashboard...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 md:items-end">
          <div>
            <label className="block text-sm text-gray-700">Start date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 focus:border-lightgreen-500 focus:ring-lightgreen-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700">End date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 focus:border-lightgreen-500 focus:ring-lightgreen-500"
            />
          </div>
          <div className="md:ml-auto flex gap-2">
            <button
              onClick={() => { setStartDate(''); setEndDate(''); }}
              className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Clear
            </button>
            <button
              onClick={fetchData}
              className="px-4 py-2 rounded bg-lightgreen-500 text-white hover:bg-lightgreen-600"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <SummaryCard title="Total Users (range)" value={totals.totalUsers} sub="Sum over the selected period" />
        <SummaryCard title="Total Messages (range)" value={totals.totalMessages} sub="Sum over the selected period" />
        <SummaryCard title="Active Users (latest)" value={totals.activeUsers} sub="Latest data point" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm h-80">
          <h3 className="text-gray-800 font-medium mb-2">Users & Messages Over Time</h3>
          <Line
            options={lineOptions}
            data={{
              labels,
              datasets: [
                {
                  label: 'Users (+/day)',
                  data: usersData,
                  borderColor: '#22c55e',
                  backgroundColor: 'rgba(34,197,94,0.2)',
                  tension: 0.3,
                },
                {
                  label: 'Messages (+/day)',
                  data: messagesData,
                  borderColor: '#60a5fa',
                  backgroundColor: 'rgba(96,165,250,0.2)',
                  tension: 0.3,
                },
              ],
            }}
          />
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm h-80">
          <h3 className="text-gray-800 font-medium mb-2">Active Users</h3>
          <Bar
            options={lineOptions}
            data={{
              labels,
              datasets: [
                {
                  label: 'Active Users',
                  data: activeData,
                  backgroundColor: 'rgba(34,197,94,0.5)',
                },
              ],
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
