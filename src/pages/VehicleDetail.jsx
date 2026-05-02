import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';

export default function VehicleDetail() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);

  useEffect(() => { api.get(`/vehicles/${id}`).then(r => setVehicle(r.data)); }, [id]);
  if (!vehicle) return <div className="text-white/40 text-sm">Loading...</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/vehicles" className="text-white/40 hover:text-white/70"><ArrowLeft size={16} /></Link>
        <h1 className="text-lg font-semibold">{vehicle.brand} {vehicle.model} {vehicle.year}</h1>
        <span className={`badge-${vehicle.status}`}>{vehicle.status}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card space-y-2">
          <h2 className="text-sm font-medium mb-3">Details</h2>
          {[['Plate', vehicle.plate], ['VIN', vehicle.vin || '—'], ['Color', vehicle.color], ['Mileage', `${vehicle.mileage.toLocaleString()} mi`], ['Weekly Rate', `$${vehicle.weeklyRate}`]].map(([l, v]) => (
            <div key={l} className="flex justify-between text-sm">
              <span className="text-white/40">{l}</span>
              <span>{v}</span>
            </div>
          ))}
          {vehicle.notes && <p className="text-xs text-white/30 mt-2">{vehicle.notes}</p>}
        </div>

        <div className="card">
          <h2 className="text-sm font-medium mb-3">Recent Rentals</h2>
          {vehicle.rentals.slice(0, 5).map(r => (
            <div key={r.id} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
              <div>
                <Link to={`/rentals/${r.id}`} className="text-sm hover:text-primary-400">{r.customer.fullName}</Link>
                <p className="text-xs text-white/30">{format(new Date(r.startDate), 'MMM d, yyyy')}</p>
              </div>
              <span className={`badge-${r.status}`}>{r.status}</span>
            </div>
          ))}
          {vehicle.rentals.length === 0 && <p className="text-xs text-white/30">No rentals yet</p>}
        </div>
      </div>

      <div className="card">
        <h2 className="text-sm font-medium mb-3">Maintenance History</h2>
        {vehicle.maintenances.map(m => (
          <div key={m.id} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
            <div>
              <p className="text-sm">{m.type} {m.shop ? `· ${m.shop}` : ''}</p>
              <p className="text-xs text-white/30">{format(new Date(m.date), 'MMM d, yyyy')} · ${m.cost}</p>
            </div>
            <span className={`badge-${m.status}`}>{m.status}</span>
          </div>
        ))}
        {vehicle.maintenances.length === 0 && <p className="text-xs text-white/30">No maintenance records</p>}
      </div>
    </div>
  );
}
