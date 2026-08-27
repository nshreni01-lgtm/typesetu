/**
 * Grapheme-cluster utilities.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * Devanagari is not one-code-point-per-visible-character.
 *   "कि"   = U+0915 (क) + U+093F (ि)          -> 2 code points, 1 visible letter
 *   "क्षि" = U+0915 U+094D U+0937 U+093F      -> 4 code points, 1 visible letter
 *
 * The old engine did `passage.split('')` and compared / rendered per UTF-16 unit.
 * That is wrong twice over:
 *   1. Accuracy: one mistyped matra counted as several errors.
 *   2. Rendering: each code point landed in its own <span>, which breaks the
 *      font shaper. A lone U+093F in its own inline box renders as a dotted
 *      circle (◌ि) instead of joining leftwards onto its consonant.
 *
 * Everything downstream (compare, highlight, WPM) must work on clusters.
 */

const DEVANAGARI_VIRAMA = 0x094d

/** Combining marks / matras / signs that attach to a preceding base. */
function isDevanagariCombining(cp: number): boolean {
  return (
    (cp >= 0x0900 && cp <= 0x0903) || // inverted candrabindu, candrabindu, anusvara, visarga
    (cp >= 0x093a && cp <= 0x094f) || // matras + virama
    (cp >= 0x0951 && cp <= 0x0957) || // accents, additional marks
    (cp >= 0x0962 && cp <= 0x0963) || // vocalic l/ll matras
    cp === 0x200c || // ZWNJ
    cp === 0x200d // ZWJ
  )
}

/** Generic combining mark, for non-Devanagari fallback (accents etc). */
function isGenericCombining(cp: number): boolean {
  return (
    (cp >= 0x0300 && cp <= 0x036f) ||
    (cp >= 0x1ab0 && cp <= 0x1aff) ||
    (cp >= 0x20d0 && cp <= 0x20ff) ||
    (cp >= 0xfe20 && cp <= 0xfe2f)
  )
}

/**
 * Manual clusterer. Used when Intl.Segmenter is unavailable.
 * Handles the two cases that matter for Devanagari typing tests:
 *  - base + any number of combining marks/matras
 *  - virama-joined conjuncts (क + ् + ष  stays one cluster)
 */
function segmentManual(text: string): string[] {
  const out: string[] = []
  const cps = Array.from(text)
  let i = 0

  while (i < cps.length) {
    let cluster = cps[i]
    i++

    while (i < cps.length) {
      const cp = cps[i].codePointAt(0)!
      const endsWithVirama =
        Array.from(cluster).pop()!.codePointAt(0) === DEVANAGARI_VIRAMA

      if (isDevanagariCombining(cp) || isGenericCombining(cp)) {
        cluster += cps[i]
        i++
        continue
      }

      // After a virama, the next consonant belongs to the same conjunct.
      if (endsWithVirama && cp >= 0x0900 && cp <= 0x097f) {
        cluster += cps[i]
        i++
        continue
      }

      break
    }

    out.push(cluster)
  }

  return out
}

let cachedSegmenter: Intl.Segmenter | null | undefined

function getSegmenter(): Intl.Segmenter | null {
  if (cachedSegmenter !== undefined) return cachedSegmenter
  try {
    cachedSegmenter =
      typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function'
        ? new Intl.Segmenter('hi', { granularity: 'grapheme' })
        : null
  } catch {
    cachedSegmenter = null
  }
  return cachedSegmenter
}

/** Split text into user-perceived characters (grapheme clusters). */
export function toGraphemes(text: string): string[] {
  if (!text) return []
  const seg = getSegmenter()
  if (seg) {
    const out: string[] = []
    for (const { segment } of seg.segment(text)) out.push(segment)
    return out
  }
  return segmentManual(text)
}

export type CharStatus = 'correct' | 'incorrect' | 'current' | 'untyped'

export interface ComparisonCell {
  expected: string
  typed?: string
  status: CharStatus
}

/**
 * Positional comparison, cluster by cluster.
 * Deliberately positional (not diff-based) because government typing tests
 * score against a fixed passage position, not against a best-fit alignment.
 */
export function compareGraphemes(
  expected: string[],
  typed: string[]
): ComparisonCell[] {
  return expected.map((exp, i) => {
    if (i < typed.length) {
      return {
        expected: exp,
        typed: typed[i],
        status: typed[i] === exp ? ('correct' as const) : ('incorrect' as const),
      }
    }
    return {
      expected: exp,
      status: i === typed.length ? ('current' as const) : ('untyped' as const),
    }
  })
}

export interface ClusterStats {
  correct: number
  incorrect: number
  /** Clusters in the passage the typist never reached. */
  omitted: number
  /** Clusters typed past the end of the passage. */
  extra: number
  typedTotal: number
}

export function getClusterStats(
  expected: string[],
  typed: string[]
): ClusterStats {
  let correct = 0
  let incorrect = 0

  const overlap = Math.min(expected.length, typed.length)
  for (let i = 0; i < overlap; i++) {
    if (typed[i] === expected[i]) correct++
    else incorrect++
  }

  return {
    correct,
    incorrect,
    omitted: Math.max(0, expected.length - typed.length),
    extra: Math.max(0, typed.length - expected.length),
    typedTotal: typed.length,
  }
}
