/**
 * Shared application-level constants.
 *
 * Keep only values that are genuinely reused across multiple modules here.
 * Domain-specific limits (plan features, billing) live in their own modules
 * (e.g. src/lib/billing/planFeatures.ts).
 */

// ─── File upload size limits ───────────────────────────────────────────────

/** Maximum size for general file attachments (documents, PDFs, spreadsheets). */
export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024; // 10 MB

/** Maximum size for photo / image uploads (certificate photos, vehicle images). */
export const MAX_PHOTO_BYTES = 20 * 1024 * 1024; // 20 MB

// ─── Supabase Storage signed-URL TTLs ─────────────────────────────────────

/** Signed-URL validity for long-lived download links (batch PDFs, application docs). */
export const SIGNED_URL_TTL_LONG_SECS = 3_600; // 1 hour

/** Signed-URL validity for short-lived download links (contracts, materials). */
export const SIGNED_URL_TTL_SHORT_SECS = 300; // 5 minutes
