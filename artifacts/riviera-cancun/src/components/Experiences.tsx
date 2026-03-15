import { useState } from 'react';
import { useTranslation } from '@/contexts/i18n';
import { experiencesData, type Category, type ExperienceData } from '@/data/experiences';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTitle, DialogClose } from '@/components/ui/dialog';

export function Experiences() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<Category | 'all'>('all');
  const [selectedExp, setSelectedExp] = useState<ExperienceData | null>(null);

  const filteredData = filter === 'all' 
    ? experiencesData 
    : experiencesData.filter(exp => exp.category.includes(filter));

  const getTagColor = (type: ExperienceData['tagType']) => {
    switch(type) {
      case 'bestSeller': return 'bg-brand-gold text-brand-navy';
      case 'adventure': return 'bg-teal-100 text-teal-800';
      case 'extreme': return 'bg-brand-coral text-white';
      case 'cultural': return 'bg-purple-100 text-purple-800';
      case 'comfort': return 'bg-blue-100 text-blue-800';
      case 'planB': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const scrollToContact = () => {
    setSelectedExp(null);
    setTimeout(() => {
      document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

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

        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence>
            {filteredData.map((exp) => {
              const itemText = t.experiences.items[exp.id as keyof typeof t.experiences.items];
              
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  key={exp.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg shadow-black/5 border border-brand-navy/5 group hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={exp.imageUrl} 
                      alt={itemText.title} 
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4">
                      <span className={cn("px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full shadow-sm", getTagColor(exp.tagType))}>
                        {t.experiences.tags[exp.tagType]}
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

      {/* Modal / Dialog */}
      <Dialog open={!!selectedExp} onOpenChange={(open) => !open && setSelectedExp(null)}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-white border-none rounded-2xl">
          {selectedExp && (() => {
            const itemText = t.experiences.items[selectedExp.id as keyof typeof t.experiences.items];
            return (
              <div className="flex flex-col max-h-[90vh]">
                <div className="relative h-64 shrink-0">
                  <img src={selectedExp.imageUrl} alt={itemText.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <DialogClose className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors">
                    <X size={18} />
                  </DialogClose>
                  <div className="absolute bottom-4 left-6">
                    <span className={cn("px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full mb-2 inline-block shadow-sm", getTagColor(selectedExp.tagType))}>
                      {t.experiences.tags[selectedExp.tagType]}
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

                  <p className="text-brand-navy/80 leading-relaxed mb-6">
                    {itemText.desc}
                  </p>

                  <h4 className="font-bold text-brand-navy mb-3">¿Qué incluye?</h4>
                  <ul className="space-y-2 mb-8">
                    {itemText.includes.map((inc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                        <span className="text-brand-navy/80">{inc}</span>
                      </li>
                    ))}
                  </ul>

                  <button 
                    onClick={scrollToContact}
                    className="w-full py-4 bg-brand-gold text-brand-navy font-bold rounded-xl shadow-lg shadow-brand-gold/30 hover:bg-brand-navy hover:text-white transition-all duration-300"
                  >
                    {t.experiences.labels.bookThis}
                  </button>
                </div>
              </div>
            )
          })()}
        </DialogContent>
      </Dialog>
    </section>
  );
}
