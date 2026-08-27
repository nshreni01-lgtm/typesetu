export interface Exam {
  id: number
  name: string
  state: string
  language: 'english' | 'hindi' | 'both'
  duration_minutes: number
  min_wpm_english: number
  min_wpm_hindi: number
  backspace_allowed: boolean
  scoring_type: 'standard' | 'cpct_full_half'
  is_active: boolean
}