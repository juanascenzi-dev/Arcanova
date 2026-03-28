import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/contexts/i18n';
import { useAdmin } from '@/contexts/AdminContext';
import type { Category } from '@/data/experiences';
import { type Experience, useListExperiences, getListExperiencesQueryKey } from '@workspace/api-client-react';
import { ExperienceEditorModal } from '@/components/admin/ExperienceEditorModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Check, X, Pencil, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { ContactChannelSelector } from '@/components/ContactChannelSelector';

export function Experiences() {
  const { t, lang } = useTranslation();
  const { isAdmin } = useAdmin();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Category | 'all'>('all');
  const [selectedExp, setSelectedExp] = useState<Experience | null>(null);
  const [editingExp, setEditingExp] = useState<Experience | null>(null);

  const { data: apiExperiences, isLoading } = useListExperiences();

  // Resolve display text from API data (multi-language JSONB fields)
  function resolveText(exp: Experience) {
    return {
      title: exp.title[lang] ?? exp.title['en'] ?? exp.id,
      desc: exp.desc[lang] ?? exp.desc['en'] ?? '',
      includes: (exp.includes[lang] ?? exp.includes['en'] ?? []) as string[],
    };
  }

  const getTagColor = (type: string) => {
    switch (type) {
      case 'bestSeller': return 'bg-brand-gold text-brand-navy';
      case 'adventure': return 'bg-teal-100 text-teal-800';
      case 'extreme': return 'bg-brand-coral text-white';
      case 'cultural': return 'bg-purple-100 text-purple-800';
      case 'comfort': return 'bg-blue-100 text-blue-800';
      case 'planB': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const allExperiences = apiExperiences ?? [];

  // Admin sees all (grayed-out hidden ones). Public sees only visible ones.
  const visibleData = isAdmin
    ? allExperiences
    : allExperiences.filter(e => e.visible);

  const filteredData = filter === 'all'
    ? visibleData
    : visibleData.filter(e => (e.category as string[]).includes(filter));

  function handleSaved() {
    queryClient.invalidateQueries({ queryKey: getListExperiencesQueryKey() });
  }

  return (
    <section id="experiencias" className="py-24 bg-brand-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl text-brand-navy mb-8">{t.experiences.title}</h2>

          <div className="flex flex-wrap justify-center gap-2">
            {(['all', 'adventure', 'relax', 'cultural'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-bold transition-all duration-300",
                  filter === cat
                    ? "bg-brand-navy text-white shadow-md"
                    : "bg-white text-brand-navy/60 border border-brand-navy/10 hover:border-brand-gold hover:text-brand-navy"
                )}
              >
                {t.experiences.filters[cat]}
              </button>
            ))}
          </div>
        </div>

        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Loading skeletons */}
          {isLoading && [...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse">
              <div className="h-64 bg-brand-navy/10" />
              <div className="p-6 space-y-3">
                <div className="h-5 bg-brand-navy/10 rounded-lg w-3/4" />
                <div className="h-3 bg-brand-navy/5 rounded w-full" />
                <div className="h-3 bg-brand-navy/5 rounded w-5/6" />
                <div className="mt-4 pt-4 border-t border-brand-navy/5 flex justify-between">
                  <div className="h-5 bg-brand-navy/10 rounded w-16" />
                  <div className="h-5 bg-brand-navy/10 rounded w-16" />
                </div>
              </div>
            </div>
          ))}

          <AnimatePresence>
            {!isLoading && filteredData.map((exp) => {
              const itemText = resolveText(exp);
              const hidden = !exp.visible;

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  key={exp.id}
                  className={cn(
                    "relative bg-white rounded-2xl overflow-hidden shadow-lg shadow-black/5 border border-brand-navy/5 group hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col",
                    isAdmin && hidden && "opacity-40 grayscale"
                  )}
                >
                  {/* Admin hidden badge */}
                  {isAdmin && hidden && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                      <span className="flex items-center gap-1.5 bg-brand-navy text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg">
                        <EyeOff className="w-3.5 h-3.5" /> Oculto
                      </span>
                    </div>
                  )}

                  {/* Admin edit pencil */}
                  {isAdmin && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingExp(exp); }}
                      title="Editar experiencia"
                      className="absolute top-3 right-3 z-30 w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand-gold hover:text-brand-navy text-brand-navy"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}

                  <div className="relative h-64 overflow-hidden bg-gradient-to-br from-brand-ocean to-brand-navy">
                    <img
                      src={exp.imageUrl}
                      alt={itemText.title}
                      loading="lazy"
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.img-fallback')) {
                          const fb = document.createElement('div');
                          fb.className = 'img-fallback absolute inset-0 flex items-center justify-center text-6xl';
                          fb.textContent = exp.fallbackEmoji;
                          parent.appendChild(fb);
                        }
                      }}
                    />
                    <div className="absolute top-4 left-4">
                      <span className={cn("px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full shadow-sm", getTagColor(exp.tagType))}>
                        {t.experiences.tags[exp.tagType as keyof typeof t.experiences.tags] ?? exp.tagType}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-display font-bold text-brand-navy mb-2">{itemText.title}</h3>
                    <p className="text-sm text-brand-navy/60 line-clamp-2 mb-4 flex-1">
                      {itemText.desc}
                    </p>

                    <div className="flex items-center justify-between border-t border-brand-navy/10 pt-4 mb-4">
                      <div>
                        <span className="block text-xs text-brand-navy/50">{t.experiences.labels.from}</span>
                        <span className="text-lg font-bold text-brand-navy">${exp.price}</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-xs text-brand-navy/50">{t.experiences.labels.duration}</span>
                        <span className="text-sm font-semibold flex items-center gap-1 text-brand-navy">
                          <Clock className="w-3.5 h-3.5" /> {exp.durationHours}h
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedExp(exp)}
                      className="w-full py-3 rounded-xl border-2 border-brand-navy/10 text-brand-navy font-bold hover:bg-brand-navy hover:text-white transition-colors duration-300"
                    >
                      {t.experiences.labels.details}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

      </div>

      {/* Detail modal */}
      <Dialog open={!!selectedExp} onOpenChange={(open) => !open && setSelectedExp(null)}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-white border-none rounded-2xl">
          {selectedExp && (() => {
            const itemText = resolveText(selectedExp);
            return (
              <div className="flex flex-col max-h-[90vh]">
                <div className="relative h-64 shrink-0 bg-gradient-to-br from-brand-ocean to-brand-navy">
                  <img
                    src={selectedExp.imageUrl}
                    alt={itemText.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <DialogClose className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors">
                    <X size={18} />
                  </DialogClose>
                  <div className="absolute bottom-4 left-6">
                    <span className={cn("px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full mb-2 inline-block shadow-sm", getTagColor(selectedExp.tagType))}>
                      {t.experiences.tags[selectedExp.tagType as keyof typeof t.experiences.tags] ?? selectedExp.tagType}
                    </span>
                    <DialogTitle className="text-3xl font-display text-white">{itemText.title}</DialogTitle>
                  </div>
                </div>

                <div className="p-6 overflow-y-auto">
                  <div className="flex justify-between items-center mb-6 bg-brand-light p-4 rounded-xl">
                    <div>
                      <span className="block text-xs text-brand-navy/60 uppercase">{t.experiences.labels.from}</span>
                      <span className="text-2xl font-bold text-brand-gold">${selectedExp.price}</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-xs text-brand-navy/60 uppercase">{t.experiences.labels.duration}</span>
                      <span className="text-lg font-semibold flex items-center gap-1 text-brand-navy">
                        <Clock className="w-4 h-4" /> {selectedExp.durationHours} hrs
                      </span>
                    </div>
                  </div>

                  <p className="text-brand-navy/80 leading-relaxed mb-6">{itemText.desc}</p>

                  <h4 className="font-bold text-brand-navy mb-3">{t.experiences.labels.includes}</h4>
                  <ul className="space-y-2 mb-6">
                    {itemText.includes.map((inc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                        <span className="text-brand-navy/80">{inc}</span>
                      </li>
                    ))}
                  </ul>

                  <ContactChannelSelector
                    experienceId={selectedExp.id}
                    experienceName={itemText.title}
                    onClose={() => setSelectedExp(null)}
                  />
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Admin editor modal */}
      {isAdmin && editingExp && (
        <ExperienceEditorModal
          exp={editingExp}
          open={!!editingExp}
          onClose={() => setEditingExp(null)}
          onSaved={handleSaved}
        />
      )}
    </section>
  );
}
