import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export const SUPPORTED_LANGUAGES = ['en', 'es'] as const;
export type Language = typeof SUPPORTED_LANGUAGES[number];
export const DEFAULT_LANGUAGE: Language = 'en';
export const FALLBACK_LANGUAGE: Language = 'en';

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
        includes: string;
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
        yacht: { title: string; desc: string; includes: string[] };
        atv: { title: string; desc: string; includes: string[] };
        bungee: { title: string; desc: string; includes: string[] };
        chichenitza: { title: string; desc: string; includes: string[] };
        transfers: { title: string; desc: string; includes: string[] };
        rainday: { title: string; desc: string; includes: string[] };
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
      passion: string;
    };
    inquiry: {
      title: string;
      subtitle: string;
      dateLabel: string;
      peopleLabel: string;
      whatsapp: string;
      email: string;
      facebook: string;
      facebookCopy: string;
      goToFacebook: string;
      back: string;
      copied: string;
      note: string;
    };
    quote: {
      cartTitle: string;
      addItem: string;
      updateItem: string;
      editItem: string;
      removeItem: string;
      emptyCart: string;
      emptyCartHint: string;
      subtotal: string;
      totalLabel: string;
      startDate: string;
      endDate: string;
      days: string;
      travelers: string;
      adults: string;
      children: string;
      seniors: string;
      pricingOptional: string;
      perAdult: string;
      perChild: string;
      perSenior: string;
      flatPrice: string;
      notes: string;
      notesPlaceholder: string;
      contactVia: string;
      whatsapp: string;
      email: string;
      facebook: string;
      clearCart: string;
      itemSingular: string;
      itemPlural: string;
      addedToCart: string;
      contactNote: string;
      noItemsWarning: string;
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
      bookNow: "Consultar Ahora"
    },
    hero: {
      titleStart: "Tu aventura ",
      titleEmphasis: "premium",
      titleEnd: " comienza acá",
      subtitle: "Descubrí la Riviera Maya con exclusividad, confort y experiencias diseñadas a tu medida.",
      ctaPrimary: "Explorar Experiencias",
      ctaSecondary: "Armá Tu Viaje",
      stats: {
        travelers: "Viajeros felices",
        satisfaction: "Satisfacción",
        experiences: "Excursiones",
        support: "Soporte"
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
        bookThis: "Reservar Esta Experiencia",
        includes: "¿Qué incluye?"
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
        yacht: { 
          title: "Yate Privado Premium", 
          desc: "Navegá las aguas turquesas del Caribe en un yate de lujo con chef a bordo y barra libre.",
          includes: ["Barra libre premium", "Chef a bordo", "Equipo de snorkel", "Toallas y amenidades"]
        },
        atv: { 
          title: "Cuatriciclos en la Selva", 
          desc: "Adrenalina pura recorriendo senderos ocultos en la selva maya hasta llegar a un cenote privado.",
          includes: ["ATV de última generación", "Guía experto", "Nado en cenote", "Snacks y bebidas"]
        },
        bungee: { 
          title: "Bungee Jumping Extremo", 
          desc: "Desafiá tus límites con un salto al vacío sobre el mar Caribe. Solo para valientes.",
          includes: ["Equipo de seguridad certificado", "Video HD del salto", "Certificado de valor"]
        },
        chichenitza: { 
          title: "Chichén Itzá VIP", 
          desc: "Descubrí la maravilla del mundo con un guía privado experto, evitando las multitudes.",
          includes: ["Transporte privado", "Guía arqueológico", "Almuerzo gourmet", "Entradas VIP sin fila"]
        },
        transfers: { 
          title: "Traslados VIP Aeropuerto", 
          desc: "Comenzá tu viaje con el pie derecho. Traslados en SUV de lujo con bebidas frías.",
          includes: ["Chofer bilingüe", "SUV blindada/lujo", "Bebidas de cortesía", "Monitoreo de vuelo"]
        },
        rainday: { 
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
      tagline: "Del sur al paraíso — tu aventura premium en la Riviera Maya.",
      experiences: "Experiencias",
      contact: "Contacto",
      social: "Redes Sociales",
      rights: "AUSTRAL Cancún Premium. Todos los derechos reservados.",
      passion: "Hecho con pasión desde Argentina 🇦🇷"
    },
    inquiry: {
      title: "¿Te interesa esta experiencia?",
      subtitle: "Indicá una fecha y cantidad de personas (opcional) y elegí cómo querés consultarnos.",
      dateLabel: "Fecha tentativa",
      peopleLabel: "¿Cuántos son?",
      whatsapp: "Consultar por WhatsApp",
      email: "Consultar por Email",
      facebook: "Consultar por Facebook",
      facebookCopy: "Copiá este mensaje y pegalo en Facebook:",
      goToFacebook: "Abrir Facebook",
      back: "Volver",
      copied: "¡Copiado al portapapeles!",
      note: "No realizamos cobros por la web. El cierre de la reserva se coordina directamente con vos."
    },
    quote: {
      cartTitle: "Tu cotización",
      addItem: "Agregar al carrito",
      updateItem: "Actualizar ítem",
      editItem: "Editar",
      removeItem: "Eliminar",
      emptyCart: "Tu carrito está vacío",
      emptyCartHint: "Completá los datos de arriba y agregá esta experiencia.",
      subtotal: "Subtotal",
      totalLabel: "Total estimado",
      startDate: "Fecha de inicio",
      endDate: "Fecha de fin (opcional)",
      days: "Días",
      travelers: "Viajeros",
      adults: "Adultos",
      children: "Niños",
      seniors: "Adultos mayores",
      pricingOptional: "Precio estimado (opcional)",
      perAdult: "por adulto",
      perChild: "por niño",
      perSenior: "por adulto mayor",
      flatPrice: "Precio fijo por paquete",
      notes: "Notas",
      notesPlaceholder: "Ej: habitación con vista al mar, dieta especial...",
      contactVia: "Contactar por",
      whatsapp: "WhatsApp",
      email: "Email",
      facebook: "Facebook",
      clearCart: "Vaciar carrito",
      itemSingular: "experiencia",
      itemPlural: "experiencias",
      addedToCart: "¡Agregado al carrito!",
      contactNote: "No realizamos cobros por la web. La reserva se coordina directamente con vos.",
      noItemsWarning: "Agregá al menos una experiencia para continuar.",
    },
    admin: {
      editExperience: "Editar experiencia",
      visibleOnSite: "Visible en el sitio",
      visibleOnSiteDesc: "Si está desactivado, no aparece para visitantes",
      titleEn: "Título en inglés",
      titleEs: "Título en español",
      descEn: "Descripción en inglés",
      descEs: "Descripción en español",
      includesEn: "Incluye (EN - una línea por item)",
      includesEs: "Incluye (ES - una línea por item)",
      imageUrl: "URL de imagen",
      imageUnavailable: "Imagen no disponible",
      advancedFields: "Campos avanzados",
      sortOrder: "Orden de visualización (0-999)",
      sortOrderHint: "Menor = aparece primero",
      tagType: "Tipo de etiqueta",
      categories: "Categorías",
      slug: "Slug (URL-friendly)",
      slugHint: "Solo letras minúsculas, números y guiones",
      cancel: "Cancelar",
      save: "Guardar",
      saving: "Guardando...",
      validationFailed: "Error de validación",
      success: "Guardado exitosamente"
    }
  },
  en: {
    nav: {
      experiences: "Experiences",
      about: "About Us",
      testimonials: "Testimonials",
      contact: "Contact",
      bookNow: "Inquire Now"
    },
    hero: {
      titleStart: "Your ",
      titleEmphasis: "premium",
      titleEnd: " adventure starts here",
      subtitle: "Discover the Riviera Maya with exclusivity, comfort, and experiences tailored to you.",
      ctaPrimary: "Explore Experiences",
      ctaSecondary: "Plan Your Trip",
      stats: {
        travelers: "Happy travelers",
        satisfaction: "Satisfaction",
        experiences: "Tours",
        support: "Support"
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
        bookThis: "Book This Experience",
        includes: "What's included?"
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
        yacht: { 
          title: "Premium Private Yacht", 
          desc: "Sail the turquoise waters of the Caribbean in a luxury yacht with a chef on board and open bar.",
          includes: ["Premium open bar", "On-board chef", "Snorkel gear", "Towels and amenities"]
        },
        atv: { 
          title: "ATV Jungle Adventure", 
          desc: "Pure adrenaline riding through hidden trails in the Mayan jungle until reaching a private cenote.",
          includes: ["Latest generation ATVs", "Expert guide", "Cenote swim", "Snacks and drinks"]
        },
        bungee: { 
          title: "Extreme Bungee Jumping", 
          desc: "Challenge your limits with a leap over the Caribbean sea. Only for the brave.",
          includes: ["Certified safety gear", "HD Video of the jump", "Certificate of courage"]
        },
        chichenitza: { 
          title: "VIP Chichén Itzá", 
          desc: "Discover the wonder of the world with a private expert guide, avoiding the crowds.",
          includes: ["Private transport", "Archaeological guide", "Gourmet lunch", "VIP skip-the-line tickets"]
        },
        transfers: { 
          title: "VIP Airport Transfers", 
          desc: "Start your trip on the right foot. Luxury SUV transfers with cold drinks ready for you.",
          includes: ["Bilingual driver", "Luxury/Armored SUV", "Complimentary drinks", "Flight monitoring"]
        },
        rainday: { 
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
      tagline: "From the south to paradise — your premium adventure in the Riviera Maya.",
      experiences: "Experiences",
      contact: "Contact",
      social: "Social Media",
      rights: "AUSTRAL Cancún Premium. All rights reserved.",
      passion: "Made with passion from Argentina 🇦🇷"
    },
    inquiry: {
      title: "Interested in this experience?",
      subtitle: "Add an optional date and group size, then choose how you'd like to reach us.",
      dateLabel: "Estimated date",
      peopleLabel: "How many people?",
      whatsapp: "Inquire via WhatsApp",
      email: "Inquire via Email",
      facebook: "Inquire via Facebook",
      facebookCopy: "Copy this message and paste it on Facebook:",
      goToFacebook: "Open Facebook",
      back: "Go back",
      copied: "Copied to clipboard!",
      note: "We don't process payments online. Booking is confirmed directly with you."
    },
    quote: {
      cartTitle: "Your quote",
      addItem: "Add to quote",
      updateItem: "Update item",
      editItem: "Edit",
      removeItem: "Remove",
      emptyCart: "Your quote is empty",
      emptyCartHint: "Fill in the details above and add this experience.",
      subtotal: "Subtotal",
      totalLabel: "Total estimate",
      startDate: "Start date",
      endDate: "End date (optional)",
      days: "Days",
      travelers: "Travelers",
      adults: "Adults",
      children: "Children",
      seniors: "Seniors",
      pricingOptional: "Estimated pricing (optional)",
      perAdult: "per adult",
      perChild: "per child",
      perSenior: "per senior",
      flatPrice: "Flat price per package",
      notes: "Notes",
      notesPlaceholder: "E.g. ocean view room, special diet...",
      contactVia: "Contact via",
      whatsapp: "WhatsApp",
      email: "Email",
      facebook: "Facebook",
      clearCart: "Clear quote",
      itemSingular: "experience",
      itemPlural: "experiences",
      addedToCart: "Added to your quote!",
      contactNote: "We don't process payments online. Booking is confirmed directly with you.",
      noItemsWarning: "Please add at least one experience to proceed.",
    },
    admin: {
      editExperience: "Edit Experience",
      visibleOnSite: "Visible on site",
      visibleOnSiteDesc: "When disabled, visitors won't see it",
      titleEn: "Title in English",
      titleEs: "Title in Spanish",
      descEn: "Description in English",
      descEs: "Description in Spanish",
      includesEn: "Includes (EN - one line per item)",
      includesEs: "Includes (ES - one line per item)",
      imageUrl: "Image URL",
      imageUnavailable: "Image unavailable",
      advancedFields: "Advanced fields",
      sortOrder: "Display order (0-999)",
      sortOrderHint: "Lower = appears first",
      tagType: "Tag type",
      categories: "Categories",
      slug: "Slug (URL-friendly)",
      slugHint: "Lowercase letters, numbers and hyphens only",
      cancel: "Cancel",
      save: "Save",
      saving: "Saving...",
      validationFailed: "Validation error",
      success: "Successfully saved"
    }
  }
};

type I18nContextType = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof translations['es'];
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function getTranslation(lang: Language) {
  return translations[lang] ?? translations[FALLBACK_LANGUAGE];
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(DEFAULT_LANGUAGE);

  useEffect(() => {
    const saved = localStorage.getItem('rcp_lang');
    if (saved && SUPPORTED_LANGUAGES.includes(saved as Language)) {
      setLang(saved as Language);
    }
    // If no saved preference, DEFAULT_LANGUAGE ('en') is used — no browser detection
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
