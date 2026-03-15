import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { About } from '@/components/About';
import { Experiences } from '@/components/Experiences';
import { RainPlan } from '@/components/RainPlan';
import { Testimonials } from '@/components/Testimonials';
import { HowItWorks } from '@/components/HowItWorks';
import { Contact } from '@/components/Contact';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { ScrollToTopButton } from '@/components/ScrollToTopButton';

export default function Home() {
  return (
    <main className="w-full relative selection:bg-brand-gold selection:text-brand-navy">
      <Navbar />
      <Hero />
      <About />
      <Experiences />
      <RainPlan />
      <Testimonials />
      <HowItWorks />
      <Contact />
      <Footer />
      <WhatsAppButton />
      <ScrollToTopButton />
    </main>
  );
}
