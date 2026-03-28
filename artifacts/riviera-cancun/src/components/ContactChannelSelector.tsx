import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/contexts/i18n';
import { useQuoteCart } from '@/contexts/QuoteCartContext';
import { CONTACT_CONFIG } from '@/lib/leads';
import {
  type QuoteItem,
  type Pricing,
  type TravelerBreakdown,
  calculateSubtotal,
  formatPrice,
  formatDateDisplay,
  buildCartWhatsAppUrl,
  buildCartEmailUrl,
  buildCartMessage,
} from '@/lib/quote';
import { useCreateLead } from '@workspace/api-client-react';
import { Plus, Minus, Trash2, Pencil, Check, Copy, ShoppingCart, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  experienceId: string;
  experienceSlug: string;
  experienceName: string;
  onClose?: () => void;
}

// ─── Stepper ──────────────────────────────────────────────────────────────────

function Stepper({
  value,
  onChange,
  min = 0,
  label,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-navy/45">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-7 h-7 rounded-lg bg-brand-navy/8 hover:bg-brand-navy/15 flex items-center justify-center transition-colors"
        >
          <Minus className="w-3.5 h-3.5 text-brand-navy/60" />
        </button>
        <span className="w-6 text-center text-base font-bold text-brand-navy tabular-nums">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="w-7 h-7 rounded-lg bg-brand-navy/8 hover:bg-brand-navy/15 flex items-center justify-center transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-brand-navy/60" />
        </button>
      </div>
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

// ─── Main component ───────────────────────────────────────────────────────────

export function ContactChannelSelector({ experienceId, experienceSlug, experienceName, onClose }: Props) {
  const { t, lang } = useTranslation();
  const q = t.quote;
  const { cart, addItem, updateItem, removeItem, clearCart, getItemForExperience } = useQuoteCart();
  const createLeadMutation = useCreateLead();

  const existingItem = getItemForExperience(experienceId);

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
  const [adultPrice, setAdultPrice] = useState(existingItem?.pricing.adultPrice?.toString() ?? '');
  const [childPrice, setChildPrice] = useState(existingItem?.pricing.childPrice?.toString() ?? '');
  const [seniorPrice, setSeniorPrice] = useState(existingItem?.pricing.seniorPrice?.toString() ?? '');
  const [flatPrice, setFlatPrice] = useState(existingItem?.pricing.flatPrice?.toString() ?? '');

  // ─── UI state ─────────────────────────────────────────────────────────────
  const [fbStep, setFbStep] = useState(false);
  const [copied, setCopied] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [cartWarning, setCartWarning] = useState(false);

  // Auto-calc days from date range
  useEffect(() => {
    if (startDate && endDate && endDate > startDate) {
      const diff = Math.round(
        (new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000,
      );
      if (diff > 0) setDays(diff);
    }
  }, [startDate, endDate]);

  // ─── Derived values ───────────────────────────────────────────────────────
  const pricing: Pricing = {
    adultPrice: adultPrice ? Number(adultPrice) : undefined,
    childPrice: childPrice ? Number(childPrice) : undefined,
    seniorPrice: seniorPrice ? Number(seniorPrice) : undefined,
    flatPrice: flatPrice ? Number(flatPrice) : undefined,
  };
  const travelers: TravelerBreakdown = { adults, children, seniors };
  const subtotal = calculateSubtotal(travelers, pricing, days);
  const hasCart = cart.items.length > 0;

  // ─── Add / Update item ────────────────────────────────────────────────────
  const handleAddOrUpdate = useCallback(() => {
    const data = {
      experienceId,
      experienceSlug,
      experienceName,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      days,
      travelers,
      pricing,
      notes: notes.trim() || undefined,
    };
    if (editingId) {
      updateItem(editingId, data);
    } else {
      addItem(data);
      setEditingId(null);
    }
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  }, [editingId, experienceId, experienceSlug, experienceName, startDate, endDate, days, travelers, pricing, notes]);

  // ─── Edit an existing cart item ───────────────────────────────────────────
  function startEditItem(item: QuoteItem) {
    setEditingId(item.id);
    setStartDate(item.startDate ?? '');
    setEndDate(item.endDate ?? '');
    setDays(item.days);
    setAdults(item.travelers.adults);
    setChildren(item.travelers.children);
    setSeniors(item.travelers.seniors);
    setNotes(item.notes ?? '');
    setAdultPrice(item.pricing.adultPrice?.toString() ?? '');
    setChildPrice(item.pricing.childPrice?.toString() ?? '');
    setSeniorPrice(item.pricing.seniorPrice?.toString() ?? '');
    setFlatPrice(item.pricing.flatPrice?.toString() ?? '');
  }

  function clearEditState() {
    setEditingId(null);
    setStartDate(''); setEndDate(''); setDays(1);
    setAdults(1); setChildren(0); setSeniors(0); setNotes('');
    setAdultPrice(''); setChildPrice(''); setSeniorPrice(''); setFlatPrice('');
  }

  // ─── Background lead recording (fire-and-forget) ──────────────────────────
  function tryRecordLead(channel: 'whatsapp' | 'email' | 'facebook') {
    if (!experienceId || !experienceSlug || !experienceName) return;
    createLeadMutation
      .mutateAsync({
        experienceId,
        experienceSlug,
        experienceTitle: experienceName,
        channel,
        lang: lang as 'en' | 'es',
        tentativeDate: startDate || undefined,
        people: adults + children + seniors || undefined,
        source: 'experience-detail',
      })
      .catch(() => { /* Non-critical — contact flow continues regardless */ });
  }

  // ─── Guard: cart must have items ──────────────────────────────────────────
  function requireItems(): boolean {
    if (!hasCart) {
      setCartWarning(true);
      setTimeout(() => setCartWarning(false), 3000);
      return false;
    }
    return true;
  }

  // ─── Contact handlers ─────────────────────────────────────────────────────
  function handleWhatsApp() {
    if (!requireItems()) return;
    tryRecordLead('whatsapp');
    window.open(buildCartWhatsAppUrl(cart, lang as 'en' | 'es'), '_blank', 'noopener,noreferrer');
    onClose?.();
  }

  function handleEmail() {
    if (!requireItems()) return;
    tryRecordLead('email');
    window.location.href = buildCartEmailUrl(cart, lang as 'en' | 'es');
    onClose?.();
  }

  function handleFacebook() {
    if (!requireItems()) return;
    tryRecordLead('facebook');
    setFbStep(true);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(buildCartMessage(cart, lang as 'en' | 'es'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  }

  // ─── Facebook step ────────────────────────────────────────────────────────
  if (fbStep) {
    return (
      <div className="border-t border-brand-navy/10 pt-5 mt-2 space-y-4">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-navy/50">{t.inquiry.facebookCopy}</p>
        <div className="relative">
          <textarea
            readOnly
            rows={7}
            value={buildCartMessage(cart, lang as 'en' | 'es')}
            className="w-full text-sm bg-brand-light border border-brand-navy/15 rounded-xl p-3 pr-10 text-brand-navy resize-none focus:outline-none font-mono leading-relaxed"
          />
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-white border border-brand-navy/10 hover:border-brand-gold transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-brand-navy/50" />}
          </button>
        </div>
        {copied && <p className="text-xs text-green-600 font-semibold">{t.inquiry.copied}</p>}
        <a
          href={CONTACT_CONFIG.facebookMessenger}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#1877F2] text-white font-bold text-sm hover:bg-[#1565d8] transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.374 0 0 4.975 0 11.111c0 3.497 1.745 6.616 4.472 8.652V24l4.086-2.242c1.09.301 2.246.464 3.442.464 6.626 0 12-4.974 12-11.111C24 4.975 18.626 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.26L19.752 8l-6.561 6.963z"/>
          </svg>
          {t.inquiry.goToFacebook}
        </a>
        <button
          onClick={() => setFbStep(false)}
          className="w-full text-sm text-brand-navy/40 hover:text-brand-navy transition-colors py-1"
        >
          ← {t.inquiry.back}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 border-t border-brand-navy/10 pt-5">

      {/* ── Form: add / edit current experience ────────────────────── */}
      <div className="space-y-4">

        {/* Section header */}
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
        <div className="px-3 py-2 bg-brand-navy/5 rounded-xl border border-brand-navy/8">
          <p className="text-sm font-semibold text-brand-navy">{experienceName}</p>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-brand-navy/50">{q.startDate}</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="border border-brand-navy/15 rounded-xl px-3 py-2 text-sm text-brand-navy bg-white focus:outline-none focus:border-brand-gold transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-brand-navy/50">{q.endDate}</label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={e => setEndDate(e.target.value)}
              className="border border-brand-navy/15 rounded-xl px-3 py-2 text-sm text-brand-navy bg-white focus:outline-none focus:border-brand-gold transition-colors"
            />
          </div>
        </div>

        {/* Days */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-brand-navy/50 shrink-0">{q.days}:</span>
          <Stepper value={days} onChange={setDays} min={1} label="" />
        </div>

        {/* Travelers */}
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-navy/50">{q.travelers}</p>
          <div className="flex gap-4 justify-around py-4 bg-brand-light rounded-xl border border-brand-navy/8">
            <Stepper value={adults} onChange={setAdults} min={0} label={q.adults} />
            <Stepper value={children} onChange={setChildren} min={0} label={q.children} />
            <Stepper value={seniors} onChange={setSeniors} min={0} label={q.seniors} />
          </div>
        </div>

        {/* Pricing (collapsible) */}
        <div className="rounded-xl border border-brand-navy/10 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowPricing(p => !p)}
            className="flex items-center justify-between w-full px-4 py-2.5 bg-white text-xs font-bold uppercase tracking-wider text-brand-navy/40 hover:text-brand-navy/60 transition-colors"
          >
            <span>{q.pricingOptional}</span>
            {showPricing ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {showPricing && (
            <div className="px-4 pb-4 pt-2 bg-white space-y-3 border-t border-brand-navy/8">
              <div className="grid grid-cols-3 gap-2">
                <PriceInput label={q.perAdult} value={adultPrice} onChange={setAdultPrice} />
                <PriceInput label={q.perChild} value={childPrice} onChange={setChildPrice} />
                <PriceInput label={q.perSenior} value={seniorPrice} onChange={setSeniorPrice} />
              </div>
              <PriceInput label={q.flatPrice} value={flatPrice} onChange={setFlatPrice} />
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-brand-navy/50">{q.notes}</label>
          <textarea
            rows={2}
            placeholder={q.notesPlaceholder}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="border border-brand-navy/15 rounded-xl px-3 py-2 text-sm text-brand-navy bg-white resize-none focus:outline-none focus:border-brand-gold transition-colors placeholder:text-brand-navy/25"
          />
        </div>

        {/* Subtotal preview */}
        {subtotal > 0 && (
          <div className="flex items-center justify-between px-4 py-2.5 bg-brand-gold/10 rounded-xl border border-brand-gold/25">
            <span className="text-xs font-bold text-brand-navy/55">{q.subtotal}</span>
            <span className="text-sm font-bold text-brand-navy">{formatPrice(subtotal)}</span>
          </div>
        )}

        {/* Add / Update CTA */}
        <button
          type="button"
          onClick={handleAddOrUpdate}
          className="w-full py-3 rounded-xl bg-brand-gold text-brand-navy font-bold text-sm hover:bg-brand-gold/90 transition-colors shadow-sm"
        >
          {editingId ? q.updateItem : q.addItem}
        </button>
      </div>

      {/* ── Cart summary ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-brand-navy/10 overflow-hidden">

        {/* Cart header */}
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
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                      {item.startDate && (
                        <span className="text-xs text-brand-navy/45">
                          📅 {formatDateDisplay(item.startDate)}
                          {item.endDate && item.endDate !== item.startDate && ` → ${formatDateDisplay(item.endDate)}`}
                        </span>
                      )}
                      {item.days > 1 && <span className="text-xs text-brand-navy/45">⏱ {item.days}d</span>}
                      <span className="text-xs text-brand-navy/45">
                        👥&nbsp;
                        {[
                          item.travelers.adults > 0 && `${item.travelers.adults}A`,
                          item.travelers.children > 0 && `${item.travelers.children}N`,
                          item.travelers.seniors > 0 && `${item.travelers.seniors}M`,
                        ].filter(Boolean).join(' · ')}
                      </span>
                    </div>
                    {item.subtotal > 0 && (
                      <p className="text-xs font-bold text-brand-gold">{formatPrice(item.subtotal)}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0 mt-0.5">
                    <button
                      onClick={() => startEditItem(item)}
                      className="p-1.5 rounded-lg hover:bg-brand-light text-brand-navy/35 hover:text-brand-navy transition-colors"
                      title={q.editItem}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        removeItem(item.id);
                        if (editingId === item.id) clearEditState();
                      }}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-brand-navy/35 hover:text-red-500 transition-colors"
                      title={q.removeItem}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Total */}
            {cart.total > 0 && (
              <div className="flex items-center justify-between px-4 py-3 bg-brand-gold/8">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-navy/55">{q.totalLabel}</span>
                <span className="text-base font-bold text-brand-navy">{formatPrice(cart.total)}</span>
              </div>
            )}

            {/* Clear */}
            <div className="flex justify-end px-4 py-2 bg-white">
              <button
                onClick={clearCart}
                className="text-xs text-brand-navy/25 hover:text-red-400 transition-colors"
              >
                {q.clearCart}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Warning ─────────────────────────────────────────────────── */}
      {cartWarning && (
        <div className="px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-700">
          {q.noItemsWarning}
        </div>
      )}

      {/* ── Contact buttons ─────────────────────────────────────────── */}
      <div className="space-y-2.5">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-navy/50">{q.contactVia}</p>

        <button
          onClick={handleWhatsApp}
          className={cn(
            "flex items-center justify-center gap-2.5 w-full py-3 rounded-xl font-bold text-sm transition-colors shadow-sm",
            hasCart ? "bg-[#25D366] text-white hover:bg-[#1da851]" : "bg-[#25D366]/50 text-white",
          )}
        >
          <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
            <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
          </svg>
          {q.whatsapp}
        </button>

        <button
          onClick={handleEmail}
          className={cn(
            "flex items-center justify-center gap-2.5 w-full py-3 rounded-xl font-bold text-sm transition-colors shadow-sm",
            hasCart ? "bg-brand-navy text-white hover:bg-brand-ocean" : "bg-brand-navy/45 text-white",
          )}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="16" x="2" y="4" rx="2"/>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
          </svg>
          {q.email}
        </button>

        <button
          onClick={handleFacebook}
          className={cn(
            "flex items-center justify-center gap-2.5 w-full py-3 rounded-xl font-bold text-sm transition-colors border-2",
            hasCart
              ? "border-[#1877F2] text-[#1877F2] hover:bg-[#1877F2] hover:text-white"
              : "border-[#1877F2]/40 text-[#1877F2]/40",
          )}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          {q.facebook}
        </button>
      </div>

      <p className="text-[11px] text-brand-navy/30 text-center leading-relaxed">{q.contactNote}</p>
    </div>
  );
}
