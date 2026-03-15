import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'es' | 'en';

type Translations = {
  [key in Language]: {
    nav: {
      experiences: string;
      about: string;
      testimonials: string;
      contact: string;
      bookNow: string;
    };
    hero: {
      titleStart: string;
      titleEmphasis: string;
      titleEnd: string;
      subtitle: string;
      ctaPrimary: string;
      ctaSecondary: string;
      stats: {
        travelers: string;
        satisfaction: string;
        experiences: string;
        support: string;
      };
    };
    about: {
      headingStart: string;
      headingEmphasis: string;
      years: string;
      description: string;
      check1: string;
      check2: string;
      check3: string;
      services: {
        yacht: string;
        atv: string;
        bungee: string;
        cultural: string;
        snorkel: string;
        planB: string;
      };
    };
    experiences: {
      title: string;
      filters: {
        all: string;
        adventure: string;
        relax: string;
        cultural: string;
      };
      labels: {
        from: string;
        duration: string;
        details: string;
        bookThis: string;
      };
      tags: {
        bestSeller: string;
        adventure: string;
        extreme: string;
        cultural: string;
        comfort: string;
        planB: string;
      };
      items: {
        id1: { title: string; desc: string; includes: string[] };
        id2: { title: string; desc: string; includes: string[] };
        id3: { title: string; desc: string; includes: string[] };
        id4: { title: string; desc: string; includes: string[] };
        id5: { title: string; desc: string; includes: string[] };
        id6: { title: string; desc: string; includes: string[] };
      };
    };
    rainPlan: {
      heading: string;
      subtext: string;
      cta: string;
    };
    testimonials: {
      title: string;
    };
    howItWorks: {
      title: string;
      steps: {
        s1: { title: string; desc: string };
        s2: { title: string; desc: string };
        s3: { title: string; desc: string };
        s4: { title: string; desc: string };
      }
    };
    contact: {
      title: string;
      name: string;
      email: string;
      date: string;
      people: string;
      message: string;
      submit: string;
      subtext: string;
      success: string;
    };
    footer: {
      tagline: string;
      experiences: string;
      contact: string;
      social: string;
      rights: string;
    };
  }
};

const translations: Translations = {
  es: {
    nav: {
      experiences: "Experiencias",
      about: "Nosotros",
      testimonials: "Testimonios",
      contact: "Contacto",
      bookNow: "Reservar Ahora"
    },
    hero: {
      titleStart: "Tu aventura ",
      titleEmphasis: "premium",
      titleEnd: " comienza acá",
      subtitle: "Descubrí la Riviera Maya con exclusividad, confort y experiencias diseñadas a tu medida.",
      ctaPrimary: "Explorar Experiencias",
      ctaSecondary: "Armá Tu Viaje",
      stats: {
        travelers: "2,500+ Viajeros",
        satisfaction: "98% Satisfacción",
        experiences: "15+ Excursiones",
        support: "Soporte 24/7"
      }
    },
    about: {
      headingStart: "No vendemos excursiones. Creamos ",
      headingEmphasis: "experiencias.",
      years: "+10 años en Riviera Maya",
      description: "Nos especializamos en brindar un servicio de primer nivel para que tu única preocupación sea disfrutar. Entendemos que tu tiempo es valioso, por eso cuidamos cada detalle.",
      check1: "Viajes 100% personalizados",
      check2: "Soporte bilingüe 24/7",
      check3: "Garantía de Plan B por clima",
      services: {
        yacht: "Yates Privados",
        atv: "Cuatriciclos",
        bungee: "Bungee Extremo",
        cultural: "Ruinas Mayas",
        snorkel: "Snorkel VIP",
        planB: "Plan B (Lluvia)"
      }
    },
    experiences: {
      title: "Experiencias Inolvidables",
      filters: {
        all: "Todas",
        adventure: "Aventura",
        relax: "Relax & Confort",
        cultural: "Cultural"
      },
      labels: {
        from: "Desde USD",
        duration: "Duración",
        details: "Ver Detalles",
        bookThis: "Reservar Esta Experiencia"
      },
      tags: {
        bestSeller: "MÁS VENDIDO",
        adventure: "AVENTURA",
        extreme: "EXTREMO",
        cultural: "CULTURAL",
        comfort: "CONFORT",
        planB: "PLAN B"
      },
      items: {
        id1: { 
          title: "Yate Privado Premium", 
          desc: "Navegá las aguas turquesas del Caribe en un yate de lujo con chef a bordo y barra libre.",
          includes: ["Barra libre premium", "Chef a bordo", "Equipo de snorkel", "Toallas y amenidades"]
        },
        id2: { 
          title: "Cuatriciclos en la Selva", 
          desc: "Adrenalina pura recorriendo senderos ocultos en la selva maya hasta llegar a un cenote privado.",
          includes: ["ATV de última generación", "Guía experto", "Nado en cenote", "Snacks y bebidas"]
        },
        id3: { 
          title: "Bungee Jumping Extremo", 
          desc: "Desafiá tus límites con un salto al vacío sobre el mar Caribe. Solo para valientes.",
          includes: ["Equipo de seguridad certificado", "Video HD del salto", "Certificado de valor"]
        },
        id4: { 
          title: "Chichén Itzá VIP", 
          desc: "Descubrí la maravilla del mundo con un guía privado experto, evitando las multitudes.",
          includes: ["Transporte privado", "Guía arqueológico", "Almuerzo gourmet", "Entradas VIP sin fila"]
        },
        id5: { 
          title: "Traslados VIP Aeropuerto", 
          desc: "Comenzá tu viaje con el pie derecho. Traslados en SUV de lujo con bebidas frías.",
          includes: ["Chofer bilingüe", "SUV blindada/lujo", "Bebidas de cortesía", "Monitoreo de vuelo"]
        },
        id6: { 
          title: "Día de Lluvia Premium", 
          desc: "Si el clima no acompaña, tenemos el plan perfecto: museos interactivos, shopping VIP y spa.",
          includes: ["Transporte privado", "Entradas a atracciones techadas", "Reserva en restaurantes exclusivos"]
        }
      }
    },
    rainPlan: {
      heading: "¿Día de lluvia? Tenemos Plan B.",
      subtext: "El clima tropical es impredecible. Por eso, siempre tenemos alternativas increíbles preparadas para que no pierdas ni un día de tus vacaciones.",
      cta: "Consultar Opciones"
    },
    testimonials: {
      title: "Lo que dicen nuestros viajeros"
    },
    howItWorks: {
      title: "Tu viaje perfecto en 4 pasos",
      steps: {
        s1: { title: "Contanos tu idea", desc: "Escribinos por WhatsApp o completá el formulario con tus fechas y preferencias." },
        s2: { title: "Diseñamos tu viaje", desc: "Nuestros expertos arman una propuesta a tu medida con opciones exclusivas." },
        s3: { title: "Confirmás y listo", desc: "Aprobás el itinerario, realizás la reserva de forma segura y nosotros nos encargamos del resto." },
        s4: { title: "Disfrutás al máximo", desc: "Llegás a Cancún y vivís una experiencia sin preocupaciones con soporte 24/7." }
      }
    },
    contact: {
      title: "Armemos tu viaje ideal",
      name: "Nombre completo",
      email: "Correo electrónico",
      date: "Fecha estimada de viaje",
      people: "Cantidad de personas",
      message: "Contanos qué te gustaría hacer...",
      submit: "Enviar Consulta ✦",
      subtext: "Respondemos en menos de 24 horas, sin compromiso. WhatsApp disponible.",
      success: "¡Gracias! Hemos recibido tu consulta. Nos contactaremos pronto."
    },
    footer: {
      tagline: "Redefiniendo el turismo de lujo en el Caribe.",
      experiences: "Experiencias",
      contact: "Contacto",
      social: "Redes Sociales",
      rights: "Riviera Cancún Premium. Todos los derechos reservados."
    }
  },
  en: {
    nav: {
      experiences: "Experiences",
      about: "About Us",
      testimonials: "Testimonials",
      contact: "Contact",
      bookNow: "Book Now"
    },
    hero: {
      titleStart: "Your ",
      titleEmphasis: "premium",
      titleEnd: " adventure starts here",
      subtitle: "Discover the Riviera Maya with exclusivity, comfort, and experiences tailored to you.",
      ctaPrimary: "Explore Experiences",
      ctaSecondary: "Plan Your Trip",
      stats: {
        travelers: "2,500+ Travelers",
        satisfaction: "98% Satisfaction",
        experiences: "15+ Tours",
        support: "24/7 Support"
      }
    },
    about: {
      headingStart: "We don't sell tours. We create ",
      headingEmphasis: "experiences.",
      years: "10+ years in Riviera Maya",
      description: "We specialize in providing top-tier service so your only worry is enjoying yourself. We understand your time is valuable, which is why we take care of every detail.",
      check1: "100% personalized trips",
      check2: "24/7 bilingual support",
      check3: "Weather Plan B guarantee",
      services: {
        yacht: "Private Yachts",
        atv: "ATV Jungle",
        bungee: "Extreme Bungee",
        cultural: "Mayan Ruins",
        snorkel: "VIP Snorkel",
        planB: "Plan B (Rain)"
      }
    },
    experiences: {
      title: "Unforgettable Experiences",
      filters: {
        all: "All",
        adventure: "Adventure",
        relax: "Relax & Comfort",
        cultural: "Cultural"
      },
      labels: {
        from: "From USD",
        duration: "Duration",
        details: "See Details",
        bookThis: "Book This Experience"
      },
      tags: {
        bestSeller: "BEST SELLER",
        adventure: "ADVENTURE",
        extreme: "EXTREME",
        cultural: "CULTURAL",
        comfort: "COMFORT",
        planB: "PLAN B"
      },
      items: {
        id1: { 
          title: "Premium Private Yacht", 
          desc: "Sail the turquoise waters of the Caribbean in a luxury yacht with a chef on board and open bar.",
          includes: ["Premium open bar", "On-board chef", "Snorkel gear", "Towels and amenities"]
        },
        id2: { 
          title: "ATV Jungle Adventure", 
          desc: "Pure adrenaline riding through hidden trails in the Mayan jungle until reaching a private cenote.",
          includes: ["Latest generation ATVs", "Expert guide", "Cenote swim", "Snacks and drinks"]
        },
        id3: { 
          title: "Extreme Bungee Jumping", 
          desc: "Challenge your limits with a leap over the Caribbean sea. Only for the brave.",
          includes: ["Certified safety gear", "HD Video of the jump", "Certificate of courage"]
        },
        id4: { 
          title: "VIP Chichén Itzá", 
          desc: "Discover the wonder of the world with a private expert guide, avoiding the crowds.",
          includes: ["Private transport", "Archaeological guide", "Gourmet lunch", "VIP skip-the-line tickets"]
        },
        id5: { 
          title: "VIP Airport Transfers", 
          desc: "Start your trip on the right foot. Luxury SUV transfers with cold drinks ready for you.",
          includes: ["Bilingual driver", "Luxury/Armored SUV", "Complimentary drinks", "Flight monitoring"]
        },
        id6: { 
          title: "Premium Rainy Day Plan", 
          desc: "If the weather doesn't cooperate, we have the perfect plan: interactive museums, VIP shopping, and spa.",
          includes: ["Private transport", "Indoor attraction tickets", "Exclusive restaurant reservations"]
        }
      }
    },
    rainPlan: {
      heading: "Rainy day? We've got Plan B.",
      subtext: "Tropical weather is unpredictable. That's why we always have amazing alternatives ready so you don't miss a single day of your vacation.",
      cta: "View Options"
    },
    testimonials: {
      title: "What our travelers say"
    },
    howItWorks: {
      title: "Your perfect trip in 4 steps",
      steps: {
        s1: { title: "Tell us your idea", desc: "Message us on WhatsApp or fill out the form with your dates and preferences." },
        s2: { title: "We design your trip", desc: "Our experts put together a custom proposal with exclusive options." },
        s3: { title: "Confirm and go", desc: "Approve the itinerary, book securely, and we take care of the rest." },
        s4: { title: "Enjoy to the fullest", desc: "Arrive in Cancun and live a worry-free experience with 24/7 support." }
      }
    },
    contact: {
      title: "Let's plan your dream trip",
      name: "Full Name",
      email: "Email Address",
      date: "Estimated Travel Date",
      people: "Number of people",
      message: "Tell us what you'd like to do...",
      submit: "Send Inquiry ✦",
      subtext: "We respond in less than 24 hours, no commitment. WhatsApp available.",
      success: "Thank you! We've received your inquiry and will contact you soon."
    },
    footer: {
      tagline: "Redefining luxury tourism in the Caribbean.",
      experiences: "Experiences",
      contact: "Contact",
      social: "Social Media",
      rights: "Riviera Cancún Premium. All rights reserved."
    }
  }
};

type I18nContextType = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof translations['es'];
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('es');

  useEffect(() => {
    const saved = localStorage.getItem('rcp_lang') as Language;
    if (saved && (saved === 'es' || saved === 'en')) {
      setLang(saved);
    } else {
      const browserLang = navigator.language.toLowerCase();
      if (!browserLang.startsWith('es')) {
        setLang('en');
      }
    }
  }, []);

  const handleSetLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('rcp_lang', newLang);
  };

  return (
    <I18nContext.Provider value={{ lang, setLang: handleSetLang, t: translations[lang] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}
