import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { type Experience } from '@workspace/api-client-react';
import { Save, X, Loader2, AlertCircle } from 'lucide-react';

interface Props {
  exp: Experience;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function ExperienceEditorModal({ exp, open, onClose, onSaved }: Props) {
  const [imageUrl, setImageUrl] = useState(exp.imageUrl);
  const [visible, setVisible] = useState(exp.visible);
  const [titleEn, setTitleEn] = useState(exp.title['en'] ?? '');
  const [titleEs, setTitleEs] = useState(exp.title['es'] ?? '');
  const [descEn, setDescEn] = useState(exp.desc['en'] ?? '');
  const [descEs, setDescEs] = useState(exp.desc['es'] ?? '');
  const [imgPreviewError, setImgPreviewError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const pin = (import.meta.env.VITE_ADMIN_PIN as string | undefined) ?? 'austral2025';
      const res = await fetch(`/api/experiences/${exp.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': pin,
        },
        body: JSON.stringify({
          title: { ...exp.title, en: titleEn, es: titleEs },
          desc:  { ...exp.desc,  en: descEn,  es: descEs  },
          imageUrl,
          visible,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(errData.error ?? `Error del servidor (${res.status})`);
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al guardar');
    } finally {
      setSaving(false);
    }
  }

  const fieldClass = "w-full bg-white border border-brand-navy/15 rounded-xl px-3 py-2 text-sm text-brand-navy focus:outline-none focus:border-brand-gold transition-colors";
  const labelClass = "block text-xs font-bold uppercase tracking-wider text-brand-navy/50 mb-1.5";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-[#F5ECD7] border-none rounded-2xl">
        <div className="flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-brand-navy/10 shrink-0">
            <div>
              <DialogTitle className="text-lg font-display font-bold text-brand-navy">
                Editar experiencia
              </DialogTitle>
              <p className="text-xs text-brand-navy/40 mt-0.5">
                ID: <code className="bg-brand-navy/10 px-1 rounded font-mono">{exp.id}</code>
                {' · '}
                <span className="text-brand-ocean">Los cambios se guardan en la base de datos</span>
              </p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-brand-navy/5 transition-colors">
              <X className="w-5 h-5 text-brand-navy/40" />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto p-6 space-y-5">
            {/* Visible toggle */}
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-brand-navy/10">
              <div>
                <p className="text-sm font-bold text-brand-navy">Visible en el sitio</p>
                <p className="text-xs text-brand-navy/50 mt-0.5">Si está desactivado, la card no aparece para visitantes</p>
              </div>
              <button
                onClick={() => setVisible(!visible)}
                className={`w-12 h-6 rounded-full transition-colors relative ${visible ? 'bg-brand-gold' : 'bg-brand-navy/20'}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${visible ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Image URL */}
            <div>
              <label className={labelClass}>URL de imagen</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => { setImageUrl(e.target.value); setImgPreviewError(false); }}
                className={fieldClass}
                placeholder="https://images.unsplash.com/..."
              />
              {imageUrl && (
                <div className="mt-2 h-28 rounded-xl overflow-hidden bg-gradient-to-br from-brand-ocean to-brand-navy">
                  {!imgPreviewError ? (
                    <img src={imageUrl} alt="preview" className="w-full h-full object-cover" onError={() => setImgPreviewError(true)} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/40 text-xs">Imagen no disponible</div>
                  )}
                </div>
              )}
            </div>

            {/* Titles */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Título en inglés</label>
                <input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>Título en español</label>
                <input value={titleEs} onChange={(e) => setTitleEs(e.target.value)} className={fieldClass} />
              </div>
            </div>

            {/* Descriptions */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Descripción en inglés</label>
                <textarea value={descEn} onChange={(e) => setDescEn(e.target.value)} rows={4} className={`${fieldClass} resize-none`} />
              </div>
              <div>
                <label className={labelClass}>Descripción en español</label>
                <textarea value={descEs} onChange={(e) => setDescEs(e.target.value)} rows={4} className={`${fieldClass} resize-none`} />
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end px-6 py-4 border-t border-brand-navy/10 shrink-0 gap-3">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-5 py-2.5 text-sm font-semibold text-brand-navy border border-brand-navy/15 rounded-xl hover:border-brand-navy/30 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold bg-brand-gold text-brand-navy rounded-xl hover:bg-brand-navy hover:text-white transition-colors disabled:opacity-60"
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
              ) : (
                <><Save className="w-4 h-4" /> Guardar cambios</>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
