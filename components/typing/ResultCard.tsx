'use client'

import { CPCT_QUALIFYING_NET_WPM } from '@/lib/typing/scoring'

export interface ResultCardProps {
  result: {
    cpct: {
      correctWords: number
      incorrectWords: number
      grossWords: number
      netWords: number
      grossWPM: number
      netWPM: number
      accuracy: number
    }
    score: {
      correctChars: number
      incorrectChars: number
      omittedChars: number
      extraChars: number
      elapsedSeconds: number
    }
  }
  language?: 'en' | 'hi'
  onRestart: () => void
}

export default function ResultCard({
  result,
  language = 'en',
  onRestart,
}: ResultCardProps) {
  const { cpct, score } = result
  const target =
    language === 'hi'
      ? CPCT_QUALIFYING_NET_WPM.hindi
      : CPCT_QUALIFYING_NET_WPM.english
  const passed = cpct.netWPM >= target

  return (
    <div className="mx-auto max-w-lg rounded-xl bg-white p-8 shadow-lg">
      <h2 className="mb-1 text-center text-2xl font-bold text-neutral-800">
        Test Result
      </h2>
      <p className="mb-6 text-center text-sm text-neutral-500">
        CPCT qualifying net speed ({language === 'hi' ? 'Hindi' : 'English'}):{' '}
        {target} WPM
      </p>

      <div className="mb-6 grid grid-cols-2 gap-4">
        <Stat label="Net WPM (official)" value={cpct.netWPM} tone={passed ? 'good' : 'bad'} big />
        <Stat label="Accuracy" value={`${cpct.accuracy}%`} tone="info" big />
        <Stat label="Gross WPM" value={cpct.grossWPM} tone="neutral" />
        <Stat label="Incorrect words" value={cpct.incorrectWords} tone="bad" />
      </div>

      <dl className="mb-6 space-y-1 text-sm text-neutral-600">
        <Row label="Correct words" value={cpct.correctWords} />
        <Row label="Gross words (typed)" value={cpct.grossWords} />
        <Row label="Correct characters" value={score.correctChars} />
        <Row label="Wrong characters" value={score.incorrectChars} />
        <Row label="Not reached" value={score.omittedChars} />
        <Row label="Time taken" value={`${score.elapsedSeconds}s`} />
      </dl>

      <p className={`mb-6 rounded-md p-3 text-center text-sm ${passed ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'}`}>
        {passed
          ? `Above the ${target} WPM qualifying mark.`
          : `${(target - cpct.netWPM).toFixed(0)} WPM short of the ${target} WPM qualifying mark.`}
      </p>
      <p className="mb-6 text-center text-xs text-neutral-400">
        Net WPM per CPCT&rsquo;s official word-based formula (correct words / minute) — not a character-level estimate.
      </p>

      <button onClick={onRestart} className="w-full rounded-lg bg-emerald-600 py-3 text-white transition hover:bg-emerald-700">
        Try Again
      </button>
    </div>
  )
}

function Stat({ label, value, tone, big }: { label: string; value: string | number; tone: 'good' | 'bad' | 'info' | 'neutral'; big?: boolean }) {
  const tones = { good: 'bg-emerald-50 text-emerald-700', bad: 'bg-red-50 text-red-600', info: 'bg-blue-50 text-blue-600', neutral: 'bg-neutral-100 text-neutral-700' }
  return (
    <div className={`rounded-lg p-4 ${tones[tone]}`}>
      <div className="text-xs text-neutral-500">{label}</div>
      <div className={`font-bold tabular-nums ${big ? 'text-3xl' : 'text-2xl'}`}>{value}</div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between">
      <dt>{label}</dt>
      <dd className="tabular-nums font-medium text-neutral-800">{value}</dd>
    </div>
  )
}