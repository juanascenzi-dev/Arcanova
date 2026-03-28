import { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/contexts/i18n';
import { useAdmin } from '@/contexts/AdminContext';
import type { Category } from '@/data/experiences';
import { type Experience, useListExperiences, getListExperiencesQueryKey } from '@workspace/api-client-react';
import { ExperienceEditorModal } from '@/components/admin/ExperienceEditorModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Check, X, Pencil, EyeOff, Users, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { ContactChannelSelector } from '@/components/ContactChannelSelector';
import {
  getBasePrice,
  getPriceDisplay,
  getDurationDisplay,
  getCapacityDisplay,
  getPriceBucket,
  getDurationBucket,
  getCapacityBucket,
  sortExperiences,
  filterExperiences,
  hasActiveFilters,
  DEFAULT_FILTERS,
  type SortOption,
  type PriceBucket,
  type DurationBucket,
  type CapacityBucket,
  type ActiveFilters,
} from '@/lib/service-display';

// ─── Pill sub-component ───────────────────────────────────────────────────────
function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 border",
        active
          ? "bg-brand-navy text-white border-brand-navy shadow-sm"
          : "bg-white text-brand-navy/60 border-brand-navy/15 hover:border-brand-gold hover:text-brand-navy",
      )}
    >
      {children}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function Experiences() {
  const { t, lang } = useTranslation();
  const { isAdmin } = useAdmin();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<ActiveFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortOption>('featured');
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [selectedExp, setSelectedExp] = useState<Experience | null>(null);
  const [editingExp, setEditingExp] = useState<Experience | null>(null);

  const { data: apiExperiences, isLoading } = useListExperiences();

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
  const visibleData = isAdmin ? allExperiences : allExperiences.filter(e => e.visible);

  const filteredData = sortExperiences(
    filterExperiences(visibleData, filters),
    sort,
    lang as 'es' | 'en',
  );

  const hasFilters = hasActiveFilters(filters);

  function clearFilters() {
    setFilters(DEFAULT_FILTERS);
  }

  function setCategory(cat: Category | 'all') {
    setFilters(f => ({ ...f, category: cat }));
  }

  function handleSaved() {
    queryClient.invalidateQueries({ queryKey: getListExperiencesQueryKey() });
  }

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'featured',      label: t.experiences.sortOptions.featured },
    { value: 'priceAsc',      label: t.experiences.sortOptions.priceAsc },
    { value: 'priceDesc',     label: t.experiences.sortOptions.priceDesc },
    { value: 'durationAsc',   label: t.experiences.sortOptions.durationAsc },
    { value: 'durationDesc',  label: t.experiences.sortOptions.durationDesc },
    { value: 'capacityAsc',   label: t.experiences.sortOptions.capacityAsc },
    { value: 'capacityDesc',  label: t.experiences.sortOptions.capacityDesc },
    { value: 'nameAZ',        label: t.experiences.sortOptions.nameAZ },
  ];

  return (
    <section id="experiencias" className="py-24 bg-brand-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Title */}
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl text-brand-navy mb-8">{t.experiences.title}</h2>
        </div>

        {/* Filter bar */}
        <div className="mb-8 space-y-3">

          {/* Row 1: Category pills + Sort dropdown */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {(['all', 'adventure', 'relax', 'cultural'] as const).map((cat) => (
                <FilterPill
                  key={cat}
                  active={filters.category === cat}
                  onClick={() => setCategory(cat)}
                >
                  {t.experiences.filters[cat]}
                </FilterPill>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {/* More filters toggle */}
              <button
                onClick={() => setShowMoreFilters(v => !v)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all duration-200",
                  showMoreFilters || hasFilters
                    ? "bg-brand-gold/10 border-brand-gold text-brand-navy"
                    : "bg-white text-brand-navy/60 border-brand-navy/15 hover:border-brand-gold hover:text-brand-navy",
                )}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                {t.experiences.filterCapacity.label}
                {hasFilters && (
                  <span className="ml-1 w-4 h-4 bg-brand-gold rounded-full text-[10px] font-black text-brand-navy flex items-center justify-center">
                    {[filters.capacity !== 'all', filters.price !== 'all', filters.duration !== 'all'].filter(Boolean).length}
                  </span>
                )}
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showMoreFilters && "rotate-180")} />
              </button>

              {/* Sort select */}
              <div className="relative">
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value as SortOption)}
                  className="appearance-none pl-3 pr-8 py-1.5 rounded-full text-sm font-semibold bg-white text-brand-navy border border-brand-navy/15 hover:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/30 transition-all cursor-pointer"
                >
                  {sortOptions.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-navy/50" />
              </div>
            </div>
          </div>

          {/* Row 2: Secondary filters (collapsible) */}
          <AnimatePresence>
            {showMoreFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22 }}
                className="overflow-hidden"
              >
                <div className="bg-white rounded-2xl border border-brand-navy/10 p-4 space-y-3">
                  {/* Capacity */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-brand-navy/50 uppercase tracking-wide w-20 shrink-0">
                      {t.experiences.filterCapacity.label}
                    </span>
                    {(['all', '1-2', '3-5', '5-10', '10plus'] as const).map(v => (
                      <FilterPill
                        key={v}
                        active={filters.capacity === v}
                        onClick={() => setFilters(f => ({ ...f, capacity: v }))}
                      >
                        {t.experiences.filterCapacity[v]}
                      </FilterPill>
                    ))}
                  </div>

                  {/* Price */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-brand-navy/50 uppercase tracking-wide w-20 shrink-0">
                      {t.experiences.filterPrice.label}
                    </span>
                    {(['all', 'under100', '100-250', '250-500', '500plus'] as const).map(v => (
                      <FilterPill
                        key={v}
                        active={filters.price === v}
                        onClick={() => setFilters(f => ({ ...f, price: v }))}
                      >
                        {t.experiences.filterPrice[v]}
                      </FilterPill>
                    ))}
                  </div>

                  {/* Duration */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-brand-navy/50 uppercase tracking-wide w-20 shrink-0">
                      {t.experiences.filterDuration.label}
                    </span>
                    {(['all', 'short', 'halfDay', 'fullDay'] as const).map(v => (
                      <FilterPill
                        key={v}
                        active={filters.duration === (v === 'halfDay' ? 'half-day' : v === 'fullDay' ? 'full-day' : v)}
                        onClick={() => {
                          const mapped = v === 'halfDay' ? 'half-day' : v === 'fullDay' ? 'full-day' : v;
                          setFilters(f => ({ ...f, duration: mapped as DurationBucket | 'all' }));
                        }}
                      >
                        {t.experiences.filterDuration[v]}
                      </FilterPill>
                    ))}
                  </div>

                  {/* Clear */}
                  {hasFilters && (
                    <div className="pt-1">
                      <button
                        onClick={clearFilters}
                        className="text-xs font-semibold text-brand-navy/50 hover:text-brand-coral transition-colors underline underline-offset-2"
                      >
                        {t.experiences.labels.clearFilters}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Loading skeletons */}
          {isLoading && [...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse">
              <div className="h-56 bg-brand-navy/10" />
              <div className="p-6 space-y-3">
                <div className="h-5 bg-brand-navy/10 rounded-lg w-3/4" />
                <div className="h-3 bg-brand-navy/5 rounded w-full" />
                <div className="h-3 bg-brand-navy/5 rounded w-5/6" />
                <div className="mt-4 pt-4 border-t border-brand-navy/5 grid grid-cols-3 gap-2">
                  <div className="h-8 bg-brand-navy/10 rounded-lg" />
                  <div className="h-8 bg-brand-navy/10 rounded-lg" />
                  <div className="h-8 bg-brand-navy/10 rounded-lg" />
                </div>
              </div>
            </div>
          ))}

          <AnimatePresence>
            {!isLoading && filteredData.map((exp) => {
              const itemText = resolveText(exp);
              const hidden = !exp.visible;
              const priceDisplay = getPriceDisplay(exp, lang as 'es' | 'en');
              const durationDisplay = getDurationDisplay(exp);
              const capacityDisplay = getCapacityDisplay(exp, lang as 'es' | 'en');

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
                    isAdmin && hidden && "opacity-40 grayscale",
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

                  {/* Image */}
                  <div className="relative h-56 overflow-hidden bg-gradient-to-br from-brand-ocean to-brand-navy">
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

                  {/* Body */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-display font-bold text-brand-navy mb-2">{itemText.title}</h3>
                    <p className="text-sm text-brand-navy/60 line-clamp-2 mb-4 flex-1">
                      {itemText.desc}
                    </p>

                    {/* Metadata row */}
                    <div className="grid grid-cols-3 gap-2 border-t border-brand-navy/10 pt-4 mb-4">
                      {/* Price */}
                      <div className="text-center">
                        <span className="block text-[10px] font-bold text-brand-navy/40 uppercase tracking-wide mb-0.5">
                          {t.experiences.labels.from}
                        </span>
                        <span className="text-sm font-bold text-brand-gold leading-tight">
                          USD {getBasePrice(exp)}
                        </span>
                      </div>
                      {/* Duration */}
                      <div className="text-center border-x border-brand-navy/10">
                        <span className="block text-[10px] font-bold text-brand-navy/40 uppercase tracking-wide mb-0.5">
                          {t.experiences.labels.duration}
                        </span>
                        <span className="text-sm font-semibold text-brand-navy flex items-center justify-center gap-0.5">
                          <Clock className="w-3 h-3 shrink-0" /> {durationDisplay}
                        </span>
                      </div>
                      {/* Capacity */}
                      <div className="text-center">
                        <span className="block text-[10px] font-bold text-brand-navy/40 uppercase tracking-wide mb-0.5">
                          {t.experiences.labels.capacity}
                        </span>
                        <span className="text-sm font-semibold text-brand-navy flex items-center justify-center gap-0.5">
                          <Users className="w-3 h-3 shrink-0" /> {capacityDisplay}
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

        {/* No results */}
        {!isLoading && filteredData.length === 0 && (
          <div className="text-center py-16">
            <p className="text-brand-navy/50 text-lg mb-4">{t.experiences.labels.noResults}</p>
            <button
              onClick={clearFilters}
              className="px-6 py-2.5 rounded-full bg-brand-navy text-white text-sm font-bold hover:bg-brand-ocean transition-colors"
            >
              {t.experiences.labels.clearFilters}
            </button>
          </div>
        )}

      </div>

      {/* Detail modal */}
      <Dialog open={!!selectedExp} onOpenChange={(open) => !open && setSelectedExp(null)}>
        <DialogContent hideCloseButton className="sm:max-w-2xl p-0 overflow-hidden bg-white border-none rounded-2xl">
          {selectedExp && (() => {
            const itemText = resolveText(selectedExp);
            const capacityDisplay = getCapacityDisplay(selectedExp, lang as 'es' | 'en');
            return (
              <div className="flex flex-col max-h-[90vh]">
                {/* Hero image */}
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
                  {/* Stats bar */}
                  <div className="grid grid-cols-3 gap-3 mb-6 bg-brand-light rounded-xl p-4">
                    <div className="text-center">
                      <span className="block text-xs text-brand-navy/50 uppercase font-bold tracking-wide mb-0.5">
                        {t.experiences.labels.from}
                      </span>
                      <span className="text-xl font-bold text-brand-gold">
                        USD {getBasePrice(selectedExp)}
                      </span>
                    </div>
                    <div className="text-center border-x border-brand-navy/10">
                      <span className="block text-xs text-brand-navy/50 uppercase font-bold tracking-wide mb-0.5">
                        {t.experiences.labels.duration}
                      </span>
                      <span className="text-base font-semibold text-brand-navy flex items-center justify-center gap-1">
                        <Clock className="w-4 h-4" /> {getDurationDisplay(selectedExp)}
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="block text-xs text-brand-navy/50 uppercase font-bold tracking-wide mb-0.5">
                        {t.experiences.labels.capacity}
                      </span>
                      <span className="text-base font-semibold text-brand-navy flex items-center justify-center gap-1">
                        <Users className="w-4 h-4" /> {capacityDisplay}
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
                    experienceSlug={selectedExp.slug}
                    experienceName={itemText.title}
                    bookingRules={selectedExp.bookingRules}
                    servicePricing={selectedExp.servicePricing}
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
