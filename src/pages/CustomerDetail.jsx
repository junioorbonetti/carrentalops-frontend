import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';

export default function CustomerDetail() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);

  useEffect(() => { api.get(`/customers/${id}`).then(r => setCustomer(r.data)); }, [id]);
  if (!customer) return <div className="text-white/40 text-sm">Loading...</div>;

  const pendingAmount = customer.payments.filter(p => p.status === 'pending' || p.status === 'late').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/customers" className="text-white/40 hover:text-white/70"><ArrowLeft size={16} /></Link>
        <h1 className="text-lg font-semibold">{customer.fullName}</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card space-y-2">
          <h2 className="text-sm font-medium mb-3">Info</h2>
          {[['Phone', customer.phone], ['Email', customer.email || '—'], ['Address', customer.address || '—'], ['License #', customer.licenseNumber], ['License Expiry', format(new Date(customer.licenseExpiry), 'MMM d, yyyy')]].map(([l, v]) => (
            <div key={l} className="flex justify-between text-sm">
              <span className="text-white/40">{l}</span><span>{v}</span>
            </div>
          ))}
          {pendingAmount > 0 && <div className="mt-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2 text-sm text-yellow-400">Pending balance: ${pendingAmount.toFixed(2)}</div>}
        </div>

        <div className="card">
          <h2 className="text-sm font-medium mb-3">Rental History</h2>
          {customer.rentals.map(r => (
            <div key={r.id} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
              <div>
                <Link to={`/rentals/${r.id}`} className="text-sm hover:text-primary-400">{r.vehicle.brand} {r.vehicle.model}</Link>
                <p className="text-xs text-white/30">{format(new Date(r.startDate), 'MMM d, yyyy')}</p>
              </div>
              <span className={`badge-${r.status}`}>{r.status}</span>
            </div>
          ))}
          {customer.rentals.length === 0 && <p className="text-xs text-white/30">No rentals yet</p>}
        </div>
      </div>

      <div className="card">
        <h2 className="text-sm font-medium mb-3">Payment History</h2>
        {customer.payments.map(p => (
          <div key={p.id} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
            <div>
              <p className="text-sm">{p.type} · {p.method}</p>
              <p className="text-xs text-white/30">{format(new Date(p.paidAt), 'MMM d, yyyy')}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">${p.amount.toFixed(2)}</p>
              <span className={`badge-${p.status}`}>{p.status}</span>
            </div>
          </div>
        ))}
        {customer.payments.length === 0 && <p className="text-xs text-white/30">No payments yet</p>}
      </div>
    </div>
  );
}
