'use client'

import React, { useState } from 'react'
import { Clock, Keyboard, Delete, CheckCircle2, AlertCircle } from 'lucide-react'

// --- Types ---
type StateOption = 'Madhya Pradesh (MP)' | 'Uttar Pradesh (UP)' | 'All-India' | 'Other'

export interface Exam {
  id: string
  state: StateOption
  name: string
  language: 'English' | 'Hindi' | 'Both'
  durationMin: number
  minWpmEnglish?: number
  minWpmHindi?: number
  backspaceAllowed: boolean
}

interface ExamSelectorProps {
  onSelect: (exam: Exam) => void
}

// --- Static Data ---
const EXAM_DATA: Exam[] = [
  {
    id: 'cpct-mp',
    state: 'Madhya Pradesh (MP)',
    name: 'MP CPCT',
    language: 'Both',
    durationMin: 15,
    minWpmEnglish: 30,
    minWpmHindi: 20,
    backspaceAllowed: false, // MP CPCT rule: Backspace is NOT allowed
  },
  {
    id: 'upsssc-up',
    state: 'Uttar Pradesh (UP)',
    name: 'UPSSSC Stenographer / Clerk',
    language: 'Hindi',
    durationMin: 5,
    minWpmHindi: 25,
    backspaceAllowed: false,
  },
  {
    id: 'ssc-chsl',
    state: 'All-India',
    name: 'SSC CHSL Typing Test',
    language: 'Both',
    durationMin: 10,
    minWpmEnglish: 35,
    minWpmHindi: 30,
    backspaceAllowed: true,
  },
  {
    id: 'ssc-cgl',
    state: 'All-India',
    name: 'SSC CGL DEST',
    language: 'English',
    durationMin: 15,
    minWpmEnglish: 27,
    backspaceAllowed: true,
  },
  {
    id: 'high-court',
    state: 'Other',
    name: 'High Court Assistant Typing',
    language: 'English',
    durationMin: 10,
    minWpmEnglish: 40,
    backspaceAllowed: false,
  },
]

const STATE_OPTIONS: StateOption[] = [
  'All-India',
  'Madhya Pradesh (MP)',
  'Uttar Pradesh (UP)',
  'Other',
]

export default function ExamSelector({ onSelect }: ExamSelectorProps) {
  const [selectedState, setSelectedState] = useState<StateOption>('All-India')
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null)
  const [selectedExamObj, setSelectedExamObj] = useState<Exam | null>(null)

  const filteredExams = EXAM_DATA.filter((exam) => exam.state === selectedState)

  const handleCardClick = (exam: Exam) => {
    setSelectedExamId(exam.id)
    setSelectedExamObj(exam)
  }

  const handleProceed = () => {
    if (selectedExamObj) {
      onSelect(selectedExamObj)
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-8 bg-white rounded-3xl shadow-xl shadow-neutral-100 border border-neutral-100">
      
      {/* Header & State Dropdown */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-neutral-900">Select Target Exam</h2>
          <p className="text-sm text-neutral-500 mt-1">Choose your state region to load official exam guidelines.</p>
        </div>
        
        <div className="w-full sm:w-72">
          <label htmlFor="state-select" className="block text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wider">
            Filter by State / Category
          </label>
          <div className="relative">
            <select
              id="state-select"
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value as StateOption)
                setSelectedExamId(null)
                setSelectedExamObj(null)
              }}
              className="w-full appearance-none bg-neutral-50 border border-neutral-200 text-neutral-900 text-sm font-semibold rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all cursor-pointer"
            >
              {STATE_OPTIONS.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-500">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Exam Cards Grid */}
      {filteredExams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredExams.map((exam) => {
            const isSelected = selectedExamId === exam.id

            return (
              <div
                key={exam.id}
                onClick={() => handleCardClick(exam)}
                className={`relative cursor-pointer rounded-2xl border p-5 transition-all duration-200 ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20 shadow-md shadow-emerald-600/10'
                    : 'border-neutral-200 bg-white hover:border-emerald-300 hover:shadow-sm'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-4 right-4 text-emerald-600">
                    <CheckCircle2 className="w-6 h-6 fill-emerald-100" />
                  </div>
                )}

                <div className="mb-4 pr-8">
                  <h3 className="text-lg font-bold text-neutral-900">{exam.name}</h3>
                  <div className="inline-block mt-2 px-2.5 py-1 bg-neutral-100 text-neutral-700 text-xs font-bold rounded-md">
                    {exam.language} Exam
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-neutral-100">
                  <div className="flex items-center gap-2.5 text-sm text-neutral-600 font-medium">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span>Duration: <strong className="text-neutral-900">{exam.durationMin} Mins</strong></span>
                  </div>

                  <div className="flex items-center gap-2.5 text-sm text-neutral-600 font-medium">
                    <Keyboard className="w-4 h-4 text-emerald-600" />
                    <span>
                      Speed:{' '}
                      <strong className="text-neutral-900">
                        {exam.language === 'Both' && `Eng ${exam.minWpmEnglish} | Hin ${exam.minWpmHindi}`}
                        {exam.language === 'English' && `${exam.minWpmEnglish} WPM`}
                        {exam.language === 'Hindi' && `${exam.minWpmHindi} WPM`}
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 text-sm text-neutral-600 font-medium">
                    {exam.backspaceAllowed ? (
                      <Delete className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span>
                      Backspace:{' '}
                      <strong className={exam.backspaceAllowed ? 'text-emerald-700' : 'text-red-600'}>
                        {exam.backspaceAllowed ? 'Yes (Allowed)' : 'No (Blocked)'}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-neutral-50 rounded-2xl border border-neutral-100">
          <p className="text-neutral-500 font-semibold">No exams found for this selected region.</p>
        </div>
      )}

      {/* Action Footer */}
      {selectedExamId && (
        <div className="mt-8 pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm font-semibold text-neutral-600">
            Selected: <strong className="text-neutral-900">{selectedExamObj?.name}</strong> rules loaded! 🚀
          </div>
          <button 
            onClick={handleProceed}
            className="w-full sm:w-auto bg-emerald-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/25 active:scale-95"
          >
            Start Practice with These Rules
          </button>
        </div>
      )}
    </div>
  )
}