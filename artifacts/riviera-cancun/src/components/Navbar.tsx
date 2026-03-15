import { useState, useEffect } from 'react';
import { useTranslation } from '@/contexts/i18n';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/Logo';

export function Navbar() {
  const { lang, setLang, t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinks = [
    { name: t.nav.experiences, id: 'experiencias' },
    { name: t.nav.about, id: 'nosotros' },
    { name: t.nav.testimonials, id: 'testimonios' },
    { name: t.nav.contact, id: 'contacto' },
  ];

  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "glass-nav py-3 shadow-lg" : "bg-transparent py-5"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        {/* Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <Logo size={36} color="#C9A84C" className="group-hover:rotate-45 transition-transform duration-700" />
          <div className="flex flex-col">
            <span className="font-display font-bold text-xl leading-none tracking-[0.15em] text-white">AUSTRAL</span>
            <span className="text-[10px] uppercase tracking-widest text-brand-gold">Cancún Premium</span>
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          <div className="flex gap-6">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="text-sm font-medium text-white/90 hover:text-brand-gold transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-brand-gold hover:after:w-full after:transition-all after:duration-300"
              >
                {link.name}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-white/20 mx-2" />

          {/* Lang Toggle */}
          <div className="flex items-center bg-white/10 rounded-full p-1 border border-white/10">
            <button 
              onClick={() => setLang('es')}
              className={cn("px-3 py-1 text-xs font-semibold rounded-full transition-all", lang === 'es' ? "bg-brand-gold text-brand-navy" : "text-white hover:text-brand-gold")}
            >
              ES
            </button>
            <button 
              onClick={() => setLang('en')}
              className={cn("px-3 py-1 text-xs font-semibold rounded-full transition-all", lang === 'en' ? "bg-brand-gold text-brand-navy" : "text-white hover:text-brand-gold")}
            >
              EN
            </button>
          </div>

          <button 
            onClick={() => scrollTo('contacto')}
            className="px-6 py-2.5 bg-brand-gold text-brand-navy font-semibold rounded-lg hover:bg-white hover:text-brand-navy transition-all duration-300 shadow-[0_0_15px_rgba(201,168,76,0.3)] hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transform hover:-translate-y-0.5"
          >
            {t.nav.bookNow}
          </button>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="lg:hidden text-white p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-brand-navy border-b border-white/10 p-4 flex flex-col gap-4 shadow-2xl lg:hidden"
          >
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="text-left text-lg font-medium text-white p-2 hover:bg-white/5 rounded-lg"
              >
                {link.name}
              </button>
            ))}
            
            <div className="flex gap-4 p-2">
               <button 
                onClick={() => setLang('es')}
                className={cn("px-4 py-2 text-sm font-semibold rounded-lg flex-1 border", lang === 'es' ? "bg-brand-gold border-brand-gold text-brand-navy" : "border-white/20 text-white")}
              >
                Español
              </button>
              <button 
                onClick={() => setLang('en')}
                className={cn("px-4 py-2 text-sm font-semibold rounded-lg flex-1 border", lang === 'en' ? "bg-brand-gold border-brand-gold text-brand-navy" : "border-white/20 text-white")}
              >
                English
              </button>
            </div>

            <button 
              onClick={() => scrollTo('contacto')}
              className="w-full mt-2 px-6 py-3 bg-brand-gold text-brand-navy font-bold rounded-lg"
            >
              {t.nav.bookNow}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
