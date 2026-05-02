import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const STATUS_LABELS = { available: 'Available', rented: 'Rented', maintenance: 'Maintenance', inactive: 'Inactive' };

function VehicleForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || { brand: '', model: '', year: new Date().getFullYear(), plate: '', vin: '', color: '', mileage: 0, weeklyRate: '', notes: '', status: 'available', docExpiry: '' });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (initial?.id) await api.put(`/vehicles/${initial.id}`, form);
      else await api.post('/vehicles', form);
      toast.success(initial ? 'Vehicle updated' : 'Vehicle added');
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error saving vehicle');
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">Brand</label><input className="input" value={form.brand} onChange={e => set('brand', e.target.value)} /></div>
        <div><label className="label">Model</label><input className="input" value={form.model} onChange={e => set('model', e.target.value)} /></div>
        <div><label className="label">Year</label><input className="input" type="number" value={form.year} onChange={e => set('year', e.target.value)} /></div>
        <div><label className="label">Color</label><input className="input" value={form.color} onChange={e => set('color', e.target.value)} /></div>
        <div><label className="label">Plate</label><input className="input" value={form.plate} onChange={e => set('plate', e.target.value)} /></div>
        <div><label className="label">VIN</label><input className="input" value={form.vin} onChange={e => set('vin', e.target.value)} /></div>
        <div><label className="label">Mileage</label><input className="input" type="number" value={form.mileage} onChange={e => set('mileage', e.target.value)} /></div>
        <div><label className="label">Weekly Rate ($)</label><input className="input" type="number" value={form.weeklyRate} onChange={e => set('weeklyRate', e.target.value)} /></div>
        <div><label className="label">Doc Expiry Date</label><input className="input" type="date" value={form.docExpiry?.slice(0,10) || ''} onChange={e => set('docExpiry', e.target.value)} /></div>
        {initial && <div><label className="label">Status</label>
          <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
            {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>}
      </div>
      <div><label className="label">Notes</label><textarea className="input resize-none" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} /></div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : 'Save'}</button>
      </div>
    </form>
  );
}

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = () => api.get('/vehicles').then(r => setVehicles(r.data));
  useEffect(() => { load(); }, []);

  const filtered = vehicles.filter(v => {
    const q = search.toLowerCase();
    const match = !q || `${v.brand} ${v.model} ${v.plate}`.toLowerCase().includes(q);
    const status = !statusFilter || v.status === statusFilter;
    return match && status;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Vehicles</h1>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary flex items-center gap-1.5">
          <Plus size={14} /> Add Vehicle
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2 className="text-sm font-medium mb-4">{editing ? 'Edit Vehicle' : 'New Vehicle'}</h2>
          <VehicleForm initial={editing} onSave={() => { setShowForm(false); setEditing(null); load(); }} onCancel={() => { setShowForm(false); setEditing(null); }} />
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input className="input pl-8" placeholder="Search vehicles..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-36" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All status</option>
          {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        {filtered.map(v => (
          <div key={v.id} className="card flex items-center justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <Link to={`/vehicles/${v.id}`} className="text-sm font-medium hover:text-primary-400 transition-colors">
                  {v.brand} {v.model} {v.year}
                </Link>
                <span className={`badge-${v.status}`}>{STATUS_LABELS[v.status]}</span>
              </div>
              <p className="text-xs text-white/40">{v.plate} · {v.color} · {v.mileage.toLocaleString()} mi · ${v.weeklyRate}/wk</p>
            </div>
            <button onClick={() => { setEditing(v); setShowForm(true); }} className="text-xs text-white/30 hover:text-white/60 transition-colors">Edit</button>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-sm text-white/30 text-center py-8">No vehicles found</p>}
      </div>
    </div>
  );
}
