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

const REQUIRED_COLUMNS = [
  'question',
  'option1',
  'option2',
  'option3',
  'option4',
  'correct_option',
] as const

const OPTIONAL_COLUMNS = ['difficulty', 'explanation', 'media_url'] as const

type CsvColumn = (typeof REQUIRED_COLUMNS)[number] | (typeof OPTIONAL_COLUMNS)[number]

const HEADER_ALIASES: Record<string, CsvColumn> = {
  question: 'question',
  q: 'question',
  option1: 'option1',
  option_1: 'option1',
  opt1: 'option1',
  a: 'option1',
  option2: 'option2',
  option_2: 'option2',
  opt2: 'option2',
  b: 'option2',
  option3: 'option3',
  option_3: 'option3',
  opt3: 'option3',
  c: 'option3',
  option4: 'option4',
  option_4: 'option4',
  opt4: 'option4',
  d: 'option4',
  correct_option: 'correct_option',
  correctoption: 'correct_option',
  correct: 'correct_option',
  answer: 'correct_option',
  difficulty: 'difficulty',
  level: 'difficulty',
  explanation: 'explanation',
  solution: 'explanation',
  media_url: 'media_url',
  mediaurl: 'media_url',
  media: 'media_url',
  image_url: 'media_url',
}

export const CSV_COLUMN_LABELS: Record<CsvColumn, string> = {
  question: 'question',
  option1: 'option1',
  option2: 'option2',
  option3: 'option3',
  option4: 'option4',
  correct_option: 'correct_option',
  difficulty: 'difficulty',
  explanation: 'explanation',
  media_url: 'media_url',
}

function normalizeHeader(cell: string): string {
  return cell
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
}

function resolveHeaderName(cell: string): CsvColumn | null {
  const normalized = normalizeHeader(cell)
  return HEADER_ALIASES[normalized] ?? null
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

function looksLikeHeaderRow(cells: string[]): boolean {
  const resolved = new Set(
    cells.map((cell) => resolveHeaderName(cell)).filter((c): c is CsvColumn => c !== null),
  )
  const hasQuestion = resolved.has('question')
  const hasOptions = (['option1', 'option2', 'option3', 'option4'] as const).some((col) =>
    resolved.has(col),
  )
  const hasCorrect = resolved.has('correct_option')
  return hasQuestion && (hasOptions || hasCorrect)
}

function buildColumnMap(headerCells: string[]): {
  map: Map<CsvColumn, number> | null
  missing: string[]
  unknown: string[]
} {
  const map = new Map<CsvColumn, number>()
  const unknown: string[] = []

  headerCells.forEach((cell, index) => {
    const canonical = resolveHeaderName(cell)
    if (!canonical) {
      if (cell.trim()) unknown.push(cell.trim())
      return
    }
    if (!map.has(canonical)) {
      map.set(canonical, index)
    }
  })

  const missing = REQUIRED_COLUMNS.filter((col) => !map.has(col)).map(
    (col) => CSV_COLUMN_LABELS[col],
  )

  if (missing.length > 0) {
    return { map: null, missing, unknown }
  }

  return { map, missing: [], unknown }
}

function getMappedCell(cells: string[], map: Map<CsvColumn, number>, column: CsvColumn): string {
  const index = map.get(column)
  if (index === undefined) return ''
  return cells[index]?.trim() ?? ''
}

function cellsToQuestion(
  cells: string[],
  testId: string,
  subjectId: string,
  map?: Map<CsvColumn, number>,
): Omit<QuestionPayload, 'type'> | null {
  const question = map ? getMappedCell(cells, map, 'question') : cells[0]?.trim() ?? ''
  const option1 = map ? getMappedCell(cells, map, 'option1') : cells[1]?.trim() ?? ''
  const option2 = map ? getMappedCell(cells, map, 'option2') : cells[2]?.trim() ?? ''
  const option3 = map ? getMappedCell(cells, map, 'option3') : cells[3]?.trim() ?? ''
  const option4 = map ? getMappedCell(cells, map, 'option4') : cells[4]?.trim() ?? ''
  const correctRaw = map
    ? getMappedCell(cells, map, 'correct_option')
    : cells[5]?.trim() ?? ''
  const difficulty = map
    ? getMappedCell(cells, map, 'difficulty')
    : cells[6]?.trim() ?? ''
  const explanation = map
    ? getMappedCell(cells, map, 'explanation')
    : cells[7]?.trim() ?? ''
  const media_url = map
    ? getMappedCell(cells, map, 'media_url')
    : cells[8]?.trim() ?? ''

  if (!question) return null

  const correct_option = normalizeCorrectOption(correctRaw)
  if (!correct_option) return null
  if (![option1, option2, option3, option4].every((o) => o.trim())) return null

  return {
    question,
    option1,
    option2,
    option3,
    option4,
    correct_option,
    difficulty: difficulty || 'easy',
    explanation,
    media_url,
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

  const headerCells = parseCsvLine(lines[0])
  const useHeaderMapping = looksLikeHeaderRow(headerCells)

  let columnMap: Map<CsvColumn, number> | undefined
  let dataLines = lines

  if (useHeaderMapping) {
    const { map, missing, unknown } = buildColumnMap(headerCells)
    if (!map) {
      const parts = [`Missing required column(s): ${missing.join(', ')}.`]
      if (unknown.length > 0) {
        parts.push(`Unrecognized header(s): ${unknown.join(', ')}.`)
      }
      parts.push('Download the Template for the correct header row.')
      return { questions, errors: [parts.join(' ')] }
    }
    columnMap = map
    dataLines = lines.slice(1)

    if (dataLines.length === 0) {
      return { questions, errors: ['CSV has a header row but no question rows.'] }
    }
  }

  dataLines.forEach((line, index) => {
    const rowNum = useHeaderMapping ? index + 2 : index + 1
    const cells = parseCsvLine(line)
    const parsed = cellsToQuestion(cells, testId, subjectId, columnMap)
    if (!parsed) {
      errors.push(
        `Row ${rowNum}: invalid or incomplete (need question, 4 options, and a valid correct_option).`,
      )
      return
    }
    questions.push(parsed)
  })

  return { questions, errors }
}

export const QUESTION_CSV_TEMPLATE = `question,option1,option2,option3,option4,correct_option,difficulty,explanation,media_url
"What is 2+2?","3","4","5","6","option2","easy","Because 2+2=4",""`
