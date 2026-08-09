import { useState, useEffect } from 'react';
import { useTranslation } from '@/contexts/i18n';
import { motion } from 'framer-motion';
import { ShipWheelIcon } from '@/components/Logo';

// Optimized: 1200px wide, q=75 saves ~40% bandwidth vs 1600px q=80
const heroImages = [
  "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=1200&q=75",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=75",
  "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1200&q=75",
  "https://images.unsplash.com/photo-1547483238-2cbf881a559f?w=1200&q=75",
  "https://images.unsplash.com/photo-1518638150340-f706e86654de?w=1200&q=75",
  "https://images.unsplash.com/photo-1468413253725-0d5181091126?w=1200&q=75",
];

export function Hero() {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loadedSlides, setLoadedSlides] = useState<Set<number>>(new Set([0]));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        const next = (prev + 1) % heroImages.length;
        // Pre-load the next slide before transition
        setLoadedSlides(s => new Set([...s, next]));
        return next;
      });
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-brand-navy pt-20">

      {/* Carousel Background Images — only render loaded slides */}
      {heroImages.map((img, i) => {
        if (!loadedSlides.has(i)) return null;
        return (
          <div
            key={img}
            className="absolute inset-0 z-0 bg-center bg-cover"
            style={{
              backgroundImage: `url(${img})`,
              opacity: currentSlide === i ? 1 : 0,
              transition: 'opacity 1.5s ease-in-out',
            }}
          />
        );
      })}

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 z-[1]" style={{ background: 'rgba(10,22,40,0.60)' }} />
      {/* Gradient fade bottom */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-transparent via-transparent to-brand-navy/60 pointer-events-none" />
      {/* Subtle dot pattern */}
      <div className="absolute inset-0 z-[1] bg-dot-pattern opacity-15 pointer-events-none" />

      {/* Rotating Ship Wheel Watermark */}
      <div className="absolute inset-0 z-[2] flex items-center justify-center pointer-events-none">
        <div
          className="opacity-[0.08]"
          style={{ animation: 'slowspin 60s linear infinite' }}
        >
          <ShipWheelIcon size={460} color="#C9A84C" />
        </div>
      </div>
      <style>{`@keyframes slowspin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center mt-10">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-brand-gold/30 text-brand-gold text-xs font-bold tracking-widest uppercase mb-6 backdrop-blur-sm">
            ARCANOVA · Premium Travel
          </span>
        </motion.div>

        <motion.h1
          className="text-5xl md:text-7xl lg:text-8xl text-white max-w-5xl leading-[1.1] mb-6"
          style={{ fontFamily: 'var(--font-display, "Playfair Display", serif)' }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {t.hero.titleStart}
          <span className="text-brand-gold italic">{t.hero.titleEmphasis}</span>
          {t.hero.titleEnd}
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-white/75 max-w-2xl mb-10 font-light leading-relaxed"
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
            className="px-8 py-4 bg-brand-gold text-brand-navy font-bold rounded-xl hover:bg-white transition-all duration-300 shadow-[0_0_20px_rgba(201,168,76,0.35)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transform hover:-translate-y-1"
          >
            {t.hero.ctaPrimary}
          </button>
          <button
            onClick={() => scrollTo('contacto')}
            className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/25 text-white font-bold rounded-xl hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1"
          >
            {t.hero.ctaSecondary}
          </button>
        </motion.div>

        {/* Stats Strip */}
        <motion.div
          className="w-full max-w-4xl mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 border-y border-white/10 py-8 bg-black/15 backdrop-blur-sm rounded-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <div className="flex flex-col items-center md:border-r border-white/10 px-4">
            <span className="text-2xl font-bold text-brand-gold mb-1" style={{ fontFamily: 'var(--font-display)' }}>2,500+</span>
            <span className="text-xs text-white/60 uppercase tracking-wider">{t.hero.stats.travelers}</span>
          </div>
          <div className="flex flex-col items-center md:border-r border-white/10 px-4">
            <span className="text-2xl font-bold text-brand-gold mb-1" style={{ fontFamily: 'var(--font-display)' }}>98%</span>
            <span className="text-xs text-white/60 uppercase tracking-wider">{t.hero.stats.satisfaction}</span>
          </div>
          <div className="flex flex-col items-center md:border-r border-white/10 px-4">
            <span className="text-2xl font-bold text-brand-gold mb-1" style={{ fontFamily: 'var(--font-display)' }}>15+</span>
            <span className="text-xs text-white/60 uppercase tracking-wider">{t.hero.stats.experiences}</span>
          </div>
          <div className="flex flex-col items-center px-4">
            <span className="text-2xl font-bold text-brand-gold mb-1" style={{ fontFamily: 'var(--font-display)' }}>24/7</span>
            <span className="text-xs text-white/60 uppercase tracking-wider">{t.hero.stats.support}</span>
          </div>
        </motion.div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 w-full leading-none z-10 translate-y-[1px]">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-[60px] md:h-[120px]">
          <path d="M0 120L1440 120L1440 0C1440 0 1066.08 95 720 95C373.918 95 0 0 0 0L0 120Z" fill="hsl(42 54% 90%)"/>
        </svg>
      </div>
    </section>
  );
}
