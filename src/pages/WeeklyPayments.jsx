import { useEffect, useState } from 'react';
import { CheckCircle, Clock, Phone } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const DAY_LABELS = {
  monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
  thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday'
};

export default function WeeklyPayments() {
  const [schedule, setSchedule] = useState([]);
  const [today, setToday] = useState('');
  const [marking, setMarking] = useState(null);
  const [methodMap, setMethodMap] = useState({});

  const load = () => {
    api.get('/weekly-payments').then(r => {
      setSchedule(r.data.schedule);
      setToday(r.data.today);
    });
  };

  useEffect(() => { load(); }, []);

  const markPaid = async (rental) => {
    setMarking(rental.id);
    try {
      await api.post('/weekly-payments/mark-paid', {
        rentalId: rental.id,
        customerId: rental.customerId,
        vehicleId: rental.vehicleId,
        amount: rental.weeklyRate,
        method: methodMap[rental.id] || 'cash',
      });
      toast.success(`Payment marked for ${rental.customerName}`);
      load();
    } catch {
      toast.error('Error marking payment');
    } finally { setMarking(null); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Weekly Payments</h1>
        <span className="text-xs text-white/40 bg-white/5 px-3 py-1 rounded-full capitalize">Today: {DAY_LABELS[today]}</span>
      </div>

      {schedule.length === 0 && (
        <div className="card text-center py-10">
          <p className="text-sm text-white/30">No active rentals with payment days set.</p>
          <p className="text-xs text-white/20 mt-1">Set a payment day when creating or editing a rental.</p>
        </div>
      )}

      {schedule.map(({ day, rentals, isToday }) => (
        <div key={day} className={`card ${isToday ? 'border-primary-400/30 bg-primary-400/5' : ''}`}>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-medium">{DAY_LABELS[day]}</h2>
            {isToday && <span className="text-xs bg-primary-400/20 text-primary-400 px-2 py-0.5 rounded-full">Today</span>}
            <span className="text-xs text-white/30 ml-auto">{rentals.length} rental{rentals.length > 1 ? 's' : ''}</span>
          </div>

          <div className="space-y-3">
            {rentals.map(r => (
              <div key={r.id} className={`flex items-center justify-between gap-3 p-3 rounded-lg ${r.paidThisWeek ? 'bg-emerald-500/5 border border-emerald-500/15' : 'bg-white/5'}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{r.customerName}</p>
                    {r.paidThisWeek && <CheckCircle size={14} className="text-emerald-400" />}
                    {!r.paidThisWeek && isToday && <Clock size={14} className="text-yellow-400" />}
                  </div>
                  <p className="text-xs text-white/40">{r.vehicle}</p>
                  {r.customerPhone && (
                    <a href={`tel:${r.customerPhone}`} className="flex items-center gap-1 text-xs text-white/30 hover:text-primary-400 transition-colors mt-0.5">
                      <Phone size={10} /> {r.customerPhone}
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">${r.weeklyRate.toFixed(2)}</span>
                  {!r.paidThisWeek ? (
                    <div className="flex items-center gap-1.5">
                      <select
                        className="input text-xs py-1 px-2 w-24"
                        value={methodMap[r.id] || 'cash'}
                        onChange={e => setMethodMap(m => ({ ...m, [r.id]: e.target.value }))}
                      >
                        {['cash', 'zelle', 'card', 'transfer', 'other'].map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => markPaid(r)}
                        disabled={marking === r.id}
                        className="btn-primary text-xs py-1.5 px-3 whitespace-nowrap"
                      >
                        {marking === r.id ? '...' : 'Mark Paid'}
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">Paid ✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
