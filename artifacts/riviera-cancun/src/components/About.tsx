import { useTranslation } from '@/contexts/i18n';
import { motion } from 'framer-motion';
import { CheckCircle2, Anchor, Map, Activity, Landmark, Fish, Umbrella } from 'lucide-react';

export function About() {
  const { t } = useTranslation();

  const services = [
    { icon: Anchor, label: t.about.services.yacht },
    { icon: Map, label: t.about.services.atv },
    { icon: Activity, label: t.about.services.bungee },
    { icon: Landmark, label: t.about.services.cultural },
    { icon: Fish, label: t.about.services.snorkel },
    { icon: Umbrella, label: t.about.services.planB },
  ];

  return (
    <section id="nosotros" className="py-24 bg-brand-sand">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
          >
            <h4 className="text-brand-gold font-bold tracking-widest uppercase text-sm mb-4">
              {t.about.years}
            </h4>
            <h2 className="text-4xl md:text-5xl text-brand-navy mb-6 leading-tight">
              {t.about.headingStart}
              <span className="text-brand-gold italic">{t.about.headingEmphasis}</span>
            </h2>
            <p className="text-brand-navy/70 text-lg mb-8 leading-relaxed">
              {t.about.description}
            </p>
            
            <div className="space-y-4">
              {[t.about.check1, t.about.check2, t.about.check3].map((check, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="text-brand-gold h-6 w-6 shrink-0" />
                  <span className="text-brand-navy font-medium">{check}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-3 gap-4"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div 
                  key={index}
                  className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-4 shadow-sm border border-brand-navy/5 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-full bg-brand-sand flex items-center justify-center group-hover:bg-brand-gold transition-colors duration-300">
                    <Icon className="h-6 w-6 text-brand-navy group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-sm font-bold text-brand-navy">{service.label}</span>
                </div>
              )
            })}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
