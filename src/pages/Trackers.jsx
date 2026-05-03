import { useState, useEffect } from 'react';
import api from '../services/api';
import { Wifi, WifiOff, Plus, Link, Unlink, Zap, ZapOff, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Trackers() {
  const [trackers, setTrackers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedImei, setExpandedImei] = useState(null);
  const [form, setForm] = useState({ imei: '', label: '', simNumber: '' });
  const [assignMap, setAssignMap] = useState({});

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchTrackers, 15000);
    return () => clearInterval(interval);
  }, []);

  async function fetchAll() {
    await Promise.all([fetchTrackers(), fetchVehicles()]);
    setLoading(false);
  }

  async function fetchTrackers() {
    try {
      const { data } = await api.get('/trackers');
      setTrackers(data);
    } catch { toast.error('Erro ao carregar trackers'); }
  }

  async function fetchVehicles() {
    try {
      const { data } = await api.get('/vehicles');
      setVehicles(data);
    } catch {}
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await api.post('/trackers', form);
      toast.success('Tracker cadastrado!');
      setForm({ imei: '', label: '', simNumber: '' });
      setShowForm(false);
      fetchTrackers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao cadastrar');
    }
  }

  async function handleAssign(imei) {
    const vehicleId = assignMap[imei];
    if (!vehicleId) return toast.error('Selecione um veículo');
    try {
      await api.patch(`/trackers/${imei}/assign`, { vehicleId });
      toast.success('Tracker vinculado!');
      fetchTrackers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao vincular');
    }
  }

  async function handleUnassign(imei) {
    try {
      await api.patch(`/trackers/${imei}/unassign`);
      toast.success('Tracker desvinculado');
      fetchTrackers();
    } catch { toast.error('Erro ao desvincular'); }
  }

  async function handleRelay(imei, action) {
    try {
      await api.post(`/trackers/${imei}/relay`, { action });
      toast.success(action === 'cut' ? '🔴 Motor cortado!' : '🟢 Motor liberado!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Dispositivo offline');
    }
  }

  async function handleDelete(imei) {
    if (!confirm(`Remover tracker ${imei}?`)) return;
    try {
      await api.delete(`/trackers/${imei}`);
      toast.success('Tracker removido');
      fetchTrackers();
    } catch { toast.error('Erro ao remover'); }
  }

  const unassignedVehicles = vehicles.filter(v => !trackers.find(t => t.vehicleId === v.id));

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">GPS Trackers</h1>
          <p className="text-sm text-white/40 mt-0.5">{trackers.length} dispositivos cadastrados</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-400 text-black rounded-lg text-sm font-medium hover:bg-primary-300 transition-colors"
        >
          <Plus size={15} />
          Novo Tracker
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-sm font-medium mb-4">Cadastrar novo dispositivo J16</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-white/50 block mb-1.5">IMEI *</label>
              <input
                value={form.imei}
                onChange={e => setForm({ ...form, imei: e.target.value })}
                placeholder="358xxxxxxxxx"
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-400"
              />
              <p className="text-xs text-white/30 mt-1">Impresso na caixa ou etiqueta do dispositivo</p>
            </div>
            <div>
              <label className="text-xs text-white/50 block mb-1.5">Apelido</label>
              <input
                value={form.label}
                onChange={e => setForm({ ...form, label: e.target.value })}
                placeholder="J16 #01"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-400"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 block mb-1.5">Número do SIM</label>
              <input
                value={form.simNumber}
                onChange={e => setForm({ ...form, simNumber: e.target.value })}
                placeholder="+1 555 0000"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-400"
              />
            </div>
            <div className="md:col-span-3 flex gap-3">
              <button type="submit" className="px-4 py-2 bg-primary-400 text-black rounded-lg text-sm font-medium hover:bg-primary-300 transition-colors">
                Cadastrar
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-white/5 rounded-lg text-sm hover:bg-white/10 transition-colors">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SMS Config box */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <p className="text-xs font-medium text-blue-400 mb-2">📡 Configurar J16 via SMS</p>
        <p className="text-xs text-white/50 mb-2">Envie esses SMS pro número do SIM card do dispositivo:</p>
        <div className="space-y-1 font-mono text-xs text-white/70">
          <div>SERVER,0,<span className="text-primary-400">209.38.73.192</span>,8821,0#</div>
          <div>APN,wholesale#</div>
          <div>TIMER,30#</div>
        </div>
      </div>

      {/* Trackers list */}
      {trackers.length === 0 ? (
        <div className="text-center py-16 text-white/30 text-sm">
          Nenhum tracker cadastrado ainda
        </div>
      ) : (
        <div className="space-y-3">
          {trackers.map(tracker => (
            <div key={tracker.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              {/* Main row */}
              <div className="flex items-center gap-4 p-4">
                {/* Status online/offline */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${tracker.online ? 'bg-green-500/20' : 'bg-white/5'}`}>
                  {tracker.online
                    ? <Wifi size={14} className="text-green-400" />
                    : <WifiOff size={14} className="text-white/30" />
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{tracker.label || tracker.id}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${tracker.online ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-white/30'}`}>
                      {tracker.online ? 'Online' : 'Offline'}
                    </span>
                    {!tracker.active && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">
                        Não vinculado
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-white/30 font-mono">{tracker.id}</span>
                    {tracker.simNumber && <span className="text-xs text-white/30">{tracker.simNumber}</span>}
                    {tracker.vehicle && (
                      <span className="text-xs text-primary-400">
                        {tracker.vehicle.plate} — {tracker.vehicle.brand} {tracker.vehicle.model}
                      </span>
                    )}
                  </div>
                  {tracker.lastSeen && (
                    <p className="text-xs text-white/20 mt-0.5">
                      Visto: {new Date(tracker.lastSeen).toLocaleString('pt-BR')}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {tracker.vehicle && (
                    <>
                      <button
                        onClick={() => handleRelay(tracker.id, 'cut')}
                        title="Cortar motor"
                        className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        <ZapOff size={14} />
                      </button>
                      <button
                        onClick={() => handleRelay(tracker.id, 'release')}
                        title="Liberar motor"
                        className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                      >
                        <Zap size={14} />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setExpandedImei(expandedImei === tracker.id ? null : tracker.id)}
                    className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-white/50"
                  >
                    {expandedImei === tracker.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  <button
                    onClick={() => handleDelete(tracker.id)}
                    className="p-2 bg-white/5 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-colors text-white/30"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Expanded — vincular/desvincular */}
              {expandedImei === tracker.id && (
                <div className="border-t border-white/10 p-4 bg-white/3">
                  {tracker.vehicle ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-white/50">Vinculado a:</p>
                        <p className="text-sm font-medium mt-0.5">
                          {tracker.vehicle.plate} — {tracker.vehicle.brand} {tracker.vehicle.model} {tracker.vehicle.year}
                        </p>
                      </div>
                      <button
                        onClick={() => handleUnassign(tracker.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-lg text-xs hover:bg-white/10 transition-colors text-white/50"
                      >
                        <Unlink size={12} />
                        Desvincular
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <select
                        onChange={e => setAssignMap({ ...assignMap, [tracker.id]: e.target.value })}
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-400"
                      >
                        <option value="">Selecionar veículo...</option>
                        {unassignedVehicles.map(v => (
                          <option key={v.id} value={v.id}>
                            {v.plate} — {v.brand} {v.model} {v.year}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleAssign(tracker.id)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-primary-400 text-black rounded-lg text-sm font-medium hover:bg-primary-300 transition-colors"
                      >
                        <Link size={13} />
                        Vincular
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
