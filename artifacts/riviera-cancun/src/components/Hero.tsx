import { useTranslation } from '@/contexts/i18n';
import { motion } from 'framer-motion';

export function Hero() {
  const { t } = useTranslation();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-brand-navy pt-20">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        {/* Unsplash: Drone view of Cancún/Yacht */}
        <img 
          src="https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=1920&q=80" 
          alt="Riviera Cancun aerial view" 
          className="w-full h-full object-cover"
        />
        {/* Gradient Wash */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/90 via-brand-ocean/80 to-brand-navy/95 mix-blend-multiply" />
        <div className="absolute inset-0 bg-dot-pattern opacity-30" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center mt-10">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-brand-gold/30 text-brand-gold text-xs font-bold tracking-widest uppercase mb-6 backdrop-blur-sm">
            Riviera Cancún Premium
          </span>
        </motion.div>

        <motion.h1 
          className="text-5xl md:text-7xl lg:text-8xl text-white max-w-5xl leading-[1.1] mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {t.hero.titleStart}
          <span className="text-brand-gold italic">{t.hero.titleEmphasis}</span>
          {t.hero.titleEnd}
        </motion.h1>

        <motion.p 
          className="text-lg md:text-xl text-white/70 max-w-2xl mb-10 font-light"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {t.hero.subtitle}
        </motion.p>

        <motion.div 
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <button 
            onClick={() => scrollTo('experiencias')}
            className="px-8 py-4 bg-brand-gold text-brand-navy font-bold rounded-xl hover:bg-white transition-all duration-300 shadow-[0_0_20px_rgba(201,168,76,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transform hover:-translate-y-1"
          >
            {t.hero.ctaPrimary}
          </button>
          <button 
            onClick={() => scrollTo('contacto')}
            className="px-8 py-4 bg-white/5 backdrop-blur-md border border-white/20 text-white font-bold rounded-xl hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1"
          >
            {t.hero.ctaSecondary}
          </button>
        </motion.div>

        {/* Stats Strip */}
        <motion.div 
          className="w-full max-w-4xl mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 border-y border-white/10 py-8 bg-black/10 backdrop-blur-sm rounded-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <div className="flex flex-col items-center md:border-r border-white/10">
            <span className="text-2xl font-display text-brand-gold mb-1">2,500+</span>
            <span className="text-xs text-white/60 uppercase tracking-wider">{t.hero.stats.travelers.split(' ')[1]}</span>
          </div>
          <div className="flex flex-col items-center md:border-r border-white/10">
            <span className="text-2xl font-display text-brand-gold mb-1">98%</span>
            <span className="text-xs text-white/60 uppercase tracking-wider">{t.hero.stats.satisfaction.split(' ')[1]}</span>
          </div>
          <div className="flex flex-col items-center md:border-r border-white/10">
            <span className="text-2xl font-display text-brand-gold mb-1">15+</span>
            <span className="text-xs text-white/60 uppercase tracking-wider">{t.hero.stats.experiences.split(' ')[1]}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-display text-brand-gold mb-1">24/7</span>
            <span className="text-xs text-white/60 uppercase tracking-wider">{t.hero.stats.support.split(' ')[1]}</span>
          </div>
        </motion.div>

      </div>

      {/* Decorative Wave bottom */}
      <div className="absolute bottom-0 w-full leading-none z-10 translate-y-[1px]">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-[60px] md:h-[120px]">
          <path d="M0 120L1440 120L1440 0C1440 0 1066.08 95 720 95C373.918 95 0 0 0 0L0 120Z" fill="hsl(42 54% 90%)"/>
        </svg>
      </div>
    </section>
  );
}
