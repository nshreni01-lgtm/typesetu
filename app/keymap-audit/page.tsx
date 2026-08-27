'use client'

/**
 * Keymap audit view — /keymap-audit
 *
 * Purpose: make verifying the Remington GAIL table a five-minute eyeball job
 * instead of a research project. Every typeable key position is rendered, with
 * blanks shown in red. Open an authoritative chart next to this page, diff, fill
 * in lib/keymaps/remington-gail.ts, then set KEYMAP_VERIFIED = true.
 *
 * The reorder self-checks at the bottom are the important part: they assert the
 * pre-base ि behaviour that the master blueprint got wrong.
 */

import {
  unshifted,
  shifted,
  keymapCoverage,
  transliterate,
  KEYMAP_VERIFIED,
  I_MATRA,
  VIRAMA,
} from '@/lib/keymaps/remington-gail'
import { toGraphemes } from '@/lib/typing/graphemes'

const ROWS = [
  '1234567890-='.split(''),
  'qwertyuiop[]'.split(''),
  "asdfghjkl;'".split(''),
  'zxcvbnm,./'.split(''),
]

interface Check {
  name: string
  pieces: string[]
  expected: string
}

const CHECKS: Check[] = [
  {
    name: 'pre-base matra reorders: [ि][क] -> कि',
    pieces: [I_MATRA, 'क'],
    expected: 'कि',
  },
  {
    name: 'conjunct keeps matra last: [ि][क][्][ष] -> क्षि',
    pieces: [I_MATRA, 'क', VIRAMA, 'ष'],
    expected: 'क्षि',
  },
  {
    name: 'post-base matra is untouched: [क][ा] -> का',
    pieces: ['क', 'ा'],
    expected: 'का',
  },
  {
    name: 'anusvara after reordered matra: [ि][क][ं] -> किं',
    pieces: [I_MATRA, 'क', 'ं'],
    expected: 'किं',
  },
  {
    name: 'two words: [ि][क][space][क][ा] -> कि का',
    pieces: [I_MATRA, 'क', ' ', 'क', 'ा'],
    expected: 'कि का',
  },
  {
    name: 'orphan matra is not swallowed: [ि][space] -> ि+space',
    pieces: [I_MATRA, ' '],
    expected: I_MATRA + ' ',
  },
]

function codePoints(s: string) {
  return Array.from(s)
    .map((c) => 'U+' + c.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0'))
    .join(' ')
}

export default function KeymapAudit() {
  const coverage = keymapCoverage()
  const results = CHECKS.map((c) => {
    const actual = transliterate(c.pieces)
    return { ...c, actual, pass: actual === c.expected }
  })
  const allPass = results.every((r) => r.pass)

  return (
    <main className="mx-auto max-w-5xl p-8 font-sans">
      <h1 className="text-2xl font-bold">Remington GAIL keymap audit</h1>

      <p
        className={`mt-4 rounded-md p-3 text-sm ${
          KEYMAP_VERIFIED
            ? 'bg-emerald-50 text-emerald-900'
            : 'bg-amber-50 text-amber-900'
        }`}
      >
        Table status: <strong>{KEYMAP_VERIFIED ? 'verified' : 'UNVERIFIED'}</strong>
        {' — '}
        {coverage.filledUnshifted}/{coverage.total} unshifted and{' '}
        {coverage.filledShifted}/{coverage.total} shifted positions filled.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Key positions</h2>
      <div className="mt-3 space-y-2">
        {ROWS.map((row, ri) => (
          <div key={ri} className="flex gap-2">
            {row.map((k) => {
              const u = unshifted[k]
              const s = shifted[k]
              return (
                <div
                  key={k}
                  className={`w-16 rounded border p-2 text-center ${
                    u ? 'border-neutral-300' : 'border-red-300 bg-red-50'
                  }`}
                >
                  <div className="text-[10px] uppercase text-neutral-400">{k}</div>
                  <div className="font-devanagari text-xl leading-tight">
                    {u ?? '—'}
                  </div>
                  <div className="font-devanagari text-sm text-neutral-500">
                    {s ?? '—'}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-semibold">
        Reorder self-checks{' '}
        <span className={allPass ? 'text-emerald-700' : 'text-red-700'}>
          {allPass ? 'all passing' : 'FAILING'}
        </span>
      </h2>
      <table className="mt-3 w-full text-sm">
        <thead className="text-left text-neutral-500">
          <tr>
            <th className="py-2">Check</th>
            <th className="py-2">Output</th>
            <th className="py-2">Code points</th>
            <th className="py-2">Clusters</th>
            <th className="py-2">Result</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => (
            <tr key={r.name} className="border-t border-neutral-200">
              <td className="py-2 pr-4">{r.name}</td>
              <td className="py-2 pr-4 font-devanagari text-xl">{r.actual}</td>
              <td className="py-2 pr-4 font-mono text-xs text-neutral-500">
                {codePoints(r.actual)}
              </td>
              <td className="py-2 pr-4 tabular-nums">
                {toGraphemes(r.actual).length}
              </td>
              <td
                className={`py-2 font-semibold ${
                  r.pass ? 'text-emerald-700' : 'text-red-700'
                }`}
              >
                {r.pass ? 'PASS' : `FAIL (wanted ${r.expected})`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="mt-10 text-lg font-semibold">Shaping check</h2>
      <p className="mt-2 text-sm text-neutral-600">
        Each cluster below sits in its own span, the way the passage renders. If
        any matra shows a dotted circle (◌) or drifts to the wrong side, cluster
        segmentation is broken.
      </p>
      <div className="mt-3 rounded-lg bg-neutral-100 p-6 font-devanagari text-3xl">
        {toGraphemes('कि की क्षि र्कि किं नहीं द्ध त्र').map((g, i) => (
          <span key={i} className="mx-0.5 bg-emerald-50">
            {g}
          </span>
        ))}
      </div>
    </main>
  )
}
