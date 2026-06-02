import {
  CORRECT_OPTION_MAP,
  CSV_COLUMN_LABELS,
  HEADER_ALIASES,
  REQUIRED_COLUMNS,
  type CsvColumn,
} from '../constants/questionCsv'
import type { CorrectOption, QuestionPayload } from '../types/api'
import type { CsvParseResult } from '../types/csv'

export type { CsvParseResult } from '../types/csv'
export { QUESTION_CSV_TEMPLATE } from '../constants/questionCsv'

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
