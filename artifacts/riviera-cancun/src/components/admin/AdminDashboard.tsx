import { useState } from 'react';
import { Home as HomeIcon, MessageSquare, LogOut } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import Home from '@/pages/Home';
import { LeadsPanel } from '@/components/admin/LeadsPanel';

export function AdminDashboard() {
  const [section, setSection] = useState<'experiences' | 'leads'>('experiences');
  const { logout } = useAdmin();

  return (
    <div className="min-h-screen bg-brand-light">
      {/* Gold admin bar */}
      <div className="bg-brand-gold text-brand-navy px-6 py-4 shadow-lg flex items-center justify-between sticky top-0 z-40">
        <h1 className="text-xl font-bold font-display">AUSTRAL Cancún Premium — Admin</h1>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-navy text-white hover:bg-brand-navy/90 transition-colors font-bold text-sm"
        >
          <LogOut className="w-4 h-4" />
          Salir
        </button>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-2 mb-8 border-b border-brand-navy/10">
          <button
            onClick={() => setSection('experiences')}
            className={`flex items-center gap-2 px-4 py-3 font-bold text-sm transition-all border-b-2 ${
              section === 'experiences'
                ? 'text-brand-navy border-b-brand-gold'
                : 'text-brand-navy/50 border-b-transparent hover:text-brand-navy'
            }`}
          >
            <HomeIcon className="w-4 h-4" />
            Experiences
          </button>
          <button
            onClick={() => setSection('leads')}
            className={`flex items-center gap-2 px-4 py-3 font-bold text-sm transition-all border-b-2 ${
              section === 'leads'
                ? 'text-brand-navy border-b-brand-gold'
                : 'text-brand-navy/50 border-b-transparent hover:text-brand-navy'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Leads
          </button>
        </div>

        {/* Section content */}
        {section === 'experiences' && <Home />}
        {section === 'leads' && <LeadsPanel />}
      </div>
    </div>
  );
}
