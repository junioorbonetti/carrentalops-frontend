import { useEffect, useState } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || '/api';

const TRANSLATIONS = {
  en: {
    tagline: 'Premium vehicles for your needs',
    subtitle: 'Choose a vehicle and fill in your details to request a rental.',
    available: 'Available Vehicles',
    perWeek: '/wk',
    rent: 'Rent This Car',
    noVehicles: 'No vehicles available at the moment.',
    loading: 'Loading vehicles...',
    error: 'Error loading vehicles.',
    modalTitle: 'Rental Request',
    name: 'Full Name',
    namePlaceholder: 'Your full name',
    email: 'Email',
    emailPlaceholder: 'your@email.com',
    phone: 'Phone',
    phonePlaceholder: '(555) 000-0000',
    dl: "Driver's License Number",
    dlPlaceholder: 'DL123456789',
    dlPhone: 'DL Phone',
    dlPhonePlaceholder: 'Phone on file with DL',
    hasWhatsapp: 'Does your phone have WhatsApp?',
    whatsappNumber: 'WhatsApp Number',
    submit: 'Send Request',
    submitting: 'Sending...',
    successTitle: 'Request Sent!',
    successMsg: 'We received your request for the',
    successSub: 'We will contact you shortly.',
    close: 'Close',
    required: '* Required',
    optional: '(optional)',
    rights: 'All rights reserved.',
  },
  es: {
    tagline: 'Vehículos premium para tus necesidades',
    subtitle: 'Elige un vehículo y completa tus datos para solicitar el alquiler.',
    available: 'Vehículos Disponibles',
    perWeek: '/sem',
    rent: 'Quiero Este Auto',
    noVehicles: 'No hay vehículos disponibles en este momento.',
    loading: 'Cargando vehículos...',
    error: 'Error al cargar vehículos.',
    modalTitle: 'Solicitud de Alquiler',
    name: 'Nombre Completo',
    namePlaceholder: 'Tu nombre completo',
    email: 'Correo Electrónico',
    emailPlaceholder: 'tu@correo.com',
    phone: 'Teléfono',
    phonePlaceholder: '(555) 000-0000',
    dl: 'Número de Licencia',
    dlPlaceholder: 'DL123456789',
    dlPhone: 'Teléfono de la Licencia',
    dlPhonePlaceholder: 'Teléfono registrado en la licencia',
    hasWhatsapp: '¿Tu teléfono tiene WhatsApp?',
    whatsappNumber: 'Número de WhatsApp',
    submit: 'Enviar Solicitud',
    submitting: 'Enviando...',
    successTitle: '¡Solicitud Enviada!',
    successMsg: 'Recibimos tu solicitud para el',
    successSub: 'Nos pondremos en contacto pronto.',
    close: 'Cerrar',
    required: '* Obligatorio',
    optional: '(opcional)',
    rights: 'Todos los derechos reservados.',
  },
  pt: {
    tagline: 'Veículos premium para suas necessidades',
    subtitle: 'Escolha um veículo e preencha seus dados para solicitar o aluguel.',
    available: 'Veículos Disponíveis',
    perWeek: '/sem',
    rent: 'Quero Alugar',
    noVehicles: 'Nenhum veículo disponível no momento.',
    loading: 'Carregando veículos...',
    error: 'Erro ao carregar veículos.',
    modalTitle: 'Solicitação de Aluguel',
    name: 'Nome Completo',
    namePlaceholder: 'Seu nome completo',
    email: 'Email',
    emailPlaceholder: 'seu@email.com',
    phone: 'Telefone',
    phonePlaceholder: '(555) 000-0000',
    dl: 'Número da Driver License',
    dlPlaceholder: 'DL123456789',
    dlPhone: 'Telefone da DL',
    dlPhonePlaceholder: 'Telefone registrado na DL',
    hasWhatsapp: 'Seu telefone tem WhatsApp?',
    whatsappNumber: 'Número do WhatsApp',
    submit: 'Enviar Solicitação',
    submitting: 'Enviando...',
    successTitle: 'Solicitação Enviada!',
    successMsg: 'Recebemos seu pedido para o',
    successSub: 'Entraremos em contato em breve.',
    close: 'Fechar',
    required: '* Obrigatório',
    optional: '(opcional)',
    rights: 'Todos os direitos reservados.',
  },
};

const Logo = () => (
  <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
    <circle cx="20" cy="20" r="4" stroke="#4db8d4" strokeWidth="1.4" fill="none"/>
    <circle cx="20" cy="8" r="2.5" stroke="#4db8d4" strokeWidth="1.2" fill="none"/>
    <circle cx="20" cy="32" r="2.5" stroke="#4db8d4" strokeWidth="1.2" fill="none"/>
    <circle cx="9" cy="14" r="2.5" stroke="#4db8d4" strokeWidth="1.2" fill="none"/>
    <circle cx="31" cy="14" r="2.5" stroke="#4db8d4" strokeWidth="1.2" fill="none"/>
    <circle cx="9" cy="26" r="2.5" stroke="#4db8d4" strokeWidth="1.2" fill="none"/>
    <circle cx="31" cy="26" r="2.5" stroke="#4db8d4" strokeWidth="1.2" fill="none"/>
    <line x1="20" y1="16" x2="20" y2="10.5" stroke="#4db8d4" strokeWidth="1" opacity="0.6"/>
    <line x1="20" y1="24" x2="20" y2="29.5" stroke="#4db8d4" strokeWidth="1" opacity="0.6"/>
    <line x1="16.5" y1="18" x2="11" y2="15.5" stroke="#4db8d4" strokeWidth="1" opacity="0.6"/>
    <line x1="23.5" y1="18" x2="29" y2="15.5" stroke="#4db8d4" strokeWidth="1" opacity="0.6"/>
    <line x1="16.5" y1="22" x2="11" y2="24.5" stroke="#4db8d4" strokeWidth="1" opacity="0.6"/>
    <line x1="23.5" y1="22" x2="29" y2="24.5" stroke="#4db8d4" strokeWidth="1" opacity="0.6"/>
  </svg>
);

export default function Catalog() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [lang, setLang] = useState('en');
  const t = TRANSLATIONS[lang];

  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', licenseNumber: '',
    dlPhone: '', hasWhatsapp: false, whatsappNumber: '',
  });

  useEffect(() => {
    axios.get(`${API}/public/vehicles`)
      .then(r => setVehicles(r.data))
      .catch(() => setError(t.error))
      .finally(() => setLoading(false));
  }, []);

  function openModal(vehicle) {
    setSelected(vehicle);
    setSubmitted(false);
    setError('');
    setForm({ fullName: '', email: '', phone: '', licenseNumber: '', dlPhone: '', hasWhatsapp: false, whatsappNumber: '' });
  }

  function closeModal() { setSelected(null); }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await axios.post(`${API}/leads`, { ...form, vehicleId: selected.id });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Error submitting request.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* HEADER */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <div>
              <span className="font-semibold text-white">Car<span className="text-cyan-400">Rental</span>Ops</span>
              <p className="text-gray-500 text-xs">{t.tagline}</p>
            </div>
          </div>

          {/* Language switcher */}
          <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
            {['en', 'es', 'pt'].map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  lang === l
                    ? 'bg-cyan-500 text-gray-950'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {l === 'en' ? '🇺🇸 EN' : l === 'es' ? '🇪🇸 ES' : '🇧🇷 PT'}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* HERO */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 border-b border-gray-800 px-6 py-12 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">{t.available}</h1>
        <p className="text-gray-400 max-w-lg mx-auto">{t.subtitle}</p>
      </div>

      {/* GRID */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">
        {loading && <p className="text-gray-400 text-center py-20">{t.loading}</p>}
        {!loading && vehicles.length === 0 && <p className="text-gray-500 text-center py-20">{t.noVehicles}</p>}
        {error && <p className="text-red-400 text-center py-20">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map(v => (
            <div key={v.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5 transition-all group">
              <div className="h-52 bg-gray-800 overflow-hidden">
                {v.photoUrl ? (
                  <img
                    src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}${v.photoUrl}`}
                    alt={`${v.brand} ${v.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-600 text-sm">No photo</span>
                  </div>
                )}
              </div>
              <div className="p-5">
                <h2 className="text-lg font-semibold text-white">{v.brand} {v.model}</h2>
                <p className="text-gray-400 text-sm mb-1">{v.year} · {v.color}</p>
                {v.notes && <p className="text-gray-500 text-xs mt-2 line-clamp-2">{v.notes}</p>}
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-cyan-400 font-bold text-xl">${v.weeklyRate.toFixed(2)}</span>
                    <span className="text-gray-500 text-sm">{t.perWeek}</span>
                  </div>
                  <button
                    onClick={() => openModal(v)}
                    className="bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-semibold text-sm px-4 py-2 rounded-xl transition-colors"
                  >
                    {t.rent}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-gray-800 bg-gray-900 px-6 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="text-sm text-gray-500">Car<span className="text-cyan-400">Rental</span>Ops</span>
          </div>
          <p className="text-gray-600 text-xs">© {new Date().getFullYear()} CarRentalOps. {t.rights}</p>
        </div>
      </footer>

      {/* MODAL */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4 backdrop-blur-sm"
          onClick={e => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <Logo />
                <span className="font-medium text-sm">Car<span className="text-cyan-400">Rental</span>Ops</span>
              </div>
              <button onClick={closeModal} className="text-gray-500 hover:text-white text-2xl leading-none">×</button>
            </div>

            <div className="p-6">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">✓</span>
                  </div>
                  <h2 className="text-xl font-bold mb-2">{t.successTitle}</h2>
                  <p className="text-gray-400 mb-1">{t.successMsg} <strong>{selected.brand} {selected.model}</strong>.</p>
                  <p className="text-gray-500 text-sm">{t.successSub}</p>
                  <button onClick={closeModal} className="mt-6 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-semibold px-6 py-2 rounded-xl">
                    {t.close}
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h2 className="text-lg font-bold">{t.modalTitle}</h2>
                    <p className="text-gray-400 text-sm">{selected.brand} {selected.model} {selected.year} · <span className="text-cyan-400">${selected.weeklyRate.toFixed(2)}{t.perWeek}</span></p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">{t.name} <span className="text-red-400">*</span></label>
                      <input required value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                        placeholder={t.namePlaceholder} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">{t.email} <span className="text-red-400">*</span></label>
                      <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                        placeholder={t.emailPlaceholder} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">{t.phone} <span className="text-red-400">*</span></label>
                      <input required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                        placeholder={t.phonePlaceholder} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">{t.dl} <span className="text-red-400">*</span></label>
                      <input required value={form.licenseNumber} onChange={e => setForm(f => ({ ...f, licenseNumber: e.target.value }))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                        placeholder={t.dlPlaceholder} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">{t.dlPhone} <span className="text-gray-600">{t.optional}</span></label>
                      <input value={form.dlPhone} onChange={e => setForm(f => ({ ...f, dlPhone: e.target.value }))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                        placeholder={t.dlPhonePlaceholder} />
                    </div>
                    <div className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={form.hasWhatsapp}
                          onChange={e => setForm(f => ({ ...f, hasWhatsapp: e.target.checked, whatsappNumber: '' }))}
                          className="w-4 h-4 accent-cyan-500" />
                        <span className="text-sm text-gray-300">{t.hasWhatsapp}</span>
                      </label>
                      {form.hasWhatsapp && (
                        <div className="mt-3">
                          <label className="block text-xs text-gray-400 mb-1">{t.whatsappNumber}</label>
                          <input value={form.whatsappNumber} onChange={e => setForm(f => ({ ...f, whatsappNumber: e.target.value }))}
                            className="w-full bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                            placeholder={t.phonePlaceholder} />
                        </div>
                      )}
                    </div>
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <button type="submit" disabled={submitting}
                      className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-900 disabled:cursor-not-allowed text-gray-950 font-bold py-3 rounded-xl transition-colors">
                      {submitting ? t.submitting : t.submit}
                    </button>
                    <p className="text-gray-600 text-xs text-center">{t.required}</p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}