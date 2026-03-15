import { useTranslation } from '@/contexts/i18n';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

export function Testimonials() {
  const { t } = useTranslation();

  const testimonials = [
    {
      name: "María G.",
      location: "Buenos Aires, Argentina",
      text: "Una experiencia superadora. El yate estaba impecable y el chef preparó un ceviche espectacular. Volveremos sin dudas.",
      rating: 5
    },
    {
      name: "Carlos & Ana",
      location: "Madrid, España",
      text: "Evitar las filas en Chichén Itzá valió cada centavo. El guía privado sabía muchísimo y nos hizo sentir como VIPs todo el tiempo.",
      rating: 5
    },
    {
      name: "James W.",
      location: "New York, USA",
      text: "It rained on our second day, but their Plan B saved the trip! The underground museum and private spa day were incredibly relaxing.",
      rating: 5
    }
  ];

  return (
    <section id="testimonios" className="py-24 bg-brand-sand">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-display text-brand-navy">{t.testimonials.title}</h2>
          <div className="w-24 h-1 bg-brand-gold mx-auto mt-6 rounded-full" />
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((test, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
              className="bg-white rounded-2xl p-8 relative shadow-lg shadow-black/5"
            >
              <div className="text-brand-gold text-6xl font-display absolute top-4 left-6 opacity-20">"</div>
              <div className="flex gap-1 mb-4 relative z-10">
                {[...Array(test.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-brand-gold text-brand-gold" />
                ))}
              </div>
              <p className="text-brand-navy/80 italic mb-6 relative z-10 min-h-[80px]">
                "{test.text}"
              </p>
              <div className="border-t border-brand-navy/10 pt-4">
                <p className="font-bold text-brand-navy">{test.name}</p>
                <p className="text-xs text-brand-navy/60 uppercase tracking-wide">{test.location}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
