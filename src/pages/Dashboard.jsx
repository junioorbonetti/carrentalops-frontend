import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, Users, FileText, CreditCard, Wrench, AlertTriangle, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { format } from 'date-fns';

function StatCard({ label, value, icon: Icon, color = 'text-primary-400', sub }) {
  return (
    <div className="card flex items-start justify-between">
      <div>
        <p className="text-xs text-white/40 uppercase tracking-wide mb-1">{label}</p>
        <p className={`text-2xl font-semibold ${color}`}>{value}</p>
        {sub && <p className="text-xs text-white/30 mt-0.5">{sub}</p>}
      </div>
      <div className={`p-2 rounded-lg bg-white/5 ${color}`}>
        <Icon size={18} />
      </div>
    </div>
  );
}

const DAY_LABELS = {
  monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
  thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday'
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [weekly, setWeekly] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(null);
  const [methodMap, setMethodMap] = useState({});

  const loadAll = () => {
    Promise.all([
      api.get('/dashboard'),
      api.get('/weekly-payments'),
    ]).then(([d, w]) => {
      setData(d.data);
      setWeekly(w.data);
      setLoading(false);
    });
  };

  useEffect(() => { loadAll(); }, []);

  const markPaid = async (rental) => {
    setMarking(rental.id);
    try {
      await api.post('/weekly-payments/mark-paid', {
        rentalId: rental.id,
        customerId: rental.customerId,
        vehicleId: rental.vehicleId,
        amount: rental.weeklyRate,
        method: methodMap[rental.id] || 'cash',
      });
      loadAll();
    } catch {}
    finally { setMarking(null); }
  };

  if (loading) return <div className="text-white/40 text-sm">Loading...</div>;

  // Today's and upcoming payments
  const todayRentals = weekly?.schedule?.find(s => s.isToday)?.rentals || [];
  const upcomingRentals = weekly?.schedule?.filter(s => !s.isToday) || [];

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">Dashboard</h1>

      {/* Alerts */}
      {(data.lateRentals > 0 || data.overdueMaintenance > 0 || data.expiringDocs?.length > 0) && (
        <div className="space-y-2">
          {data.lateRentals > 0 && (
            <Link to="/rentals?status=late" className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400 hover:bg-red-500/15 transition-colors block">
              <AlertTriangle size={15} />
              {data.lateRentals} overdue rental{data.lateRentals > 1 ? 's' : ''} — needs attention
            </Link>
          )}
          {data.expiringDocs?.length > 0 && (
            <Link to="/vehicles" className="flex items-center gap-3 bg-orange-500/10 border border-orange-500/20 rounded-lg px-4 py-3 text-sm text-orange-400 hover:bg-orange-500/15 transition-colors block">
              <AlertTriangle size={15} />
              {data.expiringDocs.length} vehicle doc{data.expiringDocs.length > 1 ? 's' : ''} expiring this month: {data.expiringDocs.map(v => v.plate).join(', ')}
            </Link>
          )}
          {data.overdueMaintenance > 0 && (
            <Link to="/maintenance" className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-3 text-sm text-yellow-400 hover:bg-yellow-500/15 transition-colors block">
              <Wrench size={15} />
              {data.overdueMaintenance} overdue maintenance{data.overdueMaintenance > 1 ? 's' : ''}
            </Link>
          )}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Vehicles" value={data.totalVehicles} icon={Car} />
        <StatCard label="Available" value={data.availableVehicles} icon={Car} color="text-emerald-400" />
        <StatCard label="Rented" value={data.rentedVehicles} icon={Car} color="text-blue-400" />
        <StatCard label="Maintenance" value={data.maintenanceVehicles} icon={Wrench} color="text-yellow-400" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Active Rentals" value={data.activeRentals} icon={FileText} />
        <StatCard label="Late Rentals" value={data.lateRentals} icon={Clock} color="text-red-400" />
        <StatCard label="Month Revenue" value={`$${data.monthRevenue.toFixed(0)}`} icon={TrendingUp} color="text-emerald-400" />
        <StatCard label="Pending Payments" value={data.pendingPayments} icon={CreditCard} color="text-yellow-400" sub={`$${data.pendingAmount.toFixed(0)} total`} />
      </div>

      {/* Today's payments */}
      {todayRentals.length > 0 && (
        <div className="card border-primary-400/20">
          <h2 className="text-sm font-medium mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse"></span>
            Due Today — {DAY_LABELS[weekly.today]}
          </h2>
          <div className="space-y-2">
            {todayRentals.map(r => (
              <div key={r.id} className={`flex items-center justify-between gap-3 p-3 rounded-lg ${r.paidThisWeek ? 'bg-emerald-500/5 border border-emerald-500/15' : 'bg-white/5'}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{r.customerName}</p>
                    {r.paidThisWeek && <CheckCircle size={13} className="text-emerald-400" />}
                  </div>
                  <p className="text-xs text-white/40">{r.vehicle}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">${r.weeklyRate.toFixed(2)}</span>
                  {!r.paidThisWeek ? (
                    <div className="flex items-center gap-1.5">
                      <select className="input text-xs py-1 px-2 w-20" value={methodMap[r.id] || 'cash'} onChange={e => setMethodMap(m => ({ ...m, [r.id]: e.target.value }))}>
                        {['cash', 'zelle', 'card', 'transfer', 'other'].map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <button onClick={() => markPaid(r)} disabled={marking === r.id} className="btn-primary text-xs py-1.5 px-3">
                        {marking === r.id ? '...' : 'Paid'}
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">Paid ✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming payments this week */}
      {upcomingRentals.length > 0 && (
        <div className="card">
          <h2 className="text-sm font-medium mb-3 text-white/60">Upcoming This Week</h2>
          {upcomingRentals.map(({ day, rentals }) => (
            <div key={day} className="mb-3">
              <p className="text-xs text-white/30 uppercase tracking-wide mb-1.5">{DAY_LABELS[day]}</p>
              {rentals.map(r => (
                <div key={r.id} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                  <div>
                    <p className="text-sm">{r.customerName}</p>
                    <p className="text-xs text-white/30">{r.vehicle}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">${r.weeklyRate.toFixed(2)}</p>
                    {r.paidThisWeek && <span className="text-xs text-emerald-400">Paid ✓</span>}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Pending payments list */}
      {data.pendingPaymentsList?.length > 0 && (
        <div className="card">
          <h2 className="text-sm font-medium mb-3">Pending Payments</h2>
          <div className="space-y-0">
            {data.pendingPaymentsList.map(p => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-sm text-white/80">{p.customer?.fullName}</p>
                  <p className="text-xs text-white/30">{p.type} · {p.method}</p>
                </div>
                <span className="text-sm font-medium text-yellow-400">${p.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <Link to="/payments?status=pending" className="block text-xs text-primary-400 hover:underline mt-3">View all →</Link>
        </div>
      )}
    </div>
  );
}
