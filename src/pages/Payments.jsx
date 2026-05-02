import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { format } from 'date-fns';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [searchParams] = useSearchParams();
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');

  useEffect(() => {
    const params = statusFilter ? `?status=${statusFilter}` : '';
    api.get(`/payments${params}`).then(r => setPayments(r.data));
  }, [statusFilter]);

  const total = payments.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Payments</h1>
        <span className="text-sm text-white/40">Total: <span className="text-white font-medium">${total.toFixed(2)}</span></span>
      </div>

      <select className="input w-40" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
        <option value="">All status</option>
        <option value="paid">Paid</option>
        <option value="pending">Pending</option>
        <option value="late">Late</option>
      </select>

      <div className="card">
        {payments.map(p => (
          <div key={p.id} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
            <div className="flex-1">
              <p className="text-sm font-medium">{p.customer?.fullName}</p>
              <p className="text-xs text-white/40">{p.type} · {p.method} · {format(new Date(p.paidAt), 'MMM d, yyyy')}</p>
              {p.vehicle && <p className="text-xs text-white/30">{p.vehicle.brand} {p.vehicle.model} ({p.vehicle.plate})</p>}
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">${p.amount.toFixed(2)}</p>
              <span className={`badge-${p.status}`}>{p.status}</span>
            </div>
          </div>
        ))}
        {payments.length === 0 && <p className="text-sm text-white/30 text-center py-8">No payments found</p>}
      </div>
    </div>
  );
}
