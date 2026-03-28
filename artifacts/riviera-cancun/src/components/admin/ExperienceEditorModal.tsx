import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { type Experience } from '@workspace/api-client-react';
import { useTranslation } from '@/contexts/i18n';
import { Save, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  exp: Experience;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const VALID_CATEGORIES = ['adventure', 'relax', 'cultural'] as const;
const VALID_TAG_TYPES = ['bestSeller', 'adventure', 'extreme', 'cultural', 'comfort', 'planB'] as const;

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

  // UI state
  const [imgPreviewError, setImgPreviewError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<Array<{path: string; message: string}> | null>(null);
  const [success, setSuccess] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const toggleCategory = (cat: string) => {
    setCategory(prev =>
      prev.includes(cat)
        ? prev.filter(c => c !== cat)
        : [...prev, cat]
    );
  };

  async function handleSave() {
    setSaving(true);
    setError(null);
    setErrorDetails(null);
    setSuccess(false);

    try {
      const pin = (import.meta.env.VITE_ADMIN_PIN as string | undefined) ?? 'austral2025';

      // Preserve existing translations in other languages, only update en/es
      const body: Record<string, unknown> = {
        title: { 
          ...exp.title,  // Keep any existing translations
          en: titleEn, 
          es: titleEs 
        },
        desc: { 
          ...exp.desc,   // Keep any existing translations
          en: descEn, 
          es: descEs 
        },
        includes: {
          ...exp.includes,  // Keep any existing translations
          en: includesEn.split('\n').map(s => s.trim()).filter(Boolean),
          es: includesEs.split('\n').map(s => s.trim()).filter(Boolean),
        },
        visible,
        sortOrder,
      };

      // Only include fields that changed
      if (imageUrl !== exp.imageUrl) body.imageUrl = imageUrl;
      if (tagType !== exp.tagType) body.tagType = tagType;
      if (slug !== exp.slug) body.slug = slug;
      if (JSON.stringify(category) !== JSON.stringify(exp.category)) body.category = category;

      const res = await fetch(`/api/experiences/${exp.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': pin,
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
                <input
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  disabled={saving}
                  className={`${fieldClass} disabled:opacity-60`}
                />
              </div>
              <div>
                <label className={labelClass}>{t.admin.titleEs}</label>
                <input
                  value={titleEs}
                  onChange={(e) => setTitleEs(e.target.value)}
                  disabled={saving}
                  className={`${fieldClass} disabled:opacity-60`}
                />
              </div>
            </div>

            {/* Descriptions */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t.admin.descEn}</label>
                <textarea
                  value={descEn}
                  onChange={(e) => setDescEn(e.target.value)}
                  rows={3}
                  disabled={saving}
                  className={`${fieldClass} resize-none disabled:opacity-60`}
                />
              </div>
              <div>
                <label className={labelClass}>{t.admin.descEs}</label>
                <textarea
                  value={descEs}
                  onChange={(e) => setDescEs(e.target.value)}
                  rows={3}
                  disabled={saving}
                  className={`${fieldClass} resize-none disabled:opacity-60`}
                />
              </div>
            </div>

            {/* Includes */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t.admin.includesEn}</label>
                <textarea
                  value={includesEn}
                  onChange={(e) => setIncludesEn(e.target.value)}
                  rows={3}
                  disabled={saving}
                  placeholder="Item 1&#10;Item 2&#10;Item 3"
                  className={`${fieldClass} resize-none disabled:opacity-60 text-xs`}
                />
              </div>
              <div>
                <label className={labelClass}>{t.admin.includesEs}</label>
                <textarea
                  value={includesEs}
                  onChange={(e) => setIncludesEs(e.target.value)}
                  rows={3}
                  disabled={saving}
                  placeholder="Elemento 1&#10;Elemento 2&#10;Elemento 3"
                  className={`${fieldClass} resize-none disabled:opacity-60 text-xs`}
                />
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label className={labelClass}>{t.admin.imageUrl}</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => { setImageUrl(e.target.value); setImgPreviewError(false); }}
                disabled={saving}
                className={`${fieldClass} disabled:opacity-60`}
                placeholder="https://images.unsplash.com/..."
              />
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
                  <input
                    type="number"
                    min={0}
                    max={999}
                    value={sortOrder}
                    onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                    disabled={saving}
                    className={`${fieldClass} disabled:opacity-60`}
                  />
                  <p className="text-xs text-brand-navy/40 mt-1">{t.admin.sortOrderHint}</p>
                </div>

                {/* Tag Type */}
                <div>
                  <label className={labelClass}>{t.admin.tagType}</label>
                  <select
                    value={tagType}
                    onChange={(e) => setTagType(e.target.value)}
                    disabled={saving}
                    className={`${fieldClass} disabled:opacity-60`}
                  >
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
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    disabled={saving}
                    className={`${fieldClass} disabled:opacity-60 font-mono text-xs`}
                    placeholder="premium-private-yacht"
                  />
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
