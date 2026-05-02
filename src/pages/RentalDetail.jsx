import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ArrowLeft, Plus, Pencil } from 'lucide-react';

function PaymentForm({ rental, initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || {
    amount: '', method: 'cash', type: 'rental', status: 'paid', notes: '',
    paidAt: new Date().toISOString().slice(0, 10)
  });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (initial?.id) {
        await api.put(`/payments/${initial.id}`, form);
        toast.success('Payment updated');
      } else {
        await api.post('/payments', { ...form, rentalId: rental.id, customerId: rental.customerId, vehicleId: rental.vehicleId });
        toast.success('Payment added');
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error');
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">Amount ($)</label><input className="input" type="number" value={form.amount} onChange={e => set('amount', e.target.value)} /></div>
        <div><label className="label">Date</label><input className="input" type="date" value={form.paidAt?.slice(0,10)} onChange={e => set('paidAt', e.target.value)} /></div>
        <div><label className="label">Method</label>
          <select className="input" value={form.method} onChange={e => set('method', e.target.value)}>
            {['cash', 'zelle', 'card', 'transfer', 'other'].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div><label className="label">Type</label>
          <select className="input" value={form.type} onChange={e => set('type', e.target.value)}>
            {['rental', 'deposit', 'fine', 'maintenance', 'other'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div><label className="label">Status</label>
          <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
            {['paid', 'pending', 'late'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div><label className="label">Notes</label><input className="input" value={form.notes} onChange={e => set('notes', e.target.value)} /></div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : initial ? 'Update' : 'Add Payment'}</button>
      </div>
    </form>
  );
}

function RentalEditForm({ rental, onSave, onCancel }) {
  const [form, setForm] = useState({
    startDate: rental.startDate?.slice(0, 10),
    expectedReturn: rental.expectedReturn?.slice(0, 10) || '',
    weeklyRate: rental.weeklyRate,
    deposit: rental.deposit,
    status: rental.status,
    notes: rental.notes || '',
  });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/rentals/${rental.id}`, {
        ...form,
        expectedReturn: form.expectedReturn || null,
      });
      toast.success('Rental updated');
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error');
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">Start Date</label><input className="input" type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} /></div>
        <div><label className="label">Expected Return <span className="text-white/20 normal-case">(optional)</span></label><input className="input" type="date" value={form.expectedReturn} onChange={e => set('expectedReturn', e.target.value)} /></div>
        <div><label className="label">Weekly Rate ($)</label><input className="input" type="number" value={form.weeklyRate} onChange={e => set('weeklyRate', e.target.value)} /></div>
        <div><label className="label">Deposit ($)</label><input className="input" type="number" value={form.deposit} onChange={e => set('deposit', e.target.value)} /></div>
        <div><label className="label">Status</label>
          <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
            {['active', 'finished', 'late', 'cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div><label className="label">Notes</label><textarea className="input resize-none" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} /></div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : 'Update Rental'}</button>
      </div>
    </form>
  );
}

export default function RentalDetail() {
  const { id } = useParams();
  const [rental, setRental] = useState(null);
  const [showPayForm, setShowPayForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [showRentalEdit, setShowRentalEdit] = useState(false);

  const load = () => api.get(`/rentals/${id}`).then(r => setRental(r.data));
  useEffect(() => { load(); }, [id]);

  const deletePayment = async (paymentId) => {
    if (!confirm('Delete this payment?')) return;
    try {
      await api.delete(`/payments/${paymentId}`);
      toast.success('Payment deleted');
      load();
    } catch { toast.error('Error deleting payment'); }
  };

  if (!rental) return <div className="text-white/40 text-sm">Loading...</div>;

  const days = rental.expectedReturn
    ? Math.ceil((new Date(rental.expectedReturn) - new Date(rental.startDate)) / (1000 * 60 * 60 * 24))
    : Math.ceil((new Date() - new Date(rental.startDate)) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/rentals" className="text-white/40 hover:text-white/70"><ArrowLeft size={16} /></Link>
        <h1 className="text-lg font-semibold">Rental #{rental.id}</h1>
        <span className={`badge-${rental.status}`}>{rental.status}</span>
        <button onClick={() => setShowRentalEdit(!showRentalEdit)} className="ml-auto text-white/30 hover:text-white/60 flex items-center gap-1 text-xs transition-colors">
          <Pencil size={12} /> Edit
        </button>
      </div>

      {showRentalEdit && (
        <div className="card">
          <h2 className="text-sm font-medium mb-3">Edit Rental</h2>
          <RentalEditForm rental={rental} onSave={() => { setShowRentalEdit(false); load(); }} onCancel={() => setShowRentalEdit(false)} />
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card space-y-2">
          <h2 className="text-sm font-medium mb-3">Details</h2>
          {[
            ['Customer', <Link to={`/customers/${rental.customerId}`} className="hover:text-primary-400">{rental.customer.fullName}</Link>],
            ['Vehicle', <Link to={`/vehicles/${rental.vehicleId}`} className="hover:text-primary-400">{rental.vehicle.brand} {rental.vehicle.model} ({rental.vehicle.plate})</Link>],
            ['Start', format(new Date(rental.startDate), 'MMM d, yyyy')],
            ['Expected Return', rental.expectedReturn ? format(new Date(rental.expectedReturn), 'MMM d, yyyy') : 'Open-ended'],
            ['Duration', `${days} days${!rental.expectedReturn ? ' so far' : ''}`],
            ['Weekly Rate', `$${rental.weeklyRate}`],
            ['Deposit', `$${rental.deposit}`],
          ].map(([l, v]) => (
            <div key={l} className="flex justify-between text-sm"><span className="text-white/40">{l}</span><span>{v}</span></div>
          ))}
          {rental.notes && <p className="text-xs text-white/30 mt-2">{rental.notes}</p>}
        </div>

        <div className="card">
          <h2 className="text-sm font-medium mb-3">Payment Summary</h2>
          <div className="space-y-2">
            {[
              ['Total Due', `$${rental.totalDue?.toFixed(2)}`],
              ['Total Paid', `$${rental.totalPaid?.toFixed(2)}`],
              ['Pending Balance', `$${rental.pendingBalance?.toFixed(2)}`],
              ['Deposit Paid', `$${rental.depositPaid?.toFixed(2)}`],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between text-sm">
                <span className="text-white/40">{l}</span>
                <span className={l === 'Pending Balance' && rental.pendingBalance > 0 ? 'text-yellow-400' : ''}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium">Payments</h2>
          <button onClick={() => { setEditingPayment(null); setShowPayForm(!showPayForm); }} className="btn-primary flex items-center gap-1 text-xs">
            <Plus size={12} /> Add Payment
          </button>
        </div>

        {showPayForm && !editingPayment && (
          <div className="mb-4 pb-4 border-b border-white/10">
            <PaymentForm rental={rental} onSave={() => { setShowPayForm(false); load(); }} onCancel={() => setShowPayForm(false)} />
          </div>
        )}

        {rental.payments.map(p => (
          <div key={p.id}>
            {editingPayment?.id === p.id ? (
              <div className="py-3 border-b border-white/10">
                <PaymentForm
                  rental={rental}
                  initial={{ ...p, paidAt: p.paidAt?.slice(0, 10) }}
                  onSave={() => { setEditingPayment(null); load(); }}
                  onCancel={() => setEditingPayment(null)}
                />
              </div>
            ) : (
              <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-sm">{p.type} · {p.method}</p>
                  <p className="text-xs text-white/30">{format(new Date(p.paidAt), 'MMM d, yyyy')} {p.notes ? `· ${p.notes}` : ''}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium">${p.amount.toFixed(2)}</p>
                    <span className={`badge-${p.status}`}>{p.status}</span>
                  </div>
                  <button onClick={() => { setEditingPayment(p); setShowPayForm(false); }} className="text-white/25 hover:text-white/60 transition-colors">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => deletePayment(p.id)} className="text-white/20 hover:text-red-400 transition-colors text-xs">✕</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {rental.payments.length === 0 && <p className="text-xs text-white/30">No payments yet</p>}
      </div>
    </div>
  );
}
