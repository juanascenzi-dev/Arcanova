import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/contexts/i18n';
import { useQuoteCart } from '@/contexts/QuoteCartContext';
import { CONTACT_CHANNELS } from '@/lib/contact';
import {
  type QuoteItem,
  type OverridePricing,
  type TravelerBreakdown,
  type ServiceBookingRules,
  type ServicePricing,
  type ChargeMode,
  calculateSubtotal,
  formatPrice,
  formatDateDisplay,
  buildCartWhatsAppUrl,
  buildCartEmailUrl,
  buildCartEmailSubject,
  buildCartMessage,
  chargeModeLabel,
  buildTravelerLine,
} from '@/lib/quote';
import { useCreateLead } from '@workspace/api-client-react';
import {
  Plus, Minus, Trash2, Pencil, Check, Copy, ShoppingCart,
  ChevronDown, ChevronUp, AlertTriangle, Mail, ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  experienceId: string;
  experienceSlug: string;
  experienceName: string;
  bookingRules?: ServiceBookingRules | null;
  servicePricing?: ServicePricing | null;
  onClose?: () => void;
}

// ─── Step type ────────────────────────────────────────────────────────────────

type Step = 'form' | 'email' | 'messenger';

// ─── Stepper ──────────────────────────────────────────────────────────────────

function Stepper({
  value, onChange, min = 0, max, label,
}: {
  value: number; onChange: (n: number) => void;
  min?: number; max?: number; label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-navy/45">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-7 h-7 rounded-lg bg-brand-navy/8 hover:bg-brand-navy/15 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Minus className="w-3.5 h-3.5 text-brand-navy/60" />
        </button>
        <span className="w-6 text-center text-base font-bold text-brand-navy tabular-nums">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          disabled={max != null && value >= max}
          className="w-7 h-7 rounded-lg bg-brand-navy/8 hover:bg-brand-navy/15 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Plus className="w-3.5 h-3.5 text-brand-navy/60" />
        </button>
      </div>
      {max != null && (
        <span className="text-[9px] text-brand-navy/30 tabular-nums">max {max}</span>
      )}
    </div>
  );
}

// ─── Price input ──────────────────────────────────────────────────────────────

function PriceInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold uppercase tracking-wider text-brand-navy/40">{label}</label>
      <div className="flex items-center gap-1 border border-brand-navy/15 rounded-lg px-2 py-1.5 bg-white focus-within:border-brand-gold transition-colors">
        <span className="text-xs text-brand-navy/40 font-medium select-none">$</span>
        <input
          type="number"
          min={0}
          placeholder="0"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full text-sm text-brand-navy bg-transparent outline-none placeholder:text-brand-navy/20"
        />
      </div>
    </div>
  );
}

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {}
  }
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-navy/15 bg-white hover:border-brand-gold text-xs font-semibold text-brand-navy/60 hover:text-brand-navy transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copiado' : (label ?? 'Copiar')}
    </button>
  );
}

// ─── Email Step ───────────────────────────────────────────────────────────────
//
// Why a dedicated step instead of window.open(mailto:)?
// Browsers inside sandboxed iframes (Replit preview, some webviews) block mailto:
// protocol navigation for security reasons — this is EXPECTED behavior, not a bug.
// In real deployed browsers the mailto: <a> link below works perfectly.
// The step UI gives users a reliable fallback in every context.

function EmailStep({
  cart, lang, onBack,
}: {
  cart: ReturnType<typeof useQuoteCart>['cart'];
  lang: string;
  onBack: () => void;
}) {
  const l = lang as 'es' | 'en';
  const subject = buildCartEmailSubject(l);
  const body = buildCartMessage(cart, l);
  const mailtoHref = buildCartEmailUrl(cart, l);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-brand-navy/8 transition-colors">
          <ArrowLeft className="w-4 h-4 text-brand-navy/50" />
        </button>
        <p className="text-xs font-bold uppercase tracking-wider text-brand-navy/50">Email</p>
      </div>

      {/* Recipient */}
      <div className="rounded-xl border border-brand-navy/10 bg-white p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-navy/40">
              {l === 'es' ? 'Para' : 'To'}
            </p>
            <p className="text-sm font-semibold text-brand-navy">{CONTACT_CHANNELS.email}</p>
          </div>
          <CopyButton text={CONTACT_CHANNELS.email} label={l === 'es' ? 'Copiar email' : 'Copy email'} />
        </div>

        <div className="border-t border-brand-navy/8 pt-3 flex items-center justify-between gap-2">
          <div className="space-y-0.5 flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-navy/40">
              {l === 'es' ? 'Asunto' : 'Subject'}
            </p>
            <p className="text-xs text-brand-navy truncate">{subject}</p>
          </div>
          <CopyButton text={subject} label={l === 'es' ? 'Copiar asunto' : 'Copy subject'} />
        </div>
      </div>

      {/* Message */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-wider text-brand-navy/40">
            {l === 'es' ? 'Cuerpo del mensaje' : 'Message body'}
          </p>
          <CopyButton text={body} label={l === 'es' ? 'Copiar mensaje' : 'Copy message'} />
        </div>
        <textarea
          readOnly
          rows={8}
          value={body}
          className="w-full text-sm bg-white border border-brand-navy/15 rounded-xl p-3 text-brand-navy resize-none focus:outline-none font-mono leading-relaxed text-xs"
        />
      </div>

      {/* Primary CTA: real mailto link — works in any real browser */}
      <a
        href={mailtoHref}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-brand-navy text-white font-bold text-sm hover:bg-brand-ocean transition-colors"
      >
        <Mail className="w-4 h-4" />
        {l === 'es' ? 'Abrir cliente de correo' : 'Open email client'}
      </a>

      <p className="text-[11px] text-brand-navy/35 text-center leading-relaxed">
        {l === 'es'
          ? 'Si el boton no abre tu correo, copia el mensaje y envialo manualmente.'
          : "If the button doesn't open your email app, copy the message and send it manually."}
      </p>
    </div>
  );
}

// ─── Messenger Step ───────────────────────────────────────────────────────────
//
// Strategy:
//   1. Auto-copy message to clipboard immediately (always succeeds outside sandboxed iframes).
//   2. Open CONTACT_CHANNELS.messengerUrl in a new tab — works reliably on mobile
//      (opens Messenger app) and on desktop when the user is logged in to Facebook.
//   3. Show copyable message + fallback button to the Facebook page/profile in case
//      Messenger doesn't open (not logged in, security check, etc.).

function MessengerStep({
  cart, lang, onBack,
}: {
  cart: ReturnType<typeof useQuoteCart>['cart'];
  lang: string;
  onBack: () => void;
}) {
  const l = lang as 'es' | 'en';
  const msg = buildCartMessage(cart, l);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-brand-navy/8 transition-colors">
          <ArrowLeft className="w-4 h-4 text-brand-navy/50" />
        </button>
        <p className="text-xs font-bold uppercase tracking-wider text-brand-navy/50">Messenger</p>
      </div>

      {/* Auto-copied badge */}
      <div className="flex items-start gap-2.5 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
        <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
        <p className="text-xs font-semibold text-green-700 leading-relaxed">
          {l === 'es'
            ? 'Mensaje copiado automaticamente. Si Messenger no se abrio, pegalo en el chat cuando lo abras.'
            : 'Message copied automatically. If Messenger did not open, paste it into the chat when you get there.'}
        </p>
      </div>

      {/* Copyable message */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-wider text-brand-navy/40">
            {l === 'es' ? 'Mensaje listo para pegar' : 'Message ready to paste'}
          </p>
          <CopyButton text={msg} label={l === 'es' ? 'Copiar de nuevo' : 'Copy again'} />
        </div>
        <textarea
          readOnly
          rows={7}
          value={msg}
          className="w-full text-xs bg-white border border-brand-navy/15 rounded-xl p-3 text-brand-navy resize-none focus:outline-none font-mono leading-relaxed"
        />
      </div>

      {/* Primary CTA: Messenger direct link */}
      <a
        href={CONTACT_CHANNELS.messengerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm bg-[#0078FF] text-white hover:bg-[#0060cc] transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.683V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.627 0 12-4.975 12-11.111S18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z"/>
        </svg>
        {l === 'es' ? 'Abrir Messenger' : 'Open Messenger'}
      </a>

      {/* Fallback: Facebook profile */}
      <a
        href={CONTACT_CHANNELS.facebookPageUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold text-sm border-2 border-[#1877F2] text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        {l === 'es' ? 'Ver perfil de Facebook' : 'View Facebook profile'}
      </a>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ContactChannelSelector({
  experienceId, experienceSlug, experienceName,
  bookingRules, servicePricing, onClose,
}: Props) {
  const { t, lang } = useTranslation();
  const q = t.quote;
  const { cart, addItem, updateItem, removeItem, clearCart, getItemForExperience } = useQuoteCart();
  const createLeadMutation = useCreateLead();

  const existingItem = getItemForExperience(experienceId);
  const maxTravelers = bookingRules?.maxTravelers;
  const minTravelers = bookingRules?.minTravelers ?? 0;
  const chargeMode = bookingRules?.chargeMode;

  // ─── Step ─────────────────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>('form');

  // ─── Form state ───────────────────────────────────────────────────────────
  const [editingId, setEditingId] = useState<string | null>(existingItem?.id ?? null);
  const [startDate, setStartDate] = useState(existingItem?.startDate ?? '');
  const [endDate, setEndDate] = useState(existingItem?.endDate ?? '');
  const [days, setDays] = useState(existingItem?.days ?? 1);
  const [adults, setAdults] = useState(existingItem?.travelers.adults ?? 1);
  const [children, setChildren] = useState(existingItem?.travelers.children ?? 0);
  const [seniors, setSeniors] = useState(existingItem?.travelers.seniors ?? 0);
  const [notes, setNotes] = useState(existingItem?.notes ?? '');
  const [showPricing, setShowPricing] = useState(false);
  const [adultPriceInput, setAdultPriceInput] = useState(existingItem?.overridePricing?.adultPrice?.toString() ?? '');
  const [childPriceInput, setChildPriceInput] = useState(existingItem?.overridePricing?.childPrice?.toString() ?? '');
  const [seniorPriceInput, setSeniorPriceInput] = useState(existingItem?.overridePricing?.seniorPrice?.toString() ?? '');
  const [flatPriceInput, setFlatPriceInput] = useState(existingItem?.overridePricing?.flatPrice?.toString() ?? '');

  // ─── UI state ─────────────────────────────────────────────────────────────
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [cartWarning, setCartWarning] = useState(false);
  const [minWarning, setMinWarning] = useState(false);

  // Auto-calc days from date range
  useEffect(() => {
    if (startDate && endDate && endDate > startDate) {
      const diff = Math.round(
        (new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000,
      );
      if (diff > 0) setDays(diff);
    }
  }, [startDate, endDate]);

  // Capped traveler setters
  const totalTravelers = adults + children + seniors;
  function safeSet(setter: (n: number) => void, others: number[]) {
    return (n: number) => {
      if (maxTravelers != null && n + others.reduce((a, b) => a + b, 0) > maxTravelers) return;
      setter(n);
    };
  }

  // ─── Derived ──────────────────────────────────────────────────────────────
  const overridePricing: OverridePricing = {
    adultPrice: adultPriceInput ? Number(adultPriceInput) : undefined,
    childPrice: childPriceInput ? Number(childPriceInput) : undefined,
    seniorPrice: seniorPriceInput ? Number(seniorPriceInput) : undefined,
    flatPrice: flatPriceInput ? Number(flatPriceInput) : undefined,
  };
  const travelers: TravelerBreakdown = { adults, children, seniors };
  const subtotal = calculateSubtotal(travelers, days, bookingRules, servicePricing, overridePricing);
  const hasCart = cart.items.length > 0;
  const meetsMin = minTravelers <= 0 || totalTravelers >= minTravelers;

  // ─── Add / update ─────────────────────────────────────────────────────────
  const handleAddOrUpdate = useCallback(() => {
    if (!meetsMin) { setMinWarning(true); setTimeout(() => setMinWarning(false), 3000); return; }
    const data = {
      experienceId, experienceSlug, experienceName,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      days, travelers,
      chargeMode: chargeMode as ChargeMode | undefined,
      overridePricing: Object.values(overridePricing).some(v => v != null) ? overridePricing : undefined,
      notes: notes.trim() || undefined,
      bookingRules, servicePricing,
    };
    if (editingId) { updateItem(editingId, data); }
    else { addItem(data); setEditingId(null); }
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  }, [editingId, experienceId, experienceSlug, experienceName, startDate, endDate, days, travelers, chargeMode, overridePricing, notes, bookingRules, servicePricing, meetsMin]);

  function startEditItem(item: QuoteItem) {
    setEditingId(item.id);
    setStartDate(item.startDate ?? ''); setEndDate(item.endDate ?? '');
    setDays(item.days); setAdults(item.travelers.adults);
    setChildren(item.travelers.children); setSeniors(item.travelers.seniors);
    setNotes(item.notes ?? '');
    setAdultPriceInput(item.overridePricing?.adultPrice?.toString() ?? '');
    setChildPriceInput(item.overridePricing?.childPrice?.toString() ?? '');
    setSeniorPriceInput(item.overridePricing?.seniorPrice?.toString() ?? '');
    setFlatPriceInput(item.overridePricing?.flatPrice?.toString() ?? '');
  }
  function clearEditState() {
    setEditingId(null); setStartDate(''); setEndDate(''); setDays(1);
    setAdults(1); setChildren(0); setSeniors(0); setNotes('');
    setAdultPriceInput(''); setChildPriceInput(''); setSeniorPriceInput(''); setFlatPriceInput('');
  }

  // ─── Lead recording ───────────────────────────────────────────────────────
  function tryRecordLead(channel: 'whatsapp' | 'email' | 'facebook') {
    createLeadMutation.mutateAsync({
      data: {
        experienceId, experienceSlug, experienceTitle: experienceName,
        channel, lang: lang as 'en' | 'es',
        tentativeDate: startDate || undefined,
        people: totalTravelers || undefined,
        source: 'experience-detail',
      },
    }).catch(() => {});
  }

  function requireItems(): boolean {
    if (!hasCart) { setCartWarning(true); setTimeout(() => setCartWarning(false), 3500); return false; }
    return true;
  }

  // ─── Channel handlers ─────────────────────────────────────────────────────
  function handleWhatsApp() {
    if (!requireItems()) return;
    tryRecordLead('whatsapp');
    window.open(buildCartWhatsAppUrl(cart, lang as 'en' | 'es'), '_blank', 'noopener,noreferrer');
    onClose?.();
  }

  function handleEmail() {
    if (!requireItems()) return;
    tryRecordLead('email');
    setStep('email');
  }

  function handleMessenger() {
    if (!requireItems()) return;
    tryRecordLead('facebook');
    // Auto-copy message to clipboard immediately
    const msg = buildCartMessage(cart, lang as 'en' | 'es');
    navigator.clipboard.writeText(msg).catch(() => {});
    // Open Messenger in a new tab — works reliably in real browsers and mobile
    window.open(CONTACT_CHANNELS.messengerUrl, '_blank', 'noopener,noreferrer');
    // Show the step UI
    setStep('messenger');
  }

  // ─── Step renders ─────────────────────────────────────────────────────────
  if (step === 'email') {
    return (
      <div className="border-t border-brand-navy/10 pt-5 mt-2">
        <EmailStep cart={cart} lang={lang} onBack={() => setStep('form')} />
      </div>
    );
  }
  if (step === 'messenger') {
    return (
      <div className="border-t border-brand-navy/10 pt-5 mt-2">
        <MessengerStep cart={cart} lang={lang} onBack={() => setStep('form')} />
      </div>
    );
  }

  // ─── Main form ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 border-t border-brand-navy/10 pt-5">

      {/* Form: add / edit */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-navy/50">
            {editingId ? q.updateItem : q.addItem}
          </p>
          {addedFeedback && (
            <span className="text-xs font-semibold text-green-600 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> {q.addedToCart}
            </span>
          )}
        </div>

        {/* Experience badge */}
        <div className="px-3 py-2.5 bg-brand-navy/5 rounded-xl border border-brand-navy/8 space-y-0.5">
          <p className="text-sm font-semibold text-brand-navy">{experienceName}</p>
          {chargeMode && (
            <p className="text-xs text-brand-navy/40">
              {chargeModeLabel(chargeMode, lang as 'es' | 'en')}
              {maxTravelers != null && ` · max ${maxTravelers}`}
              {minTravelers > 0 && ` · min ${minTravelers}`}
            </p>
          )}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-brand-navy/50">{q.startDate}</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
              className="border border-brand-navy/15 rounded-xl px-3 py-2 text-sm text-brand-navy bg-white focus:outline-none focus:border-brand-gold transition-colors" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-brand-navy/50">{q.endDate}</label>
            <input type="date" value={endDate} min={startDate} onChange={e => setEndDate(e.target.value)}
              className="border border-brand-navy/15 rounded-xl px-3 py-2 text-sm text-brand-navy bg-white focus:outline-none focus:border-brand-gold transition-colors" />
          </div>
        </div>

        {/* Days */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-brand-navy/50 shrink-0">{q.days}:</span>
          <Stepper value={days} onChange={setDays} min={1} label="" />
        </div>

        {/* Travelers */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-navy/50">{q.travelers}</p>
            {maxTravelers != null && (
              <span className={cn("text-xs font-semibold tabular-nums",
                totalTravelers >= maxTravelers ? "text-amber-600" : "text-brand-navy/35")}>
                {totalTravelers}/{maxTravelers}
              </span>
            )}
          </div>
          <div className="flex gap-4 justify-around py-4 bg-brand-light rounded-xl border border-brand-navy/8">
            <Stepper value={adults} onChange={safeSet(setAdults, [children, seniors])} min={0} label={q.adults} />
            <Stepper value={children} onChange={safeSet(setChildren, [adults, seniors])} min={0} label={q.children} />
            <Stepper value={seniors} onChange={safeSet(setSeniors, [adults, children])} min={0} label={q.seniors} />
          </div>
          {minWarning && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <p className="text-xs font-semibold text-amber-700">
                {lang === 'es'
                  ? `Minimo ${minTravelers} viajero${minTravelers !== 1 ? 's' : ''}.`
                  : `Minimum ${minTravelers} traveler${minTravelers !== 1 ? 's' : ''}.`}
              </p>
            </div>
          )}
        </div>

        {/* Service pricing preview */}
        {servicePricing && chargeMode && (
          <div className="px-3 py-2.5 rounded-xl bg-brand-navy/4 border border-brand-navy/8 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-navy/40">{q.pricingOptional}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-brand-navy/55">
              {servicePricing.priceAdult != null && servicePricing.priceAdult > 0 && <span>Adult: ${servicePricing.priceAdult}</span>}
              {servicePricing.priceChild != null && servicePricing.priceChild > 0 && <span>Child: ${servicePricing.priceChild}</span>}
              {servicePricing.priceSenior != null && servicePricing.priceSenior > 0 && <span>Senior: ${servicePricing.priceSenior}</span>}
              {servicePricing.priceGroup != null && servicePricing.priceGroup > 0 && <span>Group: ${servicePricing.priceGroup}</span>}
              {servicePricing.priceDay != null && servicePricing.priceDay > 0 && <span>/day: ${servicePricing.priceDay}</span>}
            </div>
          </div>
        )}

        {/* Override pricing */}
        <div className="rounded-xl border border-brand-navy/10 overflow-hidden">
          <button type="button" onClick={() => setShowPricing(p => !p)}
            className="flex items-center justify-between w-full px-4 py-2.5 bg-white text-xs font-bold uppercase tracking-wider text-brand-navy/40 hover:text-brand-navy/60 transition-colors">
            <span>{lang === 'es' ? 'Ajustar precio manualmente' : 'Override pricing'}</span>
            {showPricing ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {showPricing && (
            <div className="px-4 pb-4 pt-2 bg-white space-y-3 border-t border-brand-navy/8">
              <div className="grid grid-cols-3 gap-2">
                <PriceInput label={q.perAdult} value={adultPriceInput} onChange={setAdultPriceInput} />
                <PriceInput label={q.perChild} value={childPriceInput} onChange={setChildPriceInput} />
                <PriceInput label={q.perSenior} value={seniorPriceInput} onChange={setSeniorPriceInput} />
              </div>
              <PriceInput label={q.flatPrice} value={flatPriceInput} onChange={setFlatPriceInput} />
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-brand-navy/50">{q.notes}</label>
          <textarea rows={2} placeholder={q.notesPlaceholder} value={notes} onChange={e => setNotes(e.target.value)}
            className="border border-brand-navy/15 rounded-xl px-3 py-2 text-sm text-brand-navy bg-white resize-none focus:outline-none focus:border-brand-gold transition-colors placeholder:text-brand-navy/25" />
        </div>

        {/* Subtotal preview */}
        {subtotal > 0 && (
          <div className="flex items-center justify-between px-4 py-2.5 bg-brand-gold/10 rounded-xl border border-brand-gold/25">
            <span className="text-xs font-bold text-brand-navy/55">{q.subtotal}</span>
            <span className="text-sm font-bold text-brand-navy">{formatPrice(subtotal)}</span>
          </div>
        )}

        {/* Add / update CTA */}
        <button type="button" onClick={handleAddOrUpdate}
          className={cn("w-full py-3 rounded-xl font-bold text-sm transition-colors shadow-sm",
            meetsMin ? "bg-brand-gold text-brand-navy hover:bg-brand-gold/90" : "bg-brand-navy/20 text-brand-navy/40 cursor-not-allowed")}>
          {editingId ? q.updateItem : q.addItem}
        </button>
      </div>

      {/* Cart summary */}
      <div className="rounded-2xl border border-brand-navy/10 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-brand-navy">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-brand-gold" />
            <span className="text-sm font-bold text-white">{q.cartTitle}</span>
          </div>
          <span className="text-xs text-white/50">
            {cart.items.length} {cart.items.length === 1 ? q.itemSingular : q.itemPlural}
          </span>
        </div>

        {!hasCart ? (
          <div className="px-4 py-6 bg-white text-center space-y-1">
            <p className="text-sm font-semibold text-brand-navy/35">{q.emptyCart}</p>
            <p className="text-xs text-brand-navy/25">{q.emptyCartHint}</p>
          </div>
        ) : (
          <div className="bg-white divide-y divide-brand-navy/6">
            {cart.items.map(item => (
              <div key={item.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className="text-sm font-bold text-brand-navy leading-tight">{item.experienceName}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-brand-navy/45">
                      {item.startDate && (
                        <span>
                          {formatDateDisplay(item.startDate)}
                          {item.endDate && item.endDate !== item.startDate && ` – ${formatDateDisplay(item.endDate)}`}
                        </span>
                      )}
                      <span>{item.days ?? 1}d</span>
                      <span>{buildTravelerLine(item.travelers, lang as 'es' | 'en')}</span>
                    </div>
                    {(item.subtotal ?? 0) > 0 ? (
                      <p className="text-xs font-bold text-brand-gold">{formatPrice(item.subtotal)}</p>
                    ) : (
                      <p className="text-xs text-brand-navy/35 italic">
                        {lang === 'es' ? 'Consultar precio' : 'Price on request'}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0 mt-0.5">
                    <button onClick={() => startEditItem(item)}
                      className="p-1.5 rounded-lg hover:bg-brand-light text-brand-navy/35 hover:text-brand-navy transition-colors" title={q.editItem}>
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => { removeItem(item.id); if (editingId === item.id) clearEditState(); }}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-brand-navy/35 hover:text-red-500 transition-colors" title={q.removeItem}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {cart.total > 0 && (
              <div className="flex items-center justify-between px-4 py-3 bg-brand-gold/8">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-navy/55">{q.totalLabel}</span>
                <span className="text-base font-bold text-brand-navy">{formatPrice(cart.total)}</span>
              </div>
            )}

            {/* Note when some items have no calculable price */}
            {(() => {
              const noPriceCount = cart.items.filter(i => (i.subtotal ?? 0) === 0).length;
              if (noPriceCount === 0) return null;
              return (
                <div className="px-4 py-2 border-t border-brand-navy/5 bg-white">
                  <p className="text-[11px] text-brand-navy/40 leading-relaxed">
                    {lang === 'es'
                      ? `${noPriceCount} servicio${noPriceCount !== 1 ? 's' : ''} requieren cotizacion manual y no se incluyen en el total.`
                      : `${noPriceCount} service${noPriceCount !== 1 ? 's' : ''} require manual pricing and are not included in the total.`}
                  </p>
                </div>
              );
            })()}

            <div className="flex justify-end px-4 py-2 bg-white">
              <button onClick={clearCart} className="text-xs text-brand-navy/25 hover:text-red-400 transition-colors">
                {q.clearCart}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cart warning */}
      {cartWarning && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <p className="text-xs font-semibold text-amber-700">{q.noItemsWarning}</p>
        </div>
      )}

      {/* Contact buttons */}
      <div className="space-y-2.5">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-navy/50">{q.contactVia}</p>

        {/* WhatsApp */}
        <button onClick={handleWhatsApp}
          className={cn("flex items-center justify-center gap-2.5 w-full py-3 rounded-xl font-bold text-sm transition-colors shadow-sm",
            hasCart ? "bg-[#25D366] text-white hover:bg-[#1da851]" : "bg-[#25D366]/50 text-white")}>
          <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
            <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
          </svg>
          {q.whatsapp}
        </button>

        {/* Email */}
        <button onClick={handleEmail}
          className={cn("flex items-center justify-center gap-2.5 w-full py-3 rounded-xl font-bold text-sm transition-colors shadow-sm",
            hasCart ? "bg-brand-navy text-white hover:bg-brand-ocean" : "bg-brand-navy/45 text-white")}>
          <Mail className="w-4.5 h-4.5" />
          {q.email}
        </button>

        {/* Messenger */}
        <button onClick={handleMessenger}
          className={cn("flex items-center justify-center gap-2.5 w-full py-3 rounded-xl font-bold text-sm transition-colors border-2",
            hasCart ? "border-[#0078FF] text-[#0078FF] hover:bg-[#0078FF] hover:text-white" : "border-[#0078FF]/40 text-[#0078FF]/40")}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.683V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.627 0 12-4.975 12-11.111S18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z"/>
          </svg>
          {lang === 'es' ? 'Messenger' : 'Messenger'}
        </button>
      </div>

      <p className="text-[11px] text-brand-navy/30 text-center leading-relaxed">{q.contactNote}</p>
    </div>
  );
}
