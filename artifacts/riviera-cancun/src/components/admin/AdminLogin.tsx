import { useState, FormEvent } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { ShipWheelIcon } from '@/components/Logo';
import { useLocation } from 'wouter';

export function AdminLogin() {
  const { login } = useAdmin();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const [, navigate] = useLocation();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);

    const ok = await login(password);
    setLoading(false);

    if (!ok) {
      setError(true);
      setShake(true);
      setPassword('');
      setTimeout(() => setShake(false), 500);
    }
  }

  return (
    <div className="min-h-screen bg-brand-navy flex items-center justify-center px-4">
      <div
        className={`w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md shadow-2xl transition-transform ${shake ? 'animate-[shake_0.4s_ease]' : ''}`}
      >
        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-8px); }
            40%, 80% { transform: translateX(8px); }
          }
        `}</style>

        <div className="flex flex-col items-center mb-8">
          <ShipWheelIcon size={48} color="#C9A84C" />
          <h1 className="text-2xl font-display font-bold text-white mt-4 tracking-wide">AUSTRAL</h1>
          <p className="text-xs text-brand-gold uppercase tracking-widest mt-1">Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-white/50 uppercase tracking-wider mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              placeholder="••••••••"
              autoComplete="current-password"
              autoFocus
              disabled={loading}
              className="w-full bg-black/20 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-brand-gold transition-colors disabled:opacity-50"
            />
            {error && (
              <p className="text-brand-coral text-xs mt-2">Contraseña incorrecta.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-gold text-brand-navy font-bold rounded-xl hover:bg-white transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Verificando…' : 'Ingresar'}
          </button>
        </form>

        <button
          onClick={() => navigate('/')}
          className="w-full mt-4 text-xs text-white/30 hover:text-white/60 transition-colors text-center py-2"
        >
          ← Volver al sitio
        </button>
      </div>
    </div>
  );
}
