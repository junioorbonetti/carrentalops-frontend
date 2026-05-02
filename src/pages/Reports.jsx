import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format } from 'date-fns';
import api from '../services/api';

export default function Reports() {
  const [revenueByMonth, setRevenueByMonth] = useState([]);
  const [revenueByVehicle, setRevenueByVehicle] = useState([]);
  const [pendingCustomers, setPendingCustomers] = useState([]);

  // Monthly report state
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [loadingMonthly, setLoadingMonthly] = useState(false);

  useEffect(() => {
    api.get('/reports/revenue-by-month').then(r => setRevenueByMonth(r.data));
    api.get('/reports/revenue-by-vehicle').then(r => setRevenueByVehicle(r.data));
    api.get('/reports/pending-customers').then(r => setPendingCustomers(r.data));
  }, []);

  const loadMonthlyReport = () => {
    setLoadingMonthly(true);
    api.get(`/reports/monthly?year=${selectedYear}&month=${selectedMonth}`)
      .then(r => setMonthlyReport(r.data))
      .finally(() => setLoadingMonthly(false));
  };

  useEffect(() => { loadMonthlyReport(); }, [selectedYear, selectedMonth]);

  const tooltipStyle = { backgroundColor: '#1a2d42', border: '1px solid rgba(255,255,255,0.1)', color: '#e8edf2', fontSize: 12 };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">Reports</h1>

      {/* Monthly Report */}
      <div className="card">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-sm font-medium">Monthly Report</h2>
          <div className="flex gap-2">
            <select className="input w-32 text-xs" value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}>
              {months.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
            </select>
            <select className="input w-24 text-xs" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {loadingMonthly ? (
          <p className="text-sm text-white/30 text-center py-4">Loading...</p>
        ) : monthlyReport ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                ['Total Revenue', `$${monthlyReport.totalRevenue.toFixed(2)}`, 'text-emerald-400'],
                ['Total Paid', `$${monthlyReport.totalPaid.toFixed(2)}`, 'text-primary-400'],
                ['Pending', `$${monthlyReport.totalPending.toFixed(2)}`, 'text-yellow-400'],
                ['Payments', monthlyReport.paymentCount, 'text-white'],
              ].map(([l, v, c]) => (
                <div key={l} className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-white/40 mb-1">{l}</p>
                  <p className={`text-lg font-semibold ${c}`}>{v}</p>
                </div>
              ))}
            </div>

            {monthlyReport.payments.length > 0 && (
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wide mb-2">Payments</p>
                {monthlyReport.payments.map(p => (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div>
                      <p className="text-sm">{p.customer?.fullName}</p>
                      <p className="text-xs text-white/30">{p.type} · {p.method} · {format(new Date(p.paidAt), 'MMM d')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">${p.amount.toFixed(2)}</p>
                      <span className={`badge-${p.status}`}>{p.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {monthlyReport.payments.length === 0 && (
              <p className="text-sm text-white/30 text-center py-4">No payments this month</p>
            )}
          </div>
        ) : null}
      </div>

      {/* Revenue by Month chart */}
      <div className="card">
        <h2 className="text-sm font-medium mb-4">Revenue by Month (All Time)</h2>
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

      {/* Revenue vs Costs by Vehicle */}
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

      {/* Pending customers */}
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
