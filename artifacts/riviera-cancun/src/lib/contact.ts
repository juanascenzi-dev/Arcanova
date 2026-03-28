/**
 * Single source of truth for all contact channels.
 * Every component that shows or uses contact info must import from here.
 *
 * DO NOT hardcode phone numbers, emails, or URLs in individual components.
 */

export const CONTACT_CHANNELS = {
  // Primary email address
  email: 'info.ixchelexperience@yahoo.com',

  // WhatsApp — Argentina country code 54 + number (no +, no spaces, no dashes)
  whatsappNumber: '5491138475846',

  // Facebook / Messenger
  // m.me is the Messenger direct-message link — use as primary channel
  messengerUrl: 'https://m.me/rodrigo.fimiani',
  facebookProfileUrl: 'https://www.facebook.com/rodrigo.fimiani',

  // Instagram — add handle when available
  instagramUrl: null as string | null,
} as const;

/** Build a wa.me URL with optional pre-filled message */
export function whatsappUrl(message?: string): string {
  const base = `https://wa.me/${CONTACT_CHANNELS.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Build a mailto: URL with subject and body */
export function mailtoUrl(subject: string, body: string): string {
  return `mailto:${CONTACT_CHANNELS.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
