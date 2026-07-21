/**
 * _phi-scrub.ts — defense-in-depth PHI redaction for the public site assistant.
 *
 * The /api/chat assistant is a NO-PHI, public-info agent (constrained by its
 * system prompt + a same-origin guard). No PHI is expected. But because every
 * interaction is logged in full to D1 and that log is a training-corpus source,
 * we scrub PHI-looking spans from BOTH the stored conversation and the stored
 * reply before they ever land in the database — belt-and-suspenders, per the
 * hard PHI boundary on the training corpus.
 *
 * Patterns are a direct port of the PTAS phi-scanner (~/.purple/scripts/
 * phi-scanner.py) so detection is consistent across every collection path.
 *
 * This scrubs the STORED copy only. The live model still receives the verbatim
 * message (redaction must never change the visitor's experience), and the
 * function never throws from here — a scrub failure falls back to the original
 * string rather than blocking the response.
 */

interface ScrubRule {
  tag: string;
  re: RegExp;
}

// Ported from phi-scanner.py PATTERNS. `g` flag so replace hits every match.
const RULES: ScrubRule[] = [
  // SSN 123-45-6789
  { tag: '[REDACTED-SSN]', re: /\b\d{3}-\d{2}-\d{4}\b/g },
  // DOB / date-of-birth phrasing followed by a date
  {
    tag: '[REDACTED-DOB]',
    re: /\b(?:DOB|date\s+of\s+birth|born|birthday)\s*[:=]?\s*\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4}\b/gi,
  },
  // MRN / medical record / chart number
  {
    tag: '[REDACTED-MRN]',
    re: /\b(?:MRN|medical\s+record|chart)\s*#?\s*[:=]?\s*\d{5,10}\b/gi,
  },
  // subject/patient/participant followed by a proper first+last name
  {
    tag: '[REDACTED-NAME]',
    re: /\b(?:subject|patient|participant)\s+[A-Z][a-z]+\s+[A-Z][a-z]+/gi,
  },
  // LASTNAME, Firstname
  { tag: '[REDACTED-NAME]', re: /\b[A-Z]{2,},\s+[A-Z][a-z]+\b/g },
  // phone number in a clinical/contact context
  {
    tag: '[REDACTED-PHONE]',
    re: /(?:patient|subject|participant|contact)[^\n]{0,40}?\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/gi,
  },
];

/** Redact PHI-looking spans from a single string. Never throws. */
export function scrubPhi(input: string | null | undefined): string {
  if (!input) return input ?? '';
  try {
    let out = input;
    for (const rule of RULES) {
      out = out.replace(rule.re, rule.tag);
    }
    return out;
  } catch {
    return input; // best-effort: never let scrubbing break logging
  }
}

/**
 * Scrub the JSON-encoded conversation array that gets stored in messages_json.
 * Parses, scrubs each message's content, re-encodes. Falls back to a
 * pattern-scrub of the raw string if the JSON can't be parsed.
 */
export function scrubMessagesJson(messagesJson: string): string {
  try {
    const parsed = JSON.parse(messagesJson) as Array<{ role: string; content: string }>;
    if (!Array.isArray(parsed)) return scrubPhi(messagesJson);
    const cleaned = parsed.map((m) => ({
      role: m?.role,
      content: scrubPhi(typeof m?.content === 'string' ? m.content : ''),
    }));
    return JSON.stringify(cleaned);
  } catch {
    return scrubPhi(messagesJson);
  }
}
