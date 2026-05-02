import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

function CustomerForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || { fullName: '', phone: '', email: '', address: '', licenseNumber: '', licenseExpiry: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (initial?.id) await api.put(`/customers/${initial.id}`, form);
      else await api.post('/customers', form);
      toast.success(initial ? 'Customer updated' : 'Customer added');
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error');
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2"><label className="label">Full Name</label><input className="input" value={form.fullName} onChange={e => set('fullName', e.target.value)} /></div>
        <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
        <div><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} /></div>
        <div className="col-span-2"><label className="label">Address</label><input className="input" value={form.address} onChange={e => set('address', e.target.value)} /></div>
        <div><label className="label">License #</label><input className="input" value={form.licenseNumber} onChange={e => set('licenseNumber', e.target.value)} /></div>
        <div><label className="label">License Expiry</label><input className="input" type="date" value={form.licenseExpiry?.slice(0, 10)} onChange={e => set('licenseExpiry', e.target.value)} /></div>
      </div>
      <div><label className="label">Notes</label><textarea className="input resize-none" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} /></div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : 'Save'}</button>
      </div>
    </form>
  );
}

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = () => api.get('/customers').then(r => setCustomers(r.data));
  useEffect(() => { load(); }, []);

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    return !q || `${c.fullName} ${c.phone} ${c.email}`.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Customers</h1>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary flex items-center gap-1.5">
          <Plus size={14} /> Add Customer
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2 className="text-sm font-medium mb-4">{editing ? 'Edit Customer' : 'New Customer'}</h2>
          <CustomerForm initial={editing} onSave={() => { setShowForm(false); setEditing(null); load(); }} onCancel={() => { setShowForm(false); setEditing(null); }} />
        </div>
      )}

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input className="input pl-8" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="space-y-2">
        {filtered.map(c => (
          <div key={c.id} className="card flex items-center justify-between gap-3">
            <div className="flex-1">
              <Link to={`/customers/${c.id}`} className="text-sm font-medium hover:text-primary-400 transition-colors">{c.fullName}</Link>
              <p className="text-xs text-white/40">{c.phone} {c.email ? `· ${c.email}` : ''} · License expires {format(new Date(c.licenseExpiry), 'MMM d, yyyy')}</p>
            </div>
            <button onClick={() => { setEditing(c); setShowForm(true); }} className="text-xs text-white/30 hover:text-white/60 transition-colors">Edit</button>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-sm text-white/30 text-center py-8">No customers found</p>}
      </div>
    </div>
  );
}
