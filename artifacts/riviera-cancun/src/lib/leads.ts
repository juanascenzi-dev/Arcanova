export interface Lead {
  id: string;
  experienceId: string;
  experienceName: string;
  date?: string;
  people?: string;
  channel: 'whatsapp' | 'email' | 'facebook';
  lang: 'es' | 'en';
  timestamp: string;
}

const STORAGE_KEY = 'austral_leads';

export const CONTACT_CONFIG = {
  whatsappNumber: '5491138475846',
  email: 'info.ixchelexperience@yahoo.com',
  facebookPage: 'https://www.facebook.com/share/1Ev9Xg7dQ9/?mibextid=wwXIfr',
  facebookMessenger: 'https://m.me/rodrigo.fimiani',
};

export function saveLead(lead: Omit<Lead, 'id' | 'timestamp'>): Lead {
  const leads = getLeads();
  const newLead: Lead = {
    ...lead,
    id: typeof crypto !== 'undefined' ? crypto.randomUUID() : String(Date.now()),
    timestamp: new Date().toISOString(),
  };
  leads.push(newLead);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  } catch {
    // silent fail if storage is unavailable
  }
  return newLead;
}

export function getLeads(): Lead[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Lead[]) : [];
  } catch {
    return [];
  }
}

export function buildWhatsAppUrl(params: {
  experienceName: string;
  date?: string;
  people?: string;
  lang: 'es' | 'en';
}): string {
  const { experienceName, date, people, lang } = params;
  let msg: string;
  if (lang === 'es') {
    msg = `Hola! 👋 Me interesa la experiencia *${experienceName}*.`;
    if (date) msg += `\nFecha tentativa: ${date}`;
    if (people) msg += `\nCantidad de personas: ${people}`;
    msg += `\n¿Podrían darme más información y disponibilidad?`;
  } else {
    msg = `Hi! 👋 I'm interested in the *${experienceName}* experience.`;
    if (date) msg += `\nEstimated date: ${date}`;
    if (people) msg += `\nNumber of people: ${people}`;
    msg += `\nCould you share more details and availability?`;
  }
  return `https://wa.me/${CONTACT_CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`;
}

export function buildEmailUrl(params: {
  experienceName: string;
  date?: string;
  people?: string;
  lang: 'es' | 'en';
}): string {
  const { experienceName, date, people, lang } = params;
  let subject: string;
  let body: string;
  if (lang === 'es') {
    subject = `Consulta: ${experienceName}`;
    body = `Hola!\n\nMe interesa la experiencia "${experienceName}".`;
    if (date) body += `\nFecha tentativa: ${date}`;
    if (people) body += `\nCantidad de personas: ${people}`;
    body += `\n\n¿Podrían darme más información y disponibilidad?\n\n¡Gracias!`;
  } else {
    subject = `Inquiry: ${experienceName}`;
    body = `Hi!\n\nI'm interested in the "${experienceName}" experience.`;
    if (date) body += `\nEstimated date: ${date}`;
    if (people) body += `\nNumber of people: ${people}`;
    body += `\n\nCould you share more details and availability?\n\nThank you!`;
  }
  return `mailto:${CONTACT_CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function buildFacebookMessage(params: {
  experienceName: string;
  date?: string;
  people?: string;
  lang: 'es' | 'en';
}): string {
  const { experienceName, date, people, lang } = params;
  if (lang === 'es') {
    let msg = `Hola! 👋 Me interesa la experiencia "${experienceName}".`;
    if (date) msg += ` Fecha tentativa: ${date}.`;
    if (people) msg += ` Somos ${people} personas.`;
    msg += ` ¿Podrían darme más información?`;
    return msg;
  } else {
    let msg = `Hi! 👋 I'm interested in the "${experienceName}" experience.`;
    if (date) msg += ` Estimated date: ${date}.`;
    if (people) msg += ` We are ${people} people.`;
    msg += ` Could you give me more details?`;
    return msg;
  }
}
