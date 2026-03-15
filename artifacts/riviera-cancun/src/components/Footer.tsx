import { useTranslation } from '@/contexts/i18n';
import { Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react';
import { Logo } from '@/components/Logo';

export function Footer() {
  const { t } = useTranslation();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-brand-navy border-t border-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <Logo size={38} color="#C9A84C" />
              <div className="flex flex-col">
                <span className="font-display font-bold text-xl leading-none tracking-[0.15em] text-white">AUSTRAL</span>
                <span className="text-[10px] uppercase tracking-widest text-brand-gold">Cancún Premium</span>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-4">
              {t.footer.tagline}
            </p>
            <p className="text-white/30 text-xs">{t.footer.passion}</p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-bold mb-4">{t.footer.experiences}</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><button onClick={() => scrollTo('experiencias')} className="hover:text-brand-gold transition-colors">{t.experiences.filters.adventure}</button></li>
              <li><button onClick={() => scrollTo('experiencias')} className="hover:text-brand-gold transition-colors">{t.experiences.filters.relax}</button></li>
              <li><button onClick={() => scrollTo('experiencias')} className="hover:text-brand-gold transition-colors">{t.experiences.filters.cultural}</button></li>
              <li><button onClick={() => scrollTo('plan-b')} className="hover:text-brand-gold transition-colors">{t.experiences.tags.planB}</button></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-4">{t.footer.contact}</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-gold" />
                info@australcancun.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-gold" />
                +52 998 123 4567
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-gold" />
                Zona Hotelera, Cancún, Q.R.
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-white font-bold mb-4">{t.footer.social}</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-brand-gold hover:text-brand-navy transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-brand-gold hover:text-brand-navy transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-xs text-center md:text-left">
            © {new Date().getFullYear()} {t.footer.rights}
          </p>
          <div className="flex gap-4 text-white/40 text-xs">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
