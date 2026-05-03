import { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  new: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  contacted: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  converted: 'bg-green-500/20 text-green-400 border-green-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const STATUS_LABELS = {
  new: 'Nova',
  contacted: 'Contactado',
  converted: 'Convertido',
  rejected: 'Rejeitado',
};

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, [filter]);

  async function fetchLeads() {
    setLoading(true);
    try {
      const { data } = await api.get('/leads', { params: filter ? { status: filter } : {} });
      setLeads(data);
    } catch {
      toast.error('Erro ao carregar leads.');
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, status) {
    try {
      await api.patch(`/leads/${id}/status`, { status });
      toast.success('Status atualizado!');
      fetchLeads();
      if (selected?.id === id) setSelected(prev => ({ ...prev, status }));
    } catch {
      toast.error('Erro ao atualizar status.');
    }
  }

  async function convertLead(id) {
    setConverting(true);
    try {
      const { data } = await api.post(`/leads/${id}/convert`);
      toast.success('Cliente criado com sucesso!');
      fetchLeads();
      setSelected(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao converter lead.');
    } finally {
      setConverting(false);
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Solicitações de Aluguel</h1>
          <p className="text-gray-400 text-sm mt-1">Leads recebidos pelo catálogo público</p>
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="">Todos</option>
          <option value="new">Novas</option>
          <option value="contacted">Contactados</option>
          <option value="converted">Convertidos</option>
          <option value="rejected">Rejeitados</option>
        </select>
      </div>

      {loading && <p className="text-gray-400 text-center py-20">Carregando...</p>}

      {!loading && leads.length === 0 && (
        <p className="text-gray-500 text-center py-20">Nenhuma solicitação encontrada.</p>
      )}

      <div className="grid gap-4">
        {leads.map(lead => (
          <div
            key={lead.id}
            onClick={() => setSelected(lead)}
            className="bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl p-4 cursor-pointer transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-white font-semibold">{lead.fullName}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[lead.status]}`}>
                    {STATUS_LABELS[lead.status]}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">{lead.email} · {lead.phone}</p>
                <p className="text-gray-500 text-sm mt-1">
                  {lead.vehicle?.brand} {lead.vehicle?.model} {lead.vehicle?.year}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-gray-500 text-xs">
                  {new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
                {lead.hasWhatsapp && (
                  <span className="text-green-400 text-xs mt-1 block">WhatsApp ✓</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de detalhe */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
          onClick={e => e.target === e.currentTarget && setSelected(null)}
        >
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Detalhes da Solicitação</h2>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white text-2xl leading-none">×</button>
            </div>

            <div className="space-y-3 mb-6">
              <Row label="Nome" value={selected.fullName} />
              <Row label="Email" value={selected.email} />
              <Row label="Telefone" value={selected.phone} />
              <Row label="Driver License" value={selected.licenseNumber} />
              {selected.dlPhone && <Row label="DL Phone" value={selected.dlPhone} />}
              <Row label="WhatsApp" value={selected.hasWhatsapp ? `Sim — ${selected.whatsappNumber || selected.phone}` : 'Não'} />
              <Row label="Veículo" value={`${selected.vehicle?.brand} ${selected.vehicle?.model} ${selected.vehicle?.year}`} />
              <Row label="Status" value={STATUS_LABELS[selected.status]} />
              {selected.convertedToId && (
                <Row label="Customer ID" value={`#${selected.convertedToId}`} />
              )}
            </div>

            {/* Ações de status */}
            {selected.status !== 'converted' && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selected.status !== 'new' && (
                  <button onClick={() => updateStatus(selected.id, 'new')} className="text-xs px-3 py-1.5 rounded-lg border border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
                    Marcar Nova
                  </button>
                )}
                {selected.status !== 'contacted' && (
                  <button onClick={() => updateStatus(selected.id, 'contacted')} className="text-xs px-3 py-1.5 rounded-lg border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10">
                    Marcar Contactado
                  </button>
                )}
                {selected.status !== 'rejected' && (
                  <button onClick={() => updateStatus(selected.id, 'rejected')} className="text-xs px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10">
                    Rejeitar
                  </button>
                )}
              </div>
            )}

            {/* Converter em cliente */}
            {selected.status !== 'converted' && (
              <button
                onClick={() => convertLead(selected.id)}
                disabled={converting}
                className="w-full bg-green-600 hover:bg-green-500 disabled:bg-green-900 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
              >
                {converting ? 'Criando cliente...' : '✓ Converter em Cliente'}
              </button>
            )}

            {selected.status === 'converted' && (
              <div className="text-center py-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-green-400 text-sm font-medium">✓ Lead convertido — Customer #{selected.convertedToId}</p>
                <p className="text-gray-500 text-xs mt-1">Vá em Rentals para vincular ao veículo</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-gray-500 text-sm w-28 shrink-0">{label}</span>
      <span className="text-white text-sm">{value}</span>
    </div>
  );
}