/**
 * Hindi Remington GAIL keyboard mapping + input engine.
 *
 * ============================================================================
 * READ THIS BEFORE TRUSTING THE TABLE AT THE BOTTOM
 * ============================================================================
 *
 * Two SEPARATE things get confused constantly, and the master blueprint
 * conflated them (blueprint section 4.4 vs section 6):
 *
 *   (a) UNICODE STORAGE ORDER is logical: क then ि  ->  U+0915 U+093F
 *       The font shaper draws ि to the LEFT of क on its own. No reordering
 *       code is needed to make it *look* right. The blueprint is correct here.
 *
 *   (b) KEYSTROKE ORDER on Remington is VISUAL: the typist presses the ि key
 *       FIRST, then the consonant key. Remington is a mechanical-typewriter
 *       layout; on a typewriter the ि glyph was struck before the consonant
 *       because that is where it sits on the paper. Every Remington-to-Unicode
 *       IME preserves that muscle memory and reorders internally.
 *
 * The blueprint concluded from (a) that no reorder buffer is needed. That
 * conclusion does not follow: (a) is about rendering, (b) is about input.
 * If we map keystrokes 1:1 in the order pressed, a real Remington typist
 * pressing [ि][क] produces "ि" + "क" = "िक", which shapes as a dotted-circle
 * matra followed by क — visibly wrong, and it would fail every passage.
 *
 * So: a small reorder buffer IS required. It is implemented below and it is
 * about 15 lines, not the "complex buffer logic" the blueprint feared.
 *
 * ि (U+093F) is the ONLY pre-base matra in Devanagari, so this is the only
 * reordering case. Everything else appends in the order pressed.
 * ============================================================================
 */

export type KeyKind =
  | 'consonant'
  | 'vowel'
  | 'prebase-matra' // ि only
  | 'matra'
  | 'virama'
  | 'sign'
  | 'other'

export interface KeyDef {
  out: string
  kind: KeyKind
}

export const VIRAMA = '्'
export const I_MATRA = 'ि'

/** Classify an output string so the reorder engine knows what to do with it. */
export function classify(out: string): KeyKind {
  if (out === I_MATRA) return 'prebase-matra'
  if (out === VIRAMA) return 'virama'
  const cp = out.codePointAt(0)!
  if (cp >= 0x0915 && cp <= 0x0939) return 'consonant'
  if (cp >= 0x0958 && cp <= 0x095f) return 'consonant'
  if (cp >= 0x0905 && cp <= 0x0914) return 'vowel'
  if (cp >= 0x093e && cp <= 0x094c) return 'matra'
  if (cp >= 0x0900 && cp <= 0x0903) return 'sign'
  return 'other'
}

/**
 * ============================================================================
 * KEYMAP TABLE — STATUS: **UNVERIFIED / INCOMPLETE ON PURPOSE**
 * ============================================================================
 * Only entries that are consistent across the published Remington GAIL charts
 * are filled in. The rest are intentionally blank rather than guessed.
 *
 * A wrong mapping here is worse than a missing one: a student would drill
 * wrong muscle memory for months and then fail the real exam. That is exactly
 * the risk the blueprint flagged in section 6, so this file will not pretend
 * to knowledge it does not have.
 *
 * TO COMPLETE: fill `unshifted` and `shifted` from an authoritative chart
 * (the GAIL/Rajbhasha Mangal Remington chart, or Keyman's hin-remington .kmn
 * source). Then flip KEYMAP_VERIFIED to true. The audit view at /keymap-audit
 * renders every position so it can be diffed against the chart in one pass.
 *
 * Until KEYMAP_VERIFIED is true the UI shows a "beta mapping" banner and
 * recommends OS-IME passthrough mode instead (see TypingEngine).
 */
export const KEYMAP_VERIFIED = false

/** Physical key (event.key, unshifted form) -> Devanagari output. */
export const unshifted: Record<string, string> = {
  d: 'क',
  f: I_MATRA,
}

/** Physical key with Shift held -> Devanagari output. */
export const shifted: Record<string, string> = {}

/** Keys that pass straight through untouched in Hindi mode. */
const PASSTHROUGH = new Set([' ', '\n', '\t'])

export function lookup(key: string, shift: boolean): string | null {
  if (PASSTHROUGH.has(key)) return key
  const table = shift ? shifted : unshifted
  const direct = table[key]
  if (direct) return direct
  // Shift+<key> with no shifted entry falls back to the unshifted mapping so a
  // stray Shift does not silently swallow the keystroke.
  if (shift && unshifted[key.toLowerCase()]) return unshifted[key.toLowerCase()]
  return null
}

export function isMapped(key: string, shift: boolean): boolean {
  return lookup(key, shift) !== null
}

/** How many of the 47 typeable key positions are filled, for the audit view. */
export function keymapCoverage() {
  const positions = 'qwertyuiop[]asdfghjkl;\'zxcvbnm,./1234567890-='.split('')
  const filledUnshifted = positions.filter((k) => unshifted[k]).length
  const filledShifted = positions.filter((k) => shifted[k]).length
  return {
    total: positions.length,
    filledUnshifted,
    filledShifted,
    missing: positions.filter((k) => !unshifted[k]),
  }
}

/**
 * ============================================================================
 * REORDER ENGINE
 * ============================================================================
 * Pure function: a list of emitted Devanagari pieces (in the order the typist
 * pressed them) -> the correctly ordered Unicode string.
 *
 * Being pure and recomputed from scratch on every keystroke is what makes
 * Backspace correct for free: pop one keystroke, re-run. No mutable buffer to
 * get out of sync, which is where hand-rolled IMEs usually break.
 *
 * Rule: hold a pre-base matra (ि) aside. Emit it after the consonant cluster
 * that follows. A cluster keeps growing while viramas keep arriving, so
 * क + ् + ष + [pending ि] correctly yields क्षि and not क्िष.
 */
export function transliterate(pieces: string[]): string {
  let out = ''
  let pending: string | null = null
  // Length of a pre-base matra we already appended, in case a virama arrives
  // next and reveals the cluster was not finished after all.
  let provisional = 0

  for (const piece of pieces) {
    const kind = classify(piece)

    if (kind === 'prebase-matra') {
      // A second ि before any consonant replaces the first; that is what a
      // real IME does with a repeated dead-key press.
      pending = piece
      provisional = 0
      continue
    }

    if (kind === 'virama') {
      if (provisional > 0) {
        // Pull the matra back out; the conjunct is still being built.
        pending = out.slice(out.length - provisional)
        out = out.slice(0, out.length - provisional)
        provisional = 0
      }
      out += piece
      continue
    }

    if (kind === 'consonant') {
      out += piece
      if (pending) {
        out += pending
        provisional = pending.length
        pending = null
      } else {
        provisional = 0
      }
      continue
    }

    // Vowels, post-base matras, signs, spaces, punctuation.
    if (pending) {
      // ि with no consonant after it. Emit it so the typist sees the mistake
      // (it will shape as a dotted circle) rather than silently losing a key.
      out += pending
      pending = null
    }
    out += piece
    provisional = 0
  }

  if (pending) out += pending
  return out
}

/** Map a raw keydown to a Devanagari piece, or null if the key is unmapped. */
export function keyToPiece(key: string, shift: boolean): string | null {
  return lookup(key, shift)
}

/** True if a character is already Devanagari (i.e. an OS IME produced it). */
export function isDevanagari(ch: string): boolean {
  const cp = ch.codePointAt(0)
  if (cp === undefined) return false
  return (cp >= 0x0900 && cp <= 0x097f) || (cp >= 0xa8e0 && cp <= 0xa8ff)
}
