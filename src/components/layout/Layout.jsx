import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Car, Users, FileText, CreditCard,
  Wrench, BarChart2, LogOut, Menu, X
} from 'lucide-react';
import { useState } from 'react';

const nav = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/vehicles', icon: Car, label: 'Vehicles' },
  { to: '/customers', icon: Users, label: 'Customers' },
  { to: '/rentals', icon: FileText, label: 'Rentals' },
  { to: '/payments', icon: CreditCard, label: 'Payments' },
  { to: '/maintenance', icon: Wrench, label: 'Maintenance' },
  { to: '/reports', icon: BarChart2, label: 'Reports' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
        <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
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
        <span className="font-medium text-sm">Car<span className="text-primary-400">Rental</span>Ops</span>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-primary-400/15 text-primary-400 font-medium'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-white/10">
        <div className="flex items-center justify-between px-3 py-2">
          <div>
            <p className="text-xs font-medium text-white/70">{user?.name}</p>
            <p className="text-xs text-white/30">{user?.email}</p>
          </div>
          <button onClick={handleLogout} className="text-white/30 hover:text-red-400 transition-colors">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 bg-black/20 border-r border-white/10 flex-col flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile sidebar */}
      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="w-56 bg-[#0d1b2a] border-r border-white/10 flex flex-col">
            <Sidebar />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setOpen(false)} />
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center px-4 py-3 border-b border-white/10 bg-black/20">
          <button onClick={() => setOpen(true)} className="text-white/50 mr-3">
            <Menu size={20} />
          </button>
          <span className="font-medium text-sm">Car<span className="text-primary-400">Rental</span>Ops</span>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
