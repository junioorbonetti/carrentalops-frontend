import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { Wifi, WifiOff, Zap, ZapOff, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

// Usa Leaflet via CDN (sem dependência extra)
const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS  = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

function loadLeaflet() {
  return new Promise((resolve) => {
    if (window.L) return resolve(window.L);

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = LEAFLET_CSS;
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = LEAFLET_JS;
    script.onload = () => resolve(window.L);
    document.head.appendChild(script);
  });
}

export default function FleetMap() {
  const [fleet, setFleet] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markersRef = useRef({});

  useEffect(() => {
    init();
    const interval = setInterval(fetchFleet, 30000);
    return () => clearInterval(interval);
  }, []);

  async function init() {
    await loadLeaflet();
    initMap();
    await fetchFleet();
    setLoading(false);
  }

  function initMap() {
    if (leafletMap.current || !mapRef.current) return;

    const L = window.L;
    const map = L.map(mapRef.current, {
      center: [37.5485, -121.9886], // Fremont, CA
      zoom: 11,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap © CARTO',
      maxZoom: 19,
    }).addTo(map);

    leafletMap.current = map;
  }

  async function fetchFleet() {
    try {
      const { data } = await api.get('/tracking/fleet');
      setFleet(data);
      setLastUpdate(new Date());
      updateMarkers(data);
    } catch {
      toast.error('Erro ao carregar frota');
    }
  }

  function updateMarkers(fleetData) {
    const L = window.L;
    if (!L || !leafletMap.current) return;

    // Remove marcadores antigos
    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};

    fleetData.forEach(item => {
      if (!item.lastLocation) return;

      const { lat, lng } = item.lastLocation;
      const online = item.online;
      const color = online ? '#4ade80' : '#9ca3af';

      const icon = L.divIcon({
        className: '',
        html: `
          <div style="
            width: 36px; height: 36px;
            background: ${online ? 'rgba(74,222,128,0.15)' : 'rgba(156,163,175,0.1)'};
            border: 2px solid ${color};
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 14px;
            box-shadow: 0 0 ${online ? '8px' : '0px'} ${color}60;
          ">🚗</div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([lat, lng], { icon })
        .addTo(leafletMap.current)
        .bindPopup(`
          <div style="font-family: system-ui; min-width: 160px;">
            <div style="font-weight: 600; font-size: 13px; margin-bottom: 4px;">
              ${item.vehicle?.plate || 'N/A'}
            </div>
            <div style="font-size: 12px; color: #9ca3af; margin-bottom: 6px;">
              ${item.vehicle?.brand} ${item.vehicle?.model}
            </div>
            <div style="font-size: 11px; color: ${color}; margin-bottom: 4px;">
              ● ${online ? 'Online' : 'Offline'}
            </div>
            ${item.lastLocation.speed != null ? `
              <div style="font-size: 11px; color: #9ca3af;">
                Velocidade: ${item.lastLocation.speed} km/h
              </div>
            ` : ''}
            ${item.lastLocation.ignition != null ? `
              <div style="font-size: 11px; color: #9ca3af;">
                Ignição: ${item.lastLocation.ignition ? 'Ligada' : 'Desligada'}
              </div>
            ` : ''}
          </div>
        `);

      marker.on('click', () => setSelected(item));
      markersRef.current[item.trackerId] = marker;
    });
  }

  async function handleRelay(trackerId, vehicleId, action) {
    try {
      await api.post(`/tracking/vehicles/${vehicleId}/relay`, { action });
      toast.success(action === 'cut' ? '🔴 Motor cortado!' : '🟢 Motor liberado!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Dispositivo offline');
    }
  }

  function centerOnVehicle(item) {
    if (!item.lastLocation || !leafletMap.current) return;
    leafletMap.current.setView([item.lastLocation.lat, item.lastLocation.lng], 15);
    markersRef.current[item.trackerId]?.openPopup();
    setSelected(item);
  }

  const onlineCount  = fleet.filter(f => f.online).length;
  const offlineCount = fleet.length - onlineCount;

  return (
    <div className="flex flex-col h-full -m-4 md:-m-6" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-white/10 bg-black/20 flex-shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-sm font-semibold">Fleet Map</h1>
          <div className="flex items-center gap-3 text-xs text-white/40">
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-full" />{onlineCount} online</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-white/20 rounded-full" />{offlineCount} offline</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdate && (
            <span className="text-xs text-white/30">
              Atualizado {lastUpdate.toLocaleTimeString('pt-BR')}
            </span>
          )}
          <button
            onClick={fetchFleet}
            className="p-1.5 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-white/50"
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0 border-r border-white/10 overflow-y-auto bg-black/10">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-5 h-5 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : fleet.length === 0 ? (
            <div className="p-4 text-xs text-white/30 text-center mt-8">
              Nenhum veículo com tracker vinculado
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {fleet.map(item => (
                <button
                  key={item.trackerId}
                  onClick={() => centerOnVehicle(item)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selected?.trackerId === item.trackerId
                      ? 'bg-primary-400/15 border border-primary-400/30'
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{item.vehicle?.plate}</span>
                    {item.online
                      ? <Wifi size={12} className="text-green-400" />
                      : <WifiOff size={12} className="text-white/20" />
                    }
                  </div>
                  <div className="text-xs text-white/40">
                    {item.vehicle?.brand} {item.vehicle?.model}
                  </div>
                  {item.lastLocation ? (
                    <div className="text-xs text-white/30 mt-1">
                      {item.lastLocation.speed != null && `${item.lastLocation.speed} km/h · `}
                      {item.lastLocation.ignition ? '🔑 Ligado' : '⭕ Desligado'}
                    </div>
                  ) : (
                    <div className="text-xs text-white/20 mt-1">Sem posição</div>
                  )}

                  {/* Relay buttons */}
                  {item.online && (
                    <div className="flex gap-1.5 mt-2">
                      <button
                        onClick={e => { e.stopPropagation(); handleRelay(item.trackerId, item.vehicle.id, 'cut'); }}
                        className="flex-1 flex items-center justify-center gap-1 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30 transition-colors"
                      >
                        <ZapOff size={10} /> Cortar
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); handleRelay(item.trackerId, item.vehicle.id, 'release'); }}
                        className="flex-1 flex items-center justify-center gap-1 py-1 bg-green-500/20 text-green-400 rounded text-xs hover:bg-green-500/30 transition-colors"
                      >
                        <Zap size={10} /> Liberar
                      </button>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <div ref={mapRef} className="w-full h-full" />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
