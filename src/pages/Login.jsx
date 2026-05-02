import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Fill in all fields');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d1b2a]">
      <div className="w-full max-w-sm px-8 py-10">
        <div className="flex items-center justify-center gap-2.5 mb-8">
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
          <span className="font-medium text-base">Car<span className="text-primary-400">Rental</span>Ops</span>
        </div>

        <p className="text-center text-white/35 text-sm italic mb-8">Your fleet, fully under control.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
