/**
 * Typing scores.
 *
 * Two scoring systems live here:
 *  - calculateScore()        -> character/grapheme-level. Drives live
 *                                green/red highlighting. Practice feedback,
 *                                NOT the official scorecard number.
 *  - calculateCPCTWordScore() -> official CPCT word-based formula. THIS is
 *                                what should decide pass/fail and headline
 *                                Net WPM.
 */

import { getClusterStats } from './graphemes'

export const CHARS_PER_WORD = 5

export interface ScoreInput {
  expected: string[]
  typed: string[]
  elapsedSeconds: number
}

export interface Score {
  grossWPM: number
  netWPM: number
  accuracy: number
  correctChars: number
  incorrectChars: number
  omittedChars: number
  extraChars: number
  typedChars: number
  errors: number
  elapsedSeconds: number
}

function round1(n: number): number {
  return Math.round(n * 10) / 10
}

export function calculateScore({
  expected,
  typed,
  elapsedSeconds,
}: ScoreInput): Score {
  const stats = getClusterStats(expected, typed)
  const minutes = Math.max(elapsedSeconds, 1) / 60

  const errors = stats.incorrect + stats.extra
  const grossWPM = stats.typedTotal / CHARS_PER_WORD / minutes
  const netWPM = Math.max(0, grossWPM - errors / minutes)
  const accuracy =
    stats.typedTotal > 0 ? (stats.correct / stats.typedTotal) * 100 : 100

  return {
    grossWPM: Math.round(grossWPM),
    netWPM: Math.round(netWPM),
    accuracy: round1(accuracy),
    correctChars: stats.correct,
    incorrectChars: stats.incorrect,
    omittedChars: stats.omitted,
    extraChars: stats.extra,
    typedChars: stats.typedTotal,
    errors,
    elapsedSeconds,
  }
}

/**
 * ============================================================================
 * OFFICIAL CPCT FORMULA — read directly from cpct.mp.gov.in's own published
 * "CPCT_Assessment_Formula.PDF". CPCT does NOT use a Full/Half Mistake
 * weighted deduction — that scheme belongs to other exams (UP Police,
 * RSMSSB), not CPCT. Several typing-practice sites mix the two up.
 *
 * Quoted from the official PDF, "Formula for Unrestricted Type" (CPCT uses
 * Unrestricted type — backspace/editing allowed):
 *   Gross Words (GW)           = Correct + Incorrect Words
 *   Gross Words per Minute     = GW / TimeTaken (minutes)
 *   Net Words (NW)             = Correct words typed
 *   Net Words per Minute       = NW / TimeTaken (minutes)   <- scorecard result
 *   Accuracy %                 = NWPM * 100 / GWPM
 *
 * Unit is the WORD (text split on the space character) — a word is either
 * fully correct or fully incorrect, no partial credit. Incorrect words are
 * simply excluded from Net Words; there is no extra penalty weighting.
 * ============================================================================
 */

export function toWords(text: string): string[] {
  return text.split(' ').filter((w) => w.length > 0)
}

export interface CPCTWordScoreInput {
  expected: string
  typed: string
  elapsedSeconds: number
}

export interface CPCTWordScore {
  correctWords: number
  incorrectWords: number
  grossWords: number
  netWords: number
  grossWPM: number
  netWPM: number
  accuracy: number
}

export function calculateCPCTWordScore({
  expected,
  typed,
  elapsedSeconds,
}: CPCTWordScoreInput): CPCTWordScore {
  const expectedWords = toWords(expected)
  const typedWords = toWords(typed)
  const minutes = Math.max(elapsedSeconds, 1) / 60

  let correctWords = 0
  let incorrectWords = 0
  for (let i = 0; i < typedWords.length; i++) {
    if (typedWords[i] === expectedWords[i]) correctWords++
    else incorrectWords++
  }

  const grossWords = correctWords + incorrectWords
  const netWords = correctWords
  const grossWPM = grossWords / minutes
  const netWPM = netWords / minutes
  const accuracy = grossWPM > 0 ? (netWPM * 100) / grossWPM : 100

  return {
    correctWords,
    incorrectWords,
    grossWords,
    netWords,
    grossWPM: Math.round(grossWPM),
    netWPM: Math.round(netWPM),
    accuracy: round1(accuracy),
  }
}

/** Official CPCT qualifying net speeds, from the published scorecard. */
export const CPCT_QUALIFYING_NET_WPM = {
  english: 30,
  hindi: 20,
} as const