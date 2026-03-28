/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  SINGLE SOURCE OF TRUTH — CONTACT CHANNELS                     ║
 * ║  Every component that shows contact info imports from here.    ║
 * ║  DO NOT hardcode phone numbers, emails, or URLs elsewhere.     ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * ─── MIGRATION GUIDE: How to switch to a business Facebook Page ──────────────
 *
 *   Today (personal profile):
 *     messengerUrl  = 'https://m.me/rodrigo.fimiani'
 *     facebookPageUrl = 'https://www.facebook.com/rodrigo.fimiani'
 *
 *   When the business page is created, update ONLY these two lines:
 *     messengerUrl  = 'https://m.me/<PAGE_USERNAME>'          // e.g. m.me/australcancun
 *     facebookPageUrl = 'https://www.facebook.com/<PAGE_USERNAME>'
 *
 *   That's it. Every component will pick up the new values automatically.
 *   No other files need to be touched.
 *
 * ─── FIELD GUIDE ─────────────────────────────────────────────────────────────
 *
 *   email           Primary contact email (Yahoo, Outlook, Gmail — any)
 *   whatsappNumber  Country code + number, no +, no spaces, no dashes
 *                   Argentina: 54 + area code + number = 5491138475846
 *   messengerUrl    m.me link — use business page username when available
 *   facebookPageUrl Full Facebook URL — used as fallback when m.me fails
 *   instagramUrl    Set to null until the account exists; icon auto-hides
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const CONTACT_CHANNELS = {
  /** Primary contact email */
  email: 'info.ixchelexperience@yahoo.com',

  /**
   * WhatsApp — Argentina country code 54 + local number.
   * No +, no spaces, no dashes.
   * Format: 54 + area (11) + number (8 digits) = 5491138475846
   */
  whatsappNumber: '5491138475846',

  /**
   * Messenger direct-message link.
   * UPGRADE → replace with 'https://m.me/<PAGE_USERNAME>' when business page exists.
   * Currently uses personal profile: m.me/rodrigo.fimiani
   */
  messengerUrl: 'https://m.me/rodrigo.fimiani',

  /**
   * Facebook page / profile URL — shown as fallback when Messenger doesn't open.
   * UPGRADE → replace with 'https://www.facebook.com/<PAGE_USERNAME>'
   * Currently uses personal profile URL.
   */
  facebookPageUrl: 'https://www.facebook.com/rodrigo.fimiani',

  /**
   * Instagram URL.
   * Set to null until the account is created — the icon hides automatically.
   * UPGRADE → 'https://www.instagram.com/<HANDLE>'
   */
  instagramUrl: null as string | null,
} as const;

// ─── URL builder helpers ──────────────────────────────────────────────────────

/** WhatsApp chat link, optionally with pre-filled message */
export function whatsappUrl(message?: string): string {
  const base = `https://wa.me/${CONTACT_CHANNELS.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** mailto: URL with encoded subject and body */
export function mailtoUrl(subject: string, body: string): string {
  return `mailto:${CONTACT_CHANNELS.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
