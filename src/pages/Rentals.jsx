import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

function RentalForm({ onSave, onCancel }) {
  const [form, setForm] = useState({ customerId: '', vehicleId: '', startDate: '', expectedReturn: '', weeklyRate: '', deposit: 0, notes: '' });
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    api.get('/customers').then(r => setCustomers(r.data));
    api.get('/vehicles?status=available').then(r => setVehicles(r.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/rentals', form);
      toast.success('Rental created');
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error');
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">Customer *</label>
          <select className="input" value={form.customerId} onChange={e => set('customerId', e.target.value)} required>
            <option value="">Select customer</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
          </select>
        </div>
        <div><label className="label">Vehicle *</label>
          <select className="input" value={form.vehicleId} onChange={e => {
            set('vehicleId', e.target.value);
            const v = vehicles.find(v => v.id === Number(e.target.value));
            if (v) set('weeklyRate', v.weeklyRate);
          }} required>
            <option value="">Select vehicle</option>
            {vehicles.map(v => <option key={v.id} value={v.id}>{v.brand} {v.model} ({v.plate}) — ${v.weeklyRate}/wk</option>)}
          </select>
        </div>
        <div><label className="label">Start Date *</label><input className="input" type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} required /></div>
        <div><label className="label">Expected Return <span className="text-white/20 normal-case">(optional)</span></label><input className="input" type="date" value={form.expectedReturn} onChange={e => set('expectedReturn', e.target.value)} /></div>
        <div><label className="label">Weekly Rate ($) *</label><input className="input" type="number" value={form.weeklyRate} onChange={e => set('weeklyRate', e.target.value)} required /></div>
        <div><label className="label">Deposit ($)</label><input className="input" type="number" value={form.deposit} onChange={e => set('deposit', e.target.value)} /></div>
      </div>
      <div><label className="label">Notes</label><textarea className="input resize-none" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} /></div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Creating...' : 'Create Rental'}</button>
      </div>
    </form>
  );
}

const STATUS_LABELS = { active: 'Active', finished: 'Finished', late: 'Late', cancelled: 'Cancelled' };

export default function Rentals() {
  const [rentals, setRentals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchParams] = useSearchParams();
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');

  const load = () => api.get('/rentals').then(r => setRentals(r.data));
  useEffect(() => { load(); }, []);

  const filtered = rentals.filter(r => !statusFilter || r.status === statusFilter);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Rentals</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-1.5">
          <Plus size={14} /> New Rental
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2 className="text-sm font-medium mb-4">New Rental</h2>
          <RentalForm onSave={() => { setShowForm(false); load(); }} onCancel={() => setShowForm(false)} />
        </div>
      )}

      <select className="input w-40" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
        <option value="">All status</option>
        {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>

      <div className="space-y-2">
        {filtered.map(r => (
          <Link key={r.id} to={`/rentals/${r.id}`} className="card flex items-center justify-between gap-3 hover:border-white/20 transition-colors block">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-medium">{r.customer.fullName}</span>
                <span className={`badge-${r.status}`}>{r.status}</span>
              </div>
              <p className="text-xs text-white/40">
                {r.vehicle.brand} {r.vehicle.model} ({r.vehicle.plate}) · 
                {format(new Date(r.startDate), ' MMM d')} → {r.expectedReturn ? format(new Date(r.expectedReturn), ' MMM d, yyyy') : ' open-ended'} · 
                ${r.weeklyRate}/wk
              </p>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && <p className="text-sm text-white/30 text-center py-8">No rentals found</p>}
      </div>
    </div>
  );
}
