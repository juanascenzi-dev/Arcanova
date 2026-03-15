import { useTranslation } from '@/contexts/i18n';
import { motion } from 'framer-motion';
import { Umbrella } from 'lucide-react';

export function RainPlan() {
  const { t } = useTranslation();

  return (
    <section id="plan-b" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-brand-ocean" />
      <div className="absolute inset-0 bg-gradient-to-br from-brand-navy to-transparent opacity-80" />
      
      {/* Decorative large icon */}
      <div className="absolute -right-20 -top-20 text-white opacity-5">
        <Umbrella className="w-96 h-96" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/20">
            <Umbrella className="w-8 h-8 text-brand-gold" />
          </div>
          <h2 className="text-4xl md:text-5xl font-display text-white mb-6">
            {t.rainPlan.heading}
          </h2>
          <p className="text-lg text-white/80 mb-10 leading-relaxed max-w-2xl mx-auto">
            {t.rainPlan.subtext}
          </p>
          <button 
            onClick={() => document.getElementById('experiencias')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-4 bg-brand-gold text-brand-navy font-bold rounded-xl hover:bg-white transition-colors duration-300"
          >
            {t.rainPlan.cta}
          </button>
        </motion.div>
      </div>
    </section>
  );
}
