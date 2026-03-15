import { useState } from 'react';
import { useTranslation } from '@/contexts/i18n';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Send, CheckCircle } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const formSchema = z.object({
  name: z.string().min(2, "Required"),
  email: z.string().email("Invalid email"),
  date: z.string().min(1, "Required"),
  people: z.string().min(1, "Required"),
  message: z.string().min(10, "Tell us more please"),
});

export function Contact() {
  const { t } = useTranslation();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      date: "",
      people: "",
      message: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Form submitted:", values);
    setIsSubmitted(true);
    setTimeout(() => {
      form.reset();
      setIsSubmitted(false);
    }, 5000);
  }

  return (
    <section id="contacto" className="py-24 bg-brand-navy text-white relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-ocean/50 to-transparent pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-display mb-4">{t.contact.title}</h2>
          <p className="text-white/70">{t.contact.subtext}</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl"
        >
          {isSubmitted ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center text-center py-12"
            >
              <CheckCircle className="w-20 h-20 text-brand-gold mb-6" />
              <h3 className="text-2xl font-bold mb-2">{t.contact.success}</h3>
            </motion.div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/80">{t.contact.name}</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Juan Pérez" 
                            className="bg-black/20 border-white/20 text-white placeholder:text-white/30 focus-visible:ring-brand-gold h-12" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-brand-coral" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/80">{t.contact.email}</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="juan@ejemplo.com" 
                            className="bg-black/20 border-white/20 text-white placeholder:text-white/30 focus-visible:ring-brand-gold h-12" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-brand-coral" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/80">{t.contact.date}</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            className="bg-black/20 border-white/20 text-white placeholder:text-white/30 focus-visible:ring-brand-gold h-12 block w-full [color-scheme:dark]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-brand-coral" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="people"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/80">{t.contact.people}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-black/20 border-white/20 text-white focus:ring-brand-gold h-12">
                              <SelectValue placeholder="Seleccionar..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-brand-navy border-white/20 text-white">
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3-5">3-5</SelectItem>
                            <SelectItem value="6-10">6-10</SelectItem>
                            <SelectItem value="10+">10+</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-brand-coral" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">{t.contact.message}</FormLabel>
                      <FormControl>
                        <Textarea 
                          className="bg-black/20 border-white/20 text-white placeholder:text-white/30 focus-visible:ring-brand-gold min-h-[120px] resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-brand-coral" />
                    </FormItem>
                  )}
                />

                <button 
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="w-full h-14 bg-brand-gold text-brand-navy font-bold rounded-xl shadow-lg hover:bg-white transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  {t.contact.submit} 
                  <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </Form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
