'use client'

import { useState } from 'react'
import Link from 'next/link'
import ExamSelector from '@/components/exam/ExamSelector'
import TypingEngine from '@/components/typing/TypingEngine'
import ResultCard from '@/components/typing/ResultCard'
import type { Exam } from '@/types/exam'

const PASSAGES = {
  english: 'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump.',
  hindi: 'भारत एक विशाल देश है, जिसमें कई भाषाएँ बोली जाती हैं। शिक्षा का अधिकार क्षेत्र में महत्त्वपूर्ण परिवर्तन हुआ है।',
}

export default function PracticePage() {
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [result, setResult] = useState<any>(null)
  const [language, setLanguage] = useState<'en' | 'hi'>('en')

  // Exam select hone pe
  const handleExamSelect = (exam: Exam) => {
    setSelectedExam(exam)
    setResult(null)

    // Language decide karo
    if (exam.language === 'hindi') {
      setLanguage('hi')
    } else {
      setLanguage('en')
    }
  }

  // Wapas exam choose karne ke liye
  const handleBackToExams = () => {
    setSelectedExam(null)
    setResult(null)
  }

  // Agar koi exam select nahi hua to Selector dikhao
  if (!selectedExam) {
    return (
      <div className="min-h-screen bg-neutral-50 py-10">
        <div className="max-w-5xl mx-auto px-6">
          <Link href="/" className="text-sm text-neutral-500 hover:text-emerald-600 mb-6 inline-block">
            ← Back to Home
          </Link>
          <ExamSelector onSelect={handleExamSelect} />
        </div>
      </div>
    )
  }

  // Result dikhao
  if (result) {
    return (
      <div className="min-h-screen bg-neutral-50 py-10">
        <div className="max-w-2xl mx-auto px-6">
          <ResultCard
            result={result}
            language={language}
            onRestart={() => setResult(null)}
          />
          <div className="text-center mt-6">
            <button
              onClick={handleBackToExams}
              className="text-sm text-neutral-500 hover:text-emerald-600"
            >
              ← Choose another exam
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Typing Engine with selected exam rules
  return (
    <div className="min-h-screen bg-neutral-50 py-10">
      <div className="max-w-4xl mx-auto px-6">
        {/* Selected Exam Info */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <button
              onClick={handleBackToExams}
              className="text-sm text-neutral-500 hover:text-emerald-600 mb-1"
            >
              ← Change Exam
            </button>
            <h1 className="text-xl font-bold">{selectedExam.name}</h1>
            <p className="text-sm text-neutral-500">
              {selectedExam.duration_minutes} min · 
              Backspace: {selectedExam.backspace_allowed ? 'Allowed' : 'Not Allowed'} · 
              Min WPM: {language === 'hi' ? selectedExam.min_wpm_hindi : selectedExam.min_wpm_english}
            </p>
          </div>

          {selectedExam.language === 'both' && (
            <div className="flex gap-2">
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  language === 'en' ? 'bg-emerald-600 text-white' : 'bg-white border'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  language === 'hi' ? 'bg-emerald-600 text-white' : 'bg-white border'
                }`}
              >
                हिन्दी
              </button>
            </div>
          )}
        </div>

        <TypingEngine
          passage={language === 'hi' ? PASSAGES.hindi : PASSAGES.english}
          duration={selectedExam.duration_minutes * 60}
          language={language}
          allowBackspace={selectedExam.backspace_allowed}
          blindMode={false}
          onComplete={setResult}
        />
      </div>
    </div>
  )
}