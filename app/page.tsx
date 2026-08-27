'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { getCurrentUser, logout } from '@/lib/auth'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCurrentUser().then((u) => {
      setUser(u)
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })
  }, [])

  return (
    <div className="min-h-screen bg-white text-neutral-900 overflow-x-hidden">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            Type<span className="text-emerald-600">Setu</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#features" className="text-neutral-600 hover:text-emerald-600 transition">Features</a>
            <a href="#exams" className="text-neutral-600 hover:text-emerald-600 transition">Exams</a>
            <a href="#pricing" className="text-neutral-600 hover:text-emerald-600 transition">Pricing</a>
          </nav>

          <div className="flex items-center gap-3">
            {loading ? null : user ? (
              <>
                <Link
                  href="/practice"
                  className="text-sm font-medium text-neutral-600 hover:text-emerald-600"
                >
                  Practice
                </Link>
                <button
                  onClick={logout}
                  className="text-sm font-medium text-neutral-600 hover:text-red-600 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-neutral-600 hover:text-emerald-600 hidden sm:block">
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition shadow-sm"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/60 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Text */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white border border-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 shadow-sm">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Official Exam Rules Based
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-5">
                Clear Government<br />
                <span className="text-emerald-600">Typing Exams</span>
              </h1>

              <p className="text-base sm:text-lg text-neutral-600 mb-8 max-w-lg mx-auto lg:mx-0">
                Practice CPCT, SSC CHSL, SSC CGL, RRB and more with real exam rules, accurate scoring and Hindi + English support.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link
                  href="/practice"
                  className="bg-emerald-600 text-white px-7 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20 text-center"
                >
                  Start Free Practice
                </Link>
                <a
                  href="#features"
                  className="px-7 py-3 rounded-xl font-semibold border border-neutral-300 hover:bg-neutral-50 transition text-center"
                >
                  See Features
                </a>
              </div>
            </motion.div>

            {/* Right - Live Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="w-full"
            >
              <LiveTypingBox />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-neutral-200 bg-neutral-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '15+', label: 'Supported Exams' },
            { value: 'Hindi + Eng', label: 'Full Support' },
            { value: '100%', label: 'Exam Accurate' },
            { value: 'Free', label: 'To Start' },
          ].map((item) => (
            <div key={item.label}>
              <div className="text-3xl font-bold text-emerald-600">{item.value}</div>
              <div className="text-sm text-neutral-500 mt-1">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">Everything you need to clear the exam</h2>
          <p className="text-neutral-600 text-lg max-w-2xl mx-auto">
            Built specifically for Indian government typing tests — not generic typing sites.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard title="Real Exam Rules" description="Backspace on/off, Blind Mode, exact duration and official scoring used in CPCT & SSC." />
          <FeatureCard title="Hindi + English" description="Full support for Remington GAIL / Mangal layout with proper Devanagari rendering." />
          <FeatureCard title="Accurate Scoring" description="Net WPM calculated the same way official exams calculate it — no inflated scores." />
          <FeatureCard title="Live Feedback" description="Character-by-character highlighting so you instantly see where you went wrong." />
          <FeatureCard title="Multi Exam Support" description="Practice CPCT, SSC CHSL, SSC CGL, RRB NTPC and more state exams in one place." />
          <FeatureCard title="Progress Tracking" description="Save tests, track improvement and know exactly when you are exam-ready." />
        </div>
      </section>

      {/* Supported Exams */}
      <section id="exams" className="bg-neutral-50 border-y border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Supported Exams</h2>
            <p className="text-neutral-600 text-lg">One platform for multiple government typing tests</p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              'CPCT (Madhya Pradesh)',
              'SSC CHSL',
              'SSC CGL',
              'RRB NTPC',
              'UPSSSC',
              'High Court Typing',
              'State Secretariat Exams',
              'Banking Typing Tests',
              'More coming soon...',
            ].map((exam) => (
              <div
                key={exam}
                className="bg-white border border-neutral-200 rounded-xl px-5 py-4 text-center font-medium hover:border-emerald-300 transition"
              >
                {exam}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Coming Soon */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
        <div className="bg-neutral-900 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute top-5 right-5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full">
            Coming Soon
          </div>

          <h2 className="text-3xl font-bold text-white mb-4">Next-Gen AI Practice</h2>
          <p className="text-neutral-400 max-w-xl mx-auto mb-10">
            Advanced AI features to help you clear the exam faster and with more confidence.
          </p>

          <div className="grid sm:grid-cols-2 gap-5 text-left max-w-3xl mx-auto">
            <div className="bg-neutral-800/70 border border-neutral-700 rounded-2xl p-6">
              <h4 className="font-bold text-white mb-2">AI Weakness Detection</h4>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Identifies your slow keys and generates focused practice automatically.
              </p>
            </div>
            <div className="bg-neutral-800/70 border border-neutral-700 rounded-2xl p-6">
              <h4 className="font-bold text-white mb-2">Exam Pressure Mode</h4>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Simulates real exam hall conditions so you stay calm on the actual day.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-neutral-50 border-y border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Simple Pricing</h2>
            <p className="text-neutral-600 text-lg">Start free. Upgrade when you need more.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-8">
              <h3 className="text-xl font-bold mb-2">Free</h3>
              <div className="text-4xl font-bold mb-6">₹0</div>
              <ul className="space-y-3 mb-8 text-neutral-600">
                <li>✓ Limited practice tests</li>
                <li>✓ English + Hindi support</li>
                <li>✓ Basic results</li>
                <li>✓ Backspace & Blind mode</li>
              </ul>
              <Link
                href="/practice"
                className="block text-center border border-neutral-300 rounded-xl py-3 font-semibold hover:bg-neutral-50 transition"
              >
                Start Free
              </Link>
            </div>

            {/* Premium */}
            <div className="bg-emerald-600 text-white rounded-2xl p-8 relative">
              <div className="absolute top-4 right-4 bg-white/20 text-xs font-semibold px-3 py-1 rounded-full">
                Recommended
              </div>
              <h3 className="text-xl font-bold mb-2">Premium</h3>
              <div className="text-4xl font-bold mb-1">
                ₹149<span className="text-lg font-normal">/mo</span>
              </div>
              <p className="text-emerald-100 text-sm mb-6">or ₹999/year</p>
              <ul className="space-y-3 mb-8 text-emerald-50">
                <li>✓ Unlimited tests</li>
                <li>✓ All exams & passages</li>
                <li>✓ Detailed analysis</li>
                <li>✓ Progress tracking</li>
                <li>✓ Priority support</li>
              </ul>
              <button className="w-full bg-white text-emerald-700 rounded-xl py-3 font-semibold hover:bg-emerald-50 transition">
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-5">
          Ready to clear your typing exam?
        </h2>
        <p className="text-neutral-600 text-lg mb-8 max-w-xl mx-auto">
          Join students preparing for CPCT, SSC and other government exams with accurate practice.
        </p>
        <Link
          href="/practice"
          className="inline-block bg-emerald-600 text-white px-10 py-4 rounded-xl text-lg font-semibold hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20"
        >
          Start Practicing Now — It’s Free
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-neutral-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-lg font-bold">
            Type<span className="text-emerald-600">Setu</span>
          </div>
          <div className="text-sm text-neutral-500">
            © 2026 TypeSetu. Built for Indian students.
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-6 hover:border-emerald-300 hover:shadow-sm transition">
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-neutral-600 leading-relaxed text-sm">{description}</p>
    </div>
  )
}

/* ---------------- Live Mini Test ---------------- */

const SAMPLE = 'The quick brown fox jumps over the lazy dog. Practice daily to clear your typing exam.'
const DURATION = 20

function LiveTypingBox() {
  const [input, setInput] = useState('')
  const [timeLeft, setTimeLeft] = useState(DURATION)
  const [active, setActive] = useState(false)
  const [finished, setFinished] = useState(false)
  const [started, setStarted] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!active || timeLeft <= 0) return
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearInterval(id)
  }, [active, timeLeft])

  useEffect(() => {
    if (timeLeft === 0 && active) {
      setActive(false)
      setFinished(true)
    }
  }, [timeLeft, active])

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (finished) return
    const value = e.target.value
    if (!active && value.length > 0) setActive(true)
    setInput(value)
    if (value.length >= SAMPLE.length) {
      setActive(false)
      setFinished(true)
    }
  }

  const stats = () => {
    const spent = DURATION - timeLeft || 1
    const wpm = Math.round((input.length / 5 / spent) * 60)
    let correct = 0
    for (let i = 0; i < input.length; i++) {
      if (input[i] === SAMPLE[i]) correct++
    }
    const accuracy = input.length ? Math.round((correct / input.length) * 100) : 100
    return { wpm, accuracy }
  }

  const { wpm, accuracy } = stats()

  const reset = () => {
    setInput('')
    setTimeLeft(DURATION)
    setActive(false)
    setFinished(false)
    setStarted(false)
  }

  const begin = () => {
    setStarted(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-xl shadow-emerald-900/5 overflow-hidden w-full">
      {/* Header */}
      <div className="bg-neutral-50 border-b border-neutral-100 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
          <span className={`w-2 h-2 rounded-full ${active ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-300'}`} />
          Live 20s Mini-Test
        </div>
        <div className="flex gap-4 text-sm font-medium">
          <span className={timeLeft <= 5 ? 'text-red-500' : 'text-neutral-600'}>
            00:{timeLeft.toString().padStart(2, '0')}
          </span>
          <span className="text-emerald-600">{wpm} WPM</span>
        </div>
      </div>

      {/* Body */}
      <div className="relative h-[280px] p-5">
        {!started && !finished && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
            <button
              onClick={begin}
              className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20"
            >
              Start Typing Test
            </button>
            <p className="text-xs text-neutral-500 mt-3">Takes only 20 seconds</p>
          </div>
        )}

        {!finished ? (
          <>
            <div className="absolute inset-5 text-base font-mono leading-relaxed text-neutral-300 pointer-events-none select-none whitespace-pre-wrap">
              {SAMPLE}
            </div>
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInput}
              className={`absolute inset-5 w-[calc(100%-2.5rem)] h-[calc(100%-2.5rem)] text-base font-mono leading-relaxed text-neutral-800 bg-transparent resize-none outline-none ${!started ? 'hidden' : 'block'}`}
              spellCheck={false}
            />
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center gap-6">
            <div className="flex items-center gap-10">
              <div>
                <div className="text-4xl font-bold text-emerald-600">{wpm}</div>
                <div className="text-sm text-neutral-500">WPM</div>
              </div>
              <div className="w-px h-12 bg-neutral-200" />
              <div>
                <div className="text-4xl font-bold text-emerald-600">{accuracy}%</div>
                <div className="text-sm text-neutral-500">Accuracy</div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={reset}
                className="px-5 py-2.5 rounded-lg border border-neutral-200 font-medium hover:bg-neutral-50 transition"
              >
                Retry
              </button>
              <Link
                href="/practice"
                className="px-5 py-2.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
              >
                Full Practice
              </Link>
            </div>
          </div>
        )}
      </div>

      {!finished && (
        <div className="bg-neutral-50 border-t border-neutral-100 px-5 py-2.5 text-xs text-center text-neutral-400">
          Focus on accuracy first, speed will follow.
        </div>
      )}
    </div>
  )
}