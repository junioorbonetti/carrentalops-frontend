import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, Users, FileText, CreditCard, Wrench, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
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

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then(r => { setData(r.data); setLoading(false); });
  }, []);

  if (loading) return <div className="text-white/40 text-sm">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">Dashboard</h1>

      {/* Alerts */}
      {(data.lateRentals > 0 || data.overdueMaintenance > 0) && (
        <div className="space-y-2">
          {data.lateRentals > 0 && (
            <Link to="/rentals?status=late" className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400 hover:bg-red-500/15 transition-colors">
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
            <Link to="/maintenance" className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-3 text-sm text-yellow-400 hover:bg-yellow-500/15 transition-colors">
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

      {/* Pending payments list */}
      {data.pendingPaymentsList?.length > 0 && (
        <div className="card">
          <h2 className="text-sm font-medium mb-3">Pending Payments</h2>
          <div className="space-y-2">
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
          <Link to="/payments?status=pending" className="block text-xs text-primary-400 hover:underline mt-3">
            View all →
          </Link>
        </div>
      )}
    </div>
  );
}
