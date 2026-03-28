import { useAdmin } from '@/contexts/AdminContext';
import { useLocation } from 'wouter';
import { LogOut, Eye } from 'lucide-react';

export function AdminTopBar() {
  const { logout } = useAdmin();
  const [, navigate] = useLocation();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] h-10 bg-brand-gold flex items-center justify-between px-4 shadow-md">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-brand-navy animate-pulse" />
        <span className="text-brand-navy text-xs font-black uppercase tracking-widest">
          Modo Admin
        </span>
        <span className="text-brand-navy/50 text-xs">· Los cambios se guardan en este navegador</span>
      </div>
      <div className="flex items-center gap-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-brand-navy/70 hover:text-brand-navy transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          Ver sitio público
        </a>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs font-bold text-brand-navy bg-white/30 hover:bg-white/50 px-3 py-1 rounded-full transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Salir
        </button>
      </div>
    </div>
  );
}
