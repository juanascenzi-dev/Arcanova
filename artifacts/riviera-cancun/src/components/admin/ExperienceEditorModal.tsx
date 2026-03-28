import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { type Experience, getAdminToken } from '@workspace/api-client-react';
import { useTranslation } from '@/contexts/i18n';
import { apiUrl } from '@/lib/api';
import { Save, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { ChargeMode, ServiceBookingRules, ServicePricing } from '@/lib/quote';

interface Props {
  exp: Experience;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const VALID_CATEGORIES = ['adventure', 'relax', 'cultural'] as const;
const VALID_TAG_TYPES = ['bestSeller', 'adventure', 'extreme', 'cultural', 'comfort', 'planB'] as const;
const VALID_CHARGE_MODES: ChargeMode[] = [
  'per_person',
  'per_group_fixed',
  'per_day',
  'per_person_per_day',
  'per_group_per_day',
];
const CHARGE_MODE_LABELS: Record<ChargeMode, string> = {
  per_person: 'Per person',
  per_group_fixed: 'Fixed group price',
  per_day: 'Per day',
  per_person_per_day: 'Per person per day',
  per_group_per_day: 'Group per day',
};

export function ExperienceEditorModal({ exp, open, onClose, onSaved }: Props) {
  const { t } = useTranslation();
  
  // Text fields
  const [titleEn, setTitleEn] = useState(exp.title['en'] ?? '');
  const [titleEs, setTitleEs] = useState(exp.title['es'] ?? '');
  const [descEn, setDescEn] = useState(exp.desc['en'] ?? '');
  const [descEs, setDescEs] = useState(exp.desc['es'] ?? '');

  // Advanced fields
  const [imageUrl, setImageUrl] = useState(exp.imageUrl);
  const [visible, setVisible] = useState(exp.visible);
  const [sortOrder, setSortOrder] = useState(exp.sortOrder);
  const [tagType, setTagType] = useState(exp.tagType);
  const [category, setCategory] = useState<string[]>(exp.category as string[]);
  const [slug, setSlug] = useState(exp.slug);

  // Edit includes per language
  const [includesEn, setIncludesEn] = useState((exp.includes['en'] ?? []).join('\n'));
  const [includesEs, setIncludesEs] = useState((exp.includes['es'] ?? []).join('\n'));

  // Booking rules & pricing
  const [chargeMode, setChargeMode] = useState<ChargeMode>(
    (exp.bookingRules?.chargeMode as ChargeMode) ?? 'per_person'
  );
  const [minTravelers, setMinTravelers] = useState(exp.bookingRules?.minTravelers?.toString() ?? '');
  const [maxTravelers, setMaxTravelers] = useState(exp.bookingRules?.maxTravelers?.toString() ?? '');
  const [includedTravelers, setIncludedTravelers] = useState(exp.bookingRules?.includedTravelers?.toString() ?? '');
  const [chargeFullIncludedGroup, setChargeFullIncludedGroup] = useState(
    exp.bookingRules?.chargeFullIncludedGroup ?? false
  );
  const [priceAdult, setPriceAdult] = useState(exp.servicePricing?.priceAdult?.toString() ?? '');
  const [priceChild, setPriceChild] = useState(exp.servicePricing?.priceChild?.toString() ?? '');
  const [priceSenior, setPriceSenior] = useState(exp.servicePricing?.priceSenior?.toString() ?? '');
  const [priceGroup, setPriceGroup] = useState(exp.servicePricing?.priceGroup?.toString() ?? '');
  const [priceDay, setPriceDay] = useState(exp.servicePricing?.priceDay?.toString() ?? '');

  // UI state
  const [imgPreviewError, setImgPreviewError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<Array<{path: string; message: string}> | null>(null);
  const [success, setSuccess] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPricing, setShowPricing] = useState(true);

  const toggleCategory = (cat: string) => {
    setCategory(prev =>
      prev.includes(cat)
        ? prev.filter(c => c !== cat)
        : [...prev, cat]
    );
  };

  function parseNum(val: string): number | undefined {
    const n = parseFloat(val);
    return isNaN(n) ? undefined : n;
  }
  function parseIntVal(val: string): number | undefined {
    const n = parseInt(val);
    return isNaN(n) ? undefined : n;
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setErrorDetails(null);
    setSuccess(false);

    try {
      // Build booking rules (only if chargeMode is set)
      const bookingRules: ServiceBookingRules = {
        chargeMode,
        ...(minTravelers ? { minTravelers: parseIntVal(minTravelers) } : {}),
        ...(maxTravelers ? { maxTravelers: parseIntVal(maxTravelers) } : {}),
        ...(includedTravelers ? { includedTravelers: parseIntVal(includedTravelers) } : {}),
        ...(chargeFullIncludedGroup ? { chargeFullIncludedGroup: true } : {}),
      };

      // Build service pricing (only include set values)
      const servicePricing: ServicePricing = {
        ...(priceAdult ? { priceAdult: parseNum(priceAdult) } : {}),
        ...(priceChild ? { priceChild: parseNum(priceChild) } : {}),
        ...(priceSenior ? { priceSenior: parseNum(priceSenior) } : {}),
        ...(priceGroup ? { priceGroup: parseNum(priceGroup) } : {}),
        ...(priceDay ? { priceDay: parseNum(priceDay) } : {}),
      };

      const body: Record<string, unknown> = {
        title: { ...exp.title, en: titleEn, es: titleEs },
        desc: { ...exp.desc, en: descEn, es: descEs },
        includes: {
          ...exp.includes,
          en: includesEn.split('\n').map(s => s.trim()).filter(Boolean),
          es: includesEs.split('\n').map(s => s.trim()).filter(Boolean),
        },
        visible,
        sortOrder,
        bookingRules,
        servicePricing,
      };

      if (imageUrl !== exp.imageUrl) body.imageUrl = imageUrl;
      if (tagType !== exp.tagType) body.tagType = tagType;
      if (slug !== exp.slug) body.slug = slug;
      if (JSON.stringify(category) !== JSON.stringify(exp.category)) body.category = category;

      const token = getAdminToken();
      const res = await fetch(apiUrl(`/api/experiences/${exp.id}`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({})) as any;
        if (errData.details && Array.isArray(errData.details)) {
          setErrorDetails(errData.details);
          setError(errData.error ?? t.admin.validationFailed);
        } else {
          const msg = errData.error ?? `Server error (${res.status})`;
          setError(msg);
        }
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        onSaved();
        onClose();
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  }

  const fieldClass = "w-full bg-white border border-brand-navy/15 rounded-xl px-3 py-2 text-sm text-brand-navy focus:outline-none focus:border-brand-gold transition-colors";
  const labelClass = "block text-xs font-bold uppercase tracking-wider text-brand-navy/50 mb-1.5";
  const priceInputClass = "w-full bg-white border border-brand-navy/15 rounded-lg px-3 py-2 text-sm text-brand-navy focus:outline-none focus:border-brand-gold transition-colors disabled:opacity-60";

  const showPerPerson = chargeMode === 'per_person' || chargeMode === 'per_person_per_day';
  const showGroup = chargeMode === 'per_group_fixed' || chargeMode === 'per_group_per_day';
  const showDay = chargeMode === 'per_day' || chargeMode === 'per_group_per_day' || chargeMode === 'per_person_per_day';

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-[#F5ECD7] border-none rounded-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-navy/10 shrink-0">
          <div>
            <DialogTitle className="text-lg font-display font-bold text-brand-navy">
              {t.admin.editExperience}
            </DialogTitle>
            <p className="text-xs text-brand-navy/40 mt-0.5">
              ID: <code className="bg-brand-navy/10 px-1 rounded font-mono">{exp.id}</code>
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Success message */}
          {success && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Guardado exitosamente</span>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
              {errorDetails && errorDetails.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 space-y-1">
                  {errorDetails.map((detail, i) => (
                    <div key={i} className="text-xs text-red-600">
                      <span className="font-semibold">{detail.path}:</span> {detail.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Visible toggle */}
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-brand-navy/10">
            <div>
              <p className="text-sm font-bold text-brand-navy">{t.admin.visibleOnSite}</p>
              <p className="text-xs text-brand-navy/50 mt-0.5">{t.admin.visibleOnSiteDesc}</p>
            </div>
            <button
              onClick={() => setVisible(!visible)}
              disabled={saving}
              className={`w-12 h-6 rounded-full transition-colors relative disabled:opacity-50 ${visible ? 'bg-brand-gold' : 'bg-brand-navy/20'}`}
            >
              <span className={`absolute inset-y-1 w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${visible ? 'right-1' : 'left-1'}`} />
            </button>
          </div>

          {/* Basic editing section */}
          <div className="space-y-4">
            {/* Titles */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t.admin.titleEn}</label>
                <input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} disabled={saving} className={`${fieldClass} disabled:opacity-60`} />
              </div>
              <div>
                <label className={labelClass}>{t.admin.titleEs}</label>
                <input value={titleEs} onChange={(e) => setTitleEs(e.target.value)} disabled={saving} className={`${fieldClass} disabled:opacity-60`} />
              </div>
            </div>

            {/* Descriptions */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t.admin.descEn}</label>
                <textarea value={descEn} onChange={(e) => setDescEn(e.target.value)} rows={3} disabled={saving} className={`${fieldClass} resize-none disabled:opacity-60`} />
              </div>
              <div>
                <label className={labelClass}>{t.admin.descEs}</label>
                <textarea value={descEs} onChange={(e) => setDescEs(e.target.value)} rows={3} disabled={saving} className={`${fieldClass} resize-none disabled:opacity-60`} />
              </div>
            </div>

            {/* Includes */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t.admin.includesEn}</label>
                <textarea value={includesEn} onChange={(e) => setIncludesEn(e.target.value)} rows={3} disabled={saving} placeholder="Item 1&#10;Item 2&#10;Item 3" className={`${fieldClass} resize-none disabled:opacity-60 text-xs`} />
              </div>
              <div>
                <label className={labelClass}>{t.admin.includesEs}</label>
                <textarea value={includesEs} onChange={(e) => setIncludesEs(e.target.value)} rows={3} disabled={saving} placeholder="Elemento 1&#10;Elemento 2&#10;Elemento 3" className={`${fieldClass} resize-none disabled:opacity-60 text-xs`} />
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label className={labelClass}>{t.admin.imageUrl}</label>
              <input type="url" value={imageUrl} onChange={(e) => { setImageUrl(e.target.value); setImgPreviewError(false); }} disabled={saving} className={`${fieldClass} disabled:opacity-60`} placeholder="https://images.unsplash.com/..." />
              {imageUrl && (
                <div className="mt-3 h-32 rounded-xl overflow-hidden bg-gradient-to-br from-brand-ocean to-brand-navy border border-brand-navy/10">
                  {!imgPreviewError ? (
                    <img src={imageUrl} alt="preview" className="w-full h-full object-cover" onError={() => setImgPreviewError(true)} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/40 text-xs">{t.admin.imageUnavailable}</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Pricing & Capacity ─────────────────────────────────────────── */}
          <div className="border-t border-brand-navy/10 pt-4">
            <button
              onClick={() => setShowPricing(p => !p)}
              disabled={saving}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-navy/60 hover:text-brand-navy transition-colors disabled:opacity-50"
            >
              {showPricing ? '▼' : '▶'} Pricing &amp; Capacity
            </button>

            {showPricing && (
              <div className="mt-4 space-y-4">
                {/* Charge mode */}
                <div>
                  <label className={labelClass}>Charge Mode</label>
                  <select
                    value={chargeMode}
                    onChange={e => setChargeMode(e.target.value as ChargeMode)}
                    disabled={saving}
                    className={`${fieldClass} disabled:opacity-60`}
                  >
                    {VALID_CHARGE_MODES.map(mode => (
                      <option key={mode} value={mode}>{CHARGE_MODE_LABELS[mode]}</option>
                    ))}
                  </select>
                </div>

                {/* Capacity */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={labelClass}>Min Travelers</label>
                    <input type="number" min={0} placeholder="e.g. 1" value={minTravelers} onChange={e => setMinTravelers(e.target.value)} disabled={saving} className={priceInputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Max Travelers</label>
                    <input type="number" min={1} placeholder="e.g. 12" value={maxTravelers} onChange={e => setMaxTravelers(e.target.value)} disabled={saving} className={priceInputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Group Base Size</label>
                    <input type="number" min={1} placeholder="e.g. 4" value={includedTravelers} onChange={e => setIncludedTravelers(e.target.value)} disabled={saving} className={priceInputClass} />
                  </div>
                </div>

                {/* Charge full group toggle */}
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-brand-navy/10">
                  <button
                    type="button"
                    onClick={() => setChargeFullIncludedGroup(c => !c)}
                    disabled={saving}
                    className={`w-10 h-5 rounded-full transition-colors relative disabled:opacity-50 shrink-0 ${chargeFullIncludedGroup ? 'bg-brand-gold' : 'bg-brand-navy/20'}`}
                  >
                    <span className={`absolute inset-y-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${chargeFullIncludedGroup ? 'right-0.5' : 'left-0.5'}`} />
                  </button>
                  <div>
                    <p className="text-xs font-bold text-brand-navy">Always charge for group base size</p>
                    <p className="text-xs text-brand-navy/45">If fewer travelers than base size are selected, still charge for base</p>
                  </div>
                </div>

                {/* Price fields — shown based on charge mode */}
                <div className="grid grid-cols-2 gap-3">
                  {showPerPerson && (
                    <>
                      <div>
                        <label className={labelClass}>Price / Adult (USD)</label>
                        <input type="number" min={0} placeholder="0" value={priceAdult} onChange={e => setPriceAdult(e.target.value)} disabled={saving} className={priceInputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Price / Child (USD)</label>
                        <input type="number" min={0} placeholder="0" value={priceChild} onChange={e => setPriceChild(e.target.value)} disabled={saving} className={priceInputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Price / Senior (USD)</label>
                        <input type="number" min={0} placeholder="0" value={priceSenior} onChange={e => setPriceSenior(e.target.value)} disabled={saving} className={priceInputClass} />
                      </div>
                    </>
                  )}
                  {showGroup && (
                    <div>
                      <label className={labelClass}>Group Price (USD)</label>
                      <input type="number" min={0} placeholder="0" value={priceGroup} onChange={e => setPriceGroup(e.target.value)} disabled={saving} className={priceInputClass} />
                    </div>
                  )}
                  {showDay && (
                    <div>
                      <label className={labelClass}>Price / Day (USD)</label>
                      <input type="number" min={0} placeholder="0" value={priceDay} onChange={e => setPriceDay(e.target.value)} disabled={saving} className={priceInputClass} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Advanced section */}
          <div className="border-t border-brand-navy/10 pt-4">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              disabled={saving}
              className="text-xs font-bold uppercase tracking-wider text-brand-navy/60 hover:text-brand-navy transition-colors disabled:opacity-50"
            >
              {showAdvanced ? '▼' : '▶'} {t.admin.advancedFields}
            </button>

            {showAdvanced && (
              <div className="mt-4 space-y-4">
                {/* Sort Order */}
                <div>
                  <label className={labelClass}>{t.admin.sortOrder}</label>
                  <input type="number" min={0} max={999} value={sortOrder} onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)} disabled={saving} className={`${fieldClass} disabled:opacity-60`} />
                  <p className="text-xs text-brand-navy/40 mt-1">{t.admin.sortOrderHint}</p>
                </div>

                {/* Tag Type */}
                <div>
                  <label className={labelClass}>{t.admin.tagType}</label>
                  <select value={tagType} onChange={(e) => setTagType(e.target.value)} disabled={saving} className={`${fieldClass} disabled:opacity-60`}>
                    {VALID_TAG_TYPES.map(tag => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>
                </div>

                {/* Categories */}
                <div>
                  <label className={labelClass}>{t.admin.categories}</label>
                  <div className="flex gap-2">
                    {VALID_CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        disabled={saving}
                        className={`px-3 py-2 text-xs font-bold rounded-lg transition-colors disabled:opacity-50 ${
                          category.includes(cat)
                            ? 'bg-brand-gold text-brand-navy'
                            : 'bg-white border border-brand-navy/15 text-brand-navy/60 hover:border-brand-gold'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Slug */}
                <div>
                  <label className={labelClass}>{t.admin.slug}</label>
                  <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} disabled={saving} className={`${fieldClass} disabled:opacity-60 font-mono text-xs`} placeholder="premium-private-yacht" />
                  <p className="text-xs text-brand-navy/40 mt-1">{t.admin.slugHint}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-brand-navy/10 shrink-0 gap-3 bg-brand-light/50">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-5 py-2.5 text-sm font-semibold text-brand-navy border border-brand-navy/15 rounded-xl hover:border-brand-navy/30 transition-colors disabled:opacity-50"
          >
            {t.admin.cancel}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold bg-brand-gold text-brand-navy rounded-xl hover:bg-brand-navy hover:text-white transition-colors disabled:opacity-60"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> {t.admin.saving}</>
            ) : (
              <><Save className="w-4 h-4" /> {t.admin.save}</>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
