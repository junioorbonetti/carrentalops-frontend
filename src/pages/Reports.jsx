import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import api from '../services/api';

function ReportSummary({ data, loading }) {
  if (loading) return <p className="text-sm text-white/30 text-center py-4">Loading...</p>;
  if (!data) return null;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          ['Total Revenue', `$${data.totalRevenue.toFixed(2)}`, 'text-emerald-400'],
          ['Total Paid', `$${data.totalPaid.toFixed(2)}`, 'text-primary-400'],
          ['Pending', `$${data.totalPending.toFixed(2)}`, 'text-yellow-400'],
          ['Payments', data.paymentCount, 'text-white'],
        ].map(([l, v, c]) => (
          <div key={l} className="bg-white/5 rounded-lg p-3">
            <p className="text-xs text-white/40 mb-1">{l}</p>
            <p className={`text-lg font-semibold ${c}`}>{v}</p>
          </div>
        ))}
      </div>
      {data.payments?.length > 0 ? (
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wide mb-2">Payments</p>
          {data.payments.map(p => (
            <div key={p.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <div>
                <p className="text-sm">{p.customer?.fullName}</p>
                <p className="text-xs text-white/30">{p.type} · {p.method} · {format(new Date(p.paidAt), 'MMM d, yyyy')}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">${p.amount.toFixed(2)}</p>
                <span className={`badge-${p.status}`}>{p.status}</span>
              </div>
            </div>
          ))}
        </div>
      ) : <p className="text-sm text-white/30 text-center py-4">No payments in this period</p>}
    </div>
  );
}

export default function Reports() {
  const [tab, setTab] = useState('monthly');
  const [revenueByMonth, setRevenueByMonth] = useState([]);
  const [revenueByVehicle, setRevenueByVehicle] = useState([]);
  const [pendingCustomers, setPendingCustomers] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [customStart, setCustomStart] = useState(format(startOfMonth(now), 'yyyy-MM-dd'));
  const [customEnd, setCustomEnd] = useState(format(endOfMonth(now), 'yyyy-MM-dd'));

  useEffect(() => {
    api.get('/reports/revenue-by-month').then(r => setRevenueByMonth(r.data));
    api.get('/reports/revenue-by-vehicle').then(r => setRevenueByVehicle(r.data));
    api.get('/reports/pending-customers').then(r => setPendingCustomers(r.data));
  }, []);

  useEffect(() => { loadReport(); }, [tab, selectedYear, selectedMonth]);

  const loadReport = () => {
    setLoading(true);
    setReportData(null);
    let url = '';
    if (tab === 'weekly') {
      const start = format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const end = format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      url = `/reports/range?start=${start}&end=${end}`;
    } else if (tab === 'monthly') {
      url = `/reports/monthly?year=${selectedYear}&month=${selectedMonth}`;
    } else if (tab === 'custom') {
      url = `/reports/range?start=${customStart}&end=${customEnd}`;
    }
    api.get(url).then(r => setReportData(r.data)).finally(() => setLoading(false));
  };

  const tooltipStyle = { backgroundColor: '#1a2d42', border: '1px solid rgba(255,255,255,0.1)', color: '#e8edf2', fontSize: 12 };
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">Reports</h1>

      {/* Period Report */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {['weekly', 'monthly', 'custom'].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${tab === t ? 'bg-primary-400 text-primary-900' : 'bg-white/5 text-white/50 hover:text-white/80'}`}>
              {t === 'weekly' ? 'This Week' : t === 'monthly' ? 'Monthly' : 'Custom'}
            </button>
          ))}

          {tab === 'monthly' && (
            <div className="flex gap-2 ml-auto">
              <select className="input w-32 text-xs" value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}>
                {months.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
              </select>
              <select className="input w-24 text-xs" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          )}

          {tab === 'custom' && (
            <div className="flex gap-2 ml-auto items-center">
              <input className="input text-xs w-36" type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} />
              <span className="text-white/30 text-xs">to</span>
              <input className="input text-xs w-36" type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} />
              <button onClick={loadReport} className="btn-primary text-xs">Apply</button>
            </div>
          )}
        </div>

        <ReportSummary data={reportData} loading={loading} />
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
          <div>
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
