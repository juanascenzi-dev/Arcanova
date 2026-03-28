import { useTranslation } from '@/contexts/i18n';
import { Instagram, Facebook, Mail } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { CONTACT_CHANNELS, whatsappUrl } from '@/lib/contact';

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
            <ul className="space-y-3 text-sm">
              {/* Email — real mailto link, works in any real browser */}
              <li>
                <a
                  href={`mailto:${CONTACT_CHANNELS.email}`}
                  className="flex items-center gap-2 text-white/60 hover:text-brand-gold transition-colors group"
                >
                  <Mail className="w-4 h-4 text-brand-gold shrink-0" />
                  <span className="break-all">{CONTACT_CHANNELS.email}</span>
                </a>
              </li>
              {/* WhatsApp */}
              <li>
                <a
                  href={whatsappUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white/60 hover:text-brand-gold transition-colors"
                >
                  <svg className="w-4 h-4 text-brand-gold shrink-0" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
                  </svg>
                  <span>WhatsApp</span>
                </a>
              </li>
              {/* Messenger */}
              <li>
                <a
                  href={CONTACT_CHANNELS.messengerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white/60 hover:text-brand-gold transition-colors"
                >
                  <svg className="w-4 h-4 text-brand-gold shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.683V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.627 0 12-4.975 12-11.111S18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z"/>
                  </svg>
                  <span>Messenger</span>
                </a>
              </li>
              {/* Location */}
              <li className="flex items-start gap-2 text-white/40 text-xs mt-2">
                <svg className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0z"/>
                </svg>
                <span>Zona Hotelera, Cancún, Q.R. · México</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-white font-bold mb-4">{t.footer.social}</h4>
            <div className="flex gap-3 flex-wrap">
              {/* Messenger */}
              <a
                href={CONTACT_CHANNELS.messengerUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Messenger"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-brand-gold hover:text-brand-navy transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.683V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.627 0 12-4.975 12-11.111S18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z"/>
                </svg>
              </a>
              {/* Facebook */}
              <a
                href={CONTACT_CHANNELS.facebookPageUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Facebook"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-brand-gold hover:text-brand-navy transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              {/* WhatsApp */}
              <a
                href={whatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                title="WhatsApp"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-brand-gold hover:text-brand-navy transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
                </svg>
              </a>
              {/* Instagram — show only if configured */}
              {CONTACT_CHANNELS.instagramUrl && (
                <a
                  href={CONTACT_CHANNELS.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Instagram"
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-brand-gold hover:text-brand-navy transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
            </div>

            {/* Email shortcut in social column */}
            <div className="mt-6">
              <a
                href={`mailto:${CONTACT_CHANNELS.email}`}
                className="flex items-center gap-2 text-white/50 hover:text-brand-gold transition-colors text-sm"
              >
                <Mail className="w-4 h-4 text-brand-gold shrink-0" />
                <span className="break-all text-xs">{CONTACT_CHANNELS.email}</span>
              </a>
            </div>
          </div>

        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-xs text-center md:text-left">
            © {new Date().getFullYear()} {t.footer.rights}
          </p>
          <div className="flex gap-4 text-white/40 text-xs">
            <a
              href={`mailto:${CONTACT_CHANNELS.email}`}
              className="hover:text-brand-gold transition-colors"
            >
              {CONTACT_CHANNELS.email}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
