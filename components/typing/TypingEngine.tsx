'use client'

/**
 * TypingEngine — merged: English + Hindi (Remington GAIL) + Backspace toggle
 * + Blind Mode.
 *
 * Design notes worth knowing before editing:
 *
 * 1. RENDERING IS PER GRAPHEME CLUSTER, NOT PER CHARACTER.
 *    The previous version did passage.split('') and put every UTF-16 unit in
 *    its own <span>. For Devanagari that puts a matra in a separate inline box
 *    from its consonant, which breaks font shaping — "कि" renders as क followed
 *    by a dotted-circle ि. Clusters keep each syllable inside one span.
 *
 * 2. HINDI HAS TWO INPUT PATHS, and 'ime' is the default.
 *    - 'ime': the OS Remington GAIL IME is active and hands us finished
 *      Devanagari. This is exactly what the real CPCT/SSC exam machine does,
 *      so it is the exam-accurate path and needs no keymap of our own.
 *    - 'builtin': we intercept raw QWERTY keydowns and map them ourselves, for
 *      users who have no IME installed. Depends on the keymap table, which is
 *      currently UNVERIFIED — hence not the default.
 *
 * 3. TIMER IS TIMESTAMP-BASED. The old setInterval-with-timeLeft-dependency
 *    rebuilt the interval every tick and drifted; elapsed time fed the WPM
 *    formula, so drift became score error.
 *
 * 4. SCORING IS TWO-TRACK.
 *    - calculateScore() is character/grapheme-level — drives the live
 *      green/red highlighting only. Practice feedback, not the scorecard.
 *    - calculateCPCTWordScore() is the official CPCT word-based formula
 *      (see lib/typing/scoring.ts) — this is what onComplete's `cpct` field
 *      carries, and what should decide pass/fail.
 */

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type ChangeEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react'
import {
  keyToPiece,
  transliterate,
  KEYMAP_VERIFIED,
  isDevanagari,
} from '@/lib/keymaps/remington-gail'
import { toGraphemes, compareGraphemes } from '@/lib/typing/graphemes'
import {
  calculateScore,
  calculateCPCTWordScore,
  type Score,
  type CPCTWordScore,
} from '@/lib/typing/scoring'

export type TypingLanguage = 'en' | 'hi'
export type HindiInputMode = 'ime' | 'builtin'

export interface TypingEngineProps {
  passage: string
  duration?: number
  language?: TypingLanguage
  /** false = Backspace and Delete are blocked, like a strict exam. */
  allowBackspace?: boolean
  /** true = typed text is masked so the typist cannot proofread. */
  blindMode?: boolean
  hindiInputMode?: HindiInputMode
  /**
   * `score` is the character/grapheme-level breakdown (drives the live
   * green/red highlighting). `cpct` is the official word-based CPCT
   * scorecard formula (see lib/typing/scoring.ts) — use `cpct.netWPM` and
   * `cpct.accuracy` for pass/fail, not the character-level numbers.
   */
  onComplete?: (result: {
    score: Score
    cpct: CPCTWordScore
    typedText: string
  }) => void
}

export default function TypingEngine({
  passage,
  duration = 60,
  language = 'en',
  allowBackspace = true,
  blindMode = false,
  hindiInputMode = 'ime',
  onComplete,
}: TypingEngineProps) {
  const useBuiltinMap = language === 'hi' && hindiInputMode === 'builtin'

  const [pieces, setPieces] = useState<string[]>([])
  const [directText, setDirectText] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [sawLatinInImeMode, setSawLatinInImeMode] = useState(false)

  const startedAtRef = useRef<number | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const finishedRef = useRef(false)

  const typedText = useBuiltinMap ? transliterate(pieces) : directText

  const expectedClusters = useMemo(() => toGraphemes(passage), [passage])
  const typedClusters = useMemo(() => toGraphemes(typedText), [typedText])

  const timeLeft = Math.max(0, duration - elapsed)

  const finish = useCallback(
    (finalTyped: string, seconds: number) => {
      if (finishedRef.current) return
      finishedRef.current = true
      setIsFinished(true)
      setIsRunning(false)

      const elapsedSeconds = Math.max(1, Math.round(seconds))
      const score = calculateScore({
        expected: expectedClusters,
        typed: toGraphemes(finalTyped),
        elapsedSeconds,
      })
      const cpct = calculateCPCTWordScore({
        expected: passage,
        typed: finalTyped,
        elapsedSeconds,
      })
      onComplete?.({ score, cpct, typedText: finalTyped })
    },
    [expectedClusters, passage, onComplete]
  )

  // Timestamp-based timer: no drift, and elapsed is trustworthy for scoring.
  useEffect(() => {
    if (!isRunning || isFinished) return
    const id = setInterval(() => {
      const started = startedAtRef.current
      if (started == null) return
      setElapsed((Date.now() - started) / 1000)
    }, 100)
    return () => clearInterval(id)
  }, [isRunning, isFinished])

  useEffect(() => {
    if (isRunning && !isFinished && elapsed >= duration) {
      finish(typedText, duration)
    }
  }, [elapsed, duration, isRunning, isFinished, typedText, finish])

  const startIfNeeded = useCallback(() => {
    if (startedAtRef.current == null) {
      startedAtRef.current = Date.now()
      setIsRunning(true)
    }
  }, [])

  const currentSeconds = () =>
    startedAtRef.current == null
      ? 0
      : (Date.now() - startedAtRef.current) / 1000

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (isFinished) {
      e.preventDefault()
      return
    }

    // While an OS IME is mid-composition, never touch the event. Intercepting
    // here is the classic way to break Indic and CJK input.
    if (e.nativeEvent.isComposing) return

    const isErase = e.key === 'Backspace' || e.key === 'Delete'

    if (isErase && !allowBackspace) {
      e.preventDefault()
      return
    }

    if (useBuiltinMap) {
      if (e.ctrlKey || e.metaKey || e.altKey) return

      if (e.key === 'Backspace') {
        e.preventDefault()
        setPieces((prev) => prev.slice(0, -1))
        return
      }

      if (e.key.length === 1) {
        e.preventDefault()
        const piece = keyToPiece(e.key.toLowerCase(), e.shiftKey)
        if (piece === null) return // unmapped key: ignore, do not insert Latin
        startIfNeeded()
        setPieces((prev) => {
          const next = [...prev, piece]
          if (toGraphemes(transliterate(next)).length > expectedClusters.length) {
            return prev
          }
          return next
        })
        return
      }

      if (e.key === 'Enter') {
        e.preventDefault()
        startIfNeeded()
        setPieces((prev) => [...prev, '\n'])
      }
      return
    }

    // Direct / IME passthrough path.
    if (e.key.length === 1) {
      startIfNeeded()
      if (language === 'hi' && !isDevanagari(e.key) && /[a-zA-Z]/.test(e.key)) {
        setSawLatinInImeMode(true)
      }
    }
  }

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (isFinished || useBuiltinMap) return
    const value = e.target.value

    // Block deletions when Backspace is disallowed. Needed in addition to the
    // keydown guard because IMEs, paste and drag can shorten the value too.
    if (!allowBackspace && value.length < directText.length) return

    if (toGraphemes(value).length > expectedClusters.length) return

    startIfNeeded()
    setDirectText(value)
  }

  // Passage completed -> finish immediately.
  useEffect(() => {
    if (
      isRunning &&
      !isFinished &&
      expectedClusters.length > 0 &&
      typedClusters.length === expectedClusters.length
    ) {
      finish(typedText, currentSeconds())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typedClusters.length, expectedClusters.length, isRunning, isFinished])

  const handleRestart = () => {
    finishedRef.current = false
    startedAtRef.current = null
    setPieces([])
    setDirectText('')
    setElapsed(0)
    setIsRunning(false)
    setIsFinished(false)
    setSawLatinInImeMode(false)
    inputRef.current?.focus()
  }

  const live = useMemo(
    () =>
      calculateScore({
        expected: expectedClusters,
        typed: typedClusters,
        elapsedSeconds: Math.max(1, elapsed),
      }),
    [expectedClusters, typedClusters, elapsed]
  )

  const cells = useMemo(
    () => compareGraphemes(expectedClusters, typedClusters),
    [expectedClusters, typedClusters]
  )

  const cellClass = (status: string) => {
    // In blind mode the passage must not reveal correctness, otherwise it is
    // not blind — the typist would proofread off the colours.
    if (blindMode) {
      return status === 'current'
        ? 'bg-neutral-300 text-neutral-900 rounded'
        : 'text-neutral-500'
    }
    switch (status) {
      case 'correct':
        return 'text-emerald-700 bg-emerald-50'
      case 'incorrect':
        return 'text-red-700 bg-red-100'
      case 'current':
        return 'bg-neutral-300 text-neutral-900 rounded'
      default:
        return 'text-neutral-400'
    }
  }

  const hindiFont = language === 'hi' ? 'font-devanagari' : 'font-mono'

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Status bar */}
      <div className="flex flex-wrap gap-4 justify-between items-center mb-4 text-sm">
        <div className="font-semibold">
          Time{' '}
          <span
            className={
              timeLeft <= 10 ? 'text-red-600 tabular-nums' : 'tabular-nums'
            }
          >
            {Math.ceil(timeLeft)}s
          </span>
        </div>
        <div className="tabular-nums">Gross {live.grossWPM} WPM</div>
        <div className="tabular-nums">Net {live.netWPM} WPM</div>
        <div className="tabular-nums">
          Accuracy{' '}
          <span
            className={live.accuracy >= 90 ? 'text-emerald-700' : 'text-amber-600'}
          >
            {live.accuracy}%
          </span>
        </div>
        <div className="flex gap-2 text-xs">
          <Badge on={language === 'hi'}>
            {language === 'hi' ? 'हिन्दी' : 'English'}
          </Badge>
          <Badge on={!allowBackspace}>
            {allowBackspace ? 'Backspace on' : 'Backspace off'}
          </Badge>
          <Badge on={blindMode}>{blindMode ? 'Blind mode' : 'Visible'}</Badge>
        </div>
      </div>

      {/* Warnings */}
      {useBuiltinMap && !KEYMAP_VERIFIED && (
        <p className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          Built-in Remington GAIL mapping is <strong>unverified and
          incomplete</strong>. Do not drill on it yet — unmapped keys are
          ignored. For exam-accurate Hindi practice, install the Remington GAIL
          IME and switch this to IME mode.
        </p>
      )}
      {language === 'hi' && !useBuiltinMap && sawLatinInImeMode && (
        <p className="mb-4 rounded-md border border-sky-300 bg-sky-50 p-3 text-sm text-sky-900">
          Latin characters are arriving, so no Hindi IME looks active. Switch
          your keyboard to Remington GAIL, or use the built-in mapping.
        </p>
      )}

      {/* Passage, rendered one grapheme cluster per span */}
      <div
        className={`mb-4 rounded-lg bg-neutral-100 p-6 text-xl leading-loose whitespace-pre-wrap ${hindiFont}`}
      >
        {cells.map((cell, i) => (
          <span key={i} className={cellClass(cell.status)}>
            {cell.expected}
          </span>
        ))}
      </div>

      {/* Input */}
      <label htmlFor="typing-input" className="sr-only">
        Typing input area
      </label>
      <textarea
        id="typing-input"
        ref={inputRef}
        value={typedText}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={(e) => e.preventDefault()}
        disabled={isFinished}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        lang={language === 'hi' ? 'hi' : 'en'}
        aria-describedby="typing-hint"
        placeholder={
          blindMode
            ? 'Blind mode — your text is hidden'
            : language === 'hi'
              ? 'यहाँ टाइप करें…'
              : 'Start typing here…'
        }
        className={`h-40 w-full rounded-lg border-2 border-neutral-300 p-4 text-xl focus:border-emerald-500 focus:outline-none disabled:bg-neutral-50 ${hindiFont} ${
          blindMode ? 'text-transparent caret-neutral-900 selection:bg-transparent' : ''
        }`}
      />
      <p id="typing-hint" className="mt-2 text-xs text-neutral-500">
        {allowBackspace
          ? 'Backspace allowed.'
          : 'Backspace disabled — mistakes stay in, as in the real exam.'}
        {blindMode && ' Typed text is hidden and error colours are suppressed.'}
      </p>

      {isFinished && (
        <div className="mt-6 text-center">
          <button
            onClick={handleRestart}
            className="rounded-lg bg-emerald-600 px-6 py-3 text-white hover:bg-emerald-700"
          >
            Restart
          </button>
        </div>
      )}
    </div>
  )
}

function Badge({
  on,
  children,
}: {
  on: boolean
  children: ReactNode
}) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 ${
        on
          ? 'bg-emerald-100 text-emerald-800'
          : 'bg-neutral-200 text-neutral-600'
      }`}
    >
      {children}
    </span>
  )
}