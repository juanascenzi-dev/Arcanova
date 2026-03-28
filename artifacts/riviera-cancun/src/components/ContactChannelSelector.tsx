import { useState } from 'react';
import { useTranslation } from '@/contexts/i18n';
import { saveLead, buildWhatsAppUrl, buildEmailUrl, buildFacebookMessage, CONTACT_CONFIG } from '@/lib/leads';
import { Check, Copy, ExternalLink } from 'lucide-react';

interface Props {
  experienceId: string;
  experienceName: string;
  onClose?: () => void;
}

export function ContactChannelSelector({ experienceId, experienceName, onClose }: Props) {
  const { t, lang } = useTranslation();
  const [date, setDate] = useState('');
  const [people, setPeople] = useState('');
  const [fbStep, setFbStep] = useState(false);
  const [copied, setCopied] = useState(false);

  const params = { experienceName, date: date || undefined, people: people || undefined, lang };

  function handleWhatsApp() {
    saveLead({ experienceId, experienceName, date: date || undefined, people: people || undefined, channel: 'whatsapp', lang });
    window.open(buildWhatsAppUrl(params), '_blank', 'noopener,noreferrer');
    onClose?.();
  }

  function handleEmail() {
    saveLead({ experienceId, experienceName, date: date || undefined, people: people || undefined, channel: 'email', lang });
    window.location.href = buildEmailUrl(params);
    onClose?.();
  }

  function handleFacebook() {
    saveLead({ experienceId, experienceName, date: date || undefined, people: people || undefined, channel: 'facebook', lang });
    setFbStep(true);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(buildFacebookMessage(params));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback: select the textarea
    }
  }

  const inq = t.inquiry;

  if (fbStep) {
    return (
      <div className="border-t border-brand-navy/10 pt-5 mt-2">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-navy/50 mb-3">{inq.facebookCopy}</p>
        <div className="relative mb-3">
          <textarea
            readOnly
            rows={4}
            value={buildFacebookMessage(params)}
            className="w-full text-sm bg-brand-light border border-brand-navy/15 rounded-xl p-3 pr-10 text-brand-navy resize-none focus:outline-none"
          />
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-white border border-brand-navy/10 hover:border-brand-gold transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-brand-navy/50" />}
          </button>
        </div>
        {copied && <p className="text-xs text-green-600 font-semibold mb-3">{inq.copied}</p>}
        <a
          href={CONTACT_CONFIG.facebookPage}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#1877F2] text-white font-bold text-sm hover:bg-[#1464d8] transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          {inq.goToFacebook}
          <ExternalLink className="w-3.5 h-3.5 opacity-70" />
        </a>
        <button
          onClick={() => setFbStep(false)}
          className="w-full mt-2 text-xs text-brand-navy/40 hover:text-brand-navy transition-colors py-1"
        >
          ← {inq.back}
        </button>
      </div>
    );
  }

  return (
    <div className="border-t border-brand-navy/10 pt-5 mt-2">
      <p className="text-sm font-bold text-brand-navy mb-1">{inq.title}</p>
      <p className="text-xs text-brand-navy/50 mb-4">{inq.subtitle}</p>

      {/* Optional quick inputs */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div>
          <label className="block text-xs text-brand-navy/50 mb-1">{inq.dateLabel}</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full text-sm bg-brand-light border border-brand-navy/15 rounded-lg px-3 py-2 text-brand-navy focus:outline-none focus:border-brand-gold [color-scheme:light]"
          />
        </div>
        <div>
          <label className="block text-xs text-brand-navy/50 mb-1">{inq.peopleLabel}</label>
          <select
            value={people}
            onChange={(e) => setPeople(e.target.value)}
            className="w-full text-sm bg-brand-light border border-brand-navy/15 rounded-lg px-3 py-2 text-brand-navy focus:outline-none focus:border-brand-gold"
          >
            <option value="">—</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3-5">3-5</option>
            <option value="6-10">6-10</option>
            <option value="10+">10+</option>
          </select>
        </div>
      </div>

      {/* Channel buttons */}
      <div className="flex flex-col gap-2">
        <button
          onClick={handleWhatsApp}
          className="flex items-center justify-center gap-2.5 w-full py-3 rounded-xl bg-[#25D366] text-white font-bold text-sm hover:bg-[#1da851] transition-colors shadow-sm"
        >
          <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
            <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
          </svg>
          {inq.whatsapp}
        </button>

        <button
          onClick={handleEmail}
          className="flex items-center justify-center gap-2.5 w-full py-3 rounded-xl bg-brand-navy text-white font-bold text-sm hover:bg-brand-ocean transition-colors shadow-sm"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="16" x="2" y="4" rx="2"/>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
          </svg>
          {inq.email}
        </button>

        <button
          onClick={handleFacebook}
          className="flex items-center justify-center gap-2.5 w-full py-3 rounded-xl border-2 border-[#1877F2] text-[#1877F2] font-bold text-sm hover:bg-[#1877F2] hover:text-white transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          {inq.facebook}
        </button>
      </div>

      <p className="text-[11px] text-brand-navy/35 text-center mt-3 leading-relaxed">{inq.note}</p>
    </div>
  );
}
