import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const TYPES = ['preventive', 'corrective', 'cleaning', 'tires', 'windshield', 'brakes', 'battery', 'other'];

function MaintenanceForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || { vehicleId: '', type: 'oil', date: new Date().toISOString().slice(0, 10), mileage: '', cost: 0, status: 'pending', shop: '', notes: '', nextMaintenanceDate: '', nextMileage: '' });
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => { api.get('/vehicles').then(r => setVehicles(r.data)); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (initial?.id) await api.put(`/maintenance/${initial.id}`, form);
      else await api.post('/maintenance', form);
      toast.success(initial ? 'Updated' : 'Maintenance added');
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error');
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">Vehicle *</label>
          <select className="input" value={form.vehicleId} onChange={e => set('vehicleId', e.target.value)} required>
            <option value="">Select vehicle</option>
            {vehicles.map(v => <option key={v.id} value={v.id}>{v.brand} {v.model} ({v.plate})</option>)}
          </select>
        </div>
        <div><label className="label">Type *</label>
          <select className="input" value={form.type} onChange={e => set('type', e.target.value)}>
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div><label className="label">Date *</label><input className="input" type="date" value={form.date?.slice(0,10)} onChange={e => set('date', e.target.value)} required /></div>
        <div><label className="label">Mileage</label><input className="input" type="number" value={form.mileage} onChange={e => set('mileage', e.target.value)} /></div>
        <div><label className="label">Cost ($)</label><input className="input" type="number" value={form.cost} onChange={e => set('cost', e.target.value)} /></div>
        <div><label className="label">Status</label>
          <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
            {['pending', 'in_progress', 'completed'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div><label className="label">Shop / Responsible</label><input className="input" value={form.shop} onChange={e => set('shop', e.target.value)} /></div>
        <div><label className="label">Next Maintenance Date</label><input className="input" type="date" value={form.nextMaintenanceDate?.slice(0,10)} onChange={e => set('nextMaintenanceDate', e.target.value)} /></div>
        <div><label className="label">Next Mileage</label><input className="input" type="number" value={form.nextMileage} onChange={e => set('nextMileage', e.target.value)} /></div>
      </div>
      <div><label className="label">Notes</label><textarea className="input resize-none" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} /></div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : 'Save'}</button>
      </div>
    </form>
  );
}

export default function Maintenance() {
  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const load = () => api.get('/maintenance').then(r => setRecords(r.data));
  useEffect(() => { load(); }, []);

  const filtered = records.filter(r => !statusFilter || r.status === statusFilter);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Maintenance</h1>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary flex items-center gap-1.5">
          <Plus size={14} /> Add Record
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2 className="text-sm font-medium mb-4">{editing ? 'Edit Record' : 'New Maintenance'}</h2>
          <MaintenanceForm initial={editing} onSave={() => { setShowForm(false); setEditing(null); load(); }} onCancel={() => { setShowForm(false); setEditing(null); }} />
        </div>
      )}

      <select className="input w-40" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
        <option value="">All status</option>
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>

      <div className="space-y-2">
        {filtered.map(r => (
          <div key={r.id} className="card flex items-center justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-medium">{r.vehicle.brand} {r.vehicle.model} ({r.vehicle.plate})</span>
                <span className={`badge-${r.status}`}>{r.status}</span>
              </div>
              <p className="text-xs text-white/40">
                {r.type} · {format(new Date(r.date), 'MMM d, yyyy')}
                {r.cost > 0 ? ` · $${r.cost}` : ''}
                {r.shop ? ` · ${r.shop}` : ''}
              </p>
              {r.nextMaintenanceDate && <p className="text-xs text-yellow-400/60 mt-0.5">Next: {format(new Date(r.nextMaintenanceDate), 'MMM d, yyyy')}</p>}
            </div>
            <button onClick={() => { setEditing({ ...r, date: r.date?.slice(0,10), nextMaintenanceDate: r.nextMaintenanceDate?.slice(0,10) }); setShowForm(true); }} className="text-xs text-white/30 hover:text-white/60 transition-colors">Edit</button>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-sm text-white/30 text-center py-8">No maintenance records</p>}
      </div>
    </div>
  );
}
