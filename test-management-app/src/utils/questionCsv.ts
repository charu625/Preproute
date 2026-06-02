import type { CorrectOption, QuestionPayload } from '../types/api'

const CORRECT_OPTION_MAP: Record<string, CorrectOption> = {
  option1: 'option1',
  option2: 'option2',
  option3: 'option3',
  option4: 'option4',
  '1': 'option1',
  '2': 'option2',
  '3': 'option3',
  '4': 'option4',
  a: 'option1',
  b: 'option2',
  c: 'option3',
  d: 'option4',
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]
    const next = line[i + 1]

    if (char === '"' && inQuotes && next === '"') {
      current += '"'
      i += 1
      continue
    }
    if (char === '"') {
      inQuotes = !inQuotes
      continue
    }
    if (char === ',' && !inQuotes) {
      cells.push(current.trim())
      current = ''
      continue
    }
    current += char
  }
  cells.push(current.trim())
  return cells
}

function normalizeCorrectOption(raw: string): CorrectOption | null {
  const key = raw.trim().toLowerCase()
  return CORRECT_OPTION_MAP[key] ?? null
}

function rowToQuestion(
  cells: string[],
  testId: string,
  subjectId: string,
): Omit<QuestionPayload, 'type'> | null {
  if (cells.length < 6) return null

  const [question, option1, option2, option3, option4, correctRaw, difficulty, explanation, media_url] =
    cells
  if (!question?.trim()) return null

  const correct_option = normalizeCorrectOption(correctRaw ?? '')
  if (!correct_option) return null
  if (![option1, option2, option3, option4].every((o) => o?.trim())) return null

  return {
    question: question.trim(),
    option1: option1.trim(),
    option2: option2.trim(),
    option3: option3.trim(),
    option4: option4.trim(),
    correct_option,
    difficulty: difficulty?.trim() || 'easy',
    explanation: explanation?.trim() || '',
    media_url: media_url?.trim() || '',
    test_id: testId,
    subject: subjectId,
  }
}

export interface CsvParseResult {
  questions: Omit<QuestionPayload, 'type'>[]
  errors: string[]
}

export function parseQuestionsCsv(text: string, testId: string, subjectId: string): CsvParseResult {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  const questions: Omit<QuestionPayload, 'type'>[] = []
  const errors: string[] = []

  if (lines.length === 0) {
    return { questions, errors: ['CSV file is empty.'] }
  }

  const firstCells = parseCsvLine(lines[0]).map((c) => c.toLowerCase())
  const hasHeader = firstCells.includes('question')

  const dataLines = hasHeader ? lines.slice(1) : lines

  dataLines.forEach((line, index) => {
    const rowNum = hasHeader ? index + 2 : index + 1
    const cells = parseCsvLine(line)
    const parsed = rowToQuestion(cells, testId, subjectId)
    if (!parsed) {
      errors.push(`Row ${rowNum}: invalid or incomplete (need question, 4 options, correct_option).`)
      return
    }
    questions.push(parsed)
  })

  return { questions, errors }
}

export const QUESTION_CSV_TEMPLATE = `question,option1,option2,option3,option4,correct_option,difficulty,explanation,media_url
"What is 2+2?","3","4","5","6","option2","easy","Because 2+2=4",""`
