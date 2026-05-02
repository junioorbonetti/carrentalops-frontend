import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../services/api';

export default function Reports() {
  const [revenueByMonth, setRevenueByMonth] = useState([]);
  const [revenueByVehicle, setRevenueByVehicle] = useState([]);
  const [pendingCustomers, setPendingCustomers] = useState([]);

  useEffect(() => {
    api.get('/reports/revenue-by-month').then(r => setRevenueByMonth(r.data));
    api.get('/reports/revenue-by-vehicle').then(r => setRevenueByVehicle(r.data));
    api.get('/reports/pending-customers').then(r => setPendingCustomers(r.data));
  }, []);

  const tooltipStyle = { backgroundColor: '#1a2d42', border: '1px solid rgba(255,255,255,0.1)', color: '#e8edf2', fontSize: 12 };

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">Reports</h1>

      <div className="card">
        <h2 className="text-sm font-medium mb-4">Revenue by Month</h2>
        {revenueByMonth.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={v => [`$${v.toFixed(2)}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#4db8d4" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <p className="text-sm text-white/30 text-center py-6">No data yet</p>}
      </div>

      <div className="card">
        <h2 className="text-sm font-medium mb-4">Revenue vs Costs by Vehicle</h2>
        {revenueByVehicle.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueByVehicle}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={v => `$${v.toFixed(2)}`} />
              <Bar dataKey="revenue" fill="#4db8d4" radius={[3, 3, 0, 0]} name="Revenue" />
              <Bar dataKey="costs" fill="#e05a5a" radius={[3, 3, 0, 0]} name="Costs" />
              <Bar dataKey="profit" fill="#5dcaa5" radius={[3, 3, 0, 0]} name="Profit" />
            </BarChart>
          </ResponsiveContainer>
        ) : <p className="text-sm text-white/30 text-center py-6">No data yet</p>}
      </div>

      <div className="card">
        <h2 className="text-sm font-medium mb-3">Customers with Pending Balance</h2>
        {pendingCustomers.length > 0 ? (
          <div className="space-y-0">
            {pendingCustomers.map(c => (
              <div key={c.id} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-white/40">{c.phone} · {c.pendingCount} payment{c.pendingCount > 1 ? 's' : ''} pending</p>
                </div>
                <span className="text-sm font-medium text-yellow-400">${c.pendingAmount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-white/30 text-center py-6">No pending balances</p>}
      </div>
    </div>
  );
}
