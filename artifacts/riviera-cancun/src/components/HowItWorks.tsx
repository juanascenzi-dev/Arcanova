import { useTranslation } from '@/contexts/i18n';
import { motion } from 'framer-motion';

export function HowItWorks() {
  const { t } = useTranslation();

  const steps = [
    { num: '01', ...t.howItWorks.steps.s1 },
    { num: '02', ...t.howItWorks.steps.s2 },
    { num: '03', ...t.howItWorks.steps.s3 },
    { num: '04', ...t.howItWorks.steps.s4 },
  ];

  return (
    <section className="py-24 bg-brand-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl md:text-5xl font-display text-brand-navy text-center mb-16">
          {t.howItWorks.title}
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-[2px] bg-brand-navy/10 border-t border-dashed border-brand-gold" />

          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="relative flex flex-col items-center text-center"
            >
              <div className="w-24 h-24 rounded-full bg-white border border-brand-navy/10 shadow-lg flex items-center justify-center mb-6 z-10">
                <span className="text-3xl font-display font-bold text-brand-gold">{step.num}</span>
              </div>
              <h3 className="text-xl font-bold text-brand-navy mb-3">{step.title}</h3>
              <p className="text-brand-navy/70 text-sm leading-relaxed max-w-[250px]">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
