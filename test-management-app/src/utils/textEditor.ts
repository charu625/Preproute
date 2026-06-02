export type TextFormatAction = 'bold' | 'italic' | 'underline' | 'strike' | 'align' | 'bullet' | 'number' | 'image'

export interface TextareaFormatResult {
  value: string
  selectionStart: number
  selectionEnd: number
}

function wrapSelection(value: string, start: number, end: number, before: string, after: string): TextareaFormatResult {
  const selected = value.slice(start, end)
  const wrapped = before + (selected || 'text') + after
  const newValue = value.slice(0, start) + wrapped + value.slice(end)
  const cursorStart = start + before.length
  const cursorEnd = cursorStart + (selected || 'text').length
  return { value: newValue, selectionStart: cursorStart, selectionEnd: cursorEnd }
}

function transformLines(
  value: string,
  start: number,
  end: number,
  transform: (line: string, index: number) => string,
): TextareaFormatResult {
  const lineStart = value.lastIndexOf('\n', start - 1) + 1
  const lineEndRaw = value.indexOf('\n', end)
  const lineEnd = lineEndRaw === -1 ? value.length : lineEndRaw
  const block = value.slice(lineStart, lineEnd)
  const lines = block.split('\n')
  const transformed = lines.map((line, i) => transform(line, i)).join('\n')
  const newValue = value.slice(0, lineStart) + transformed + value.slice(lineEnd)
  return {
    value: newValue,
    selectionStart: lineStart,
    selectionEnd: lineStart + transformed.length,
  }
}

export function applyTextareaFormat(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  action: TextFormatAction,
  imageUrl?: string,
): TextareaFormatResult {
  const start = Math.min(selectionStart, selectionEnd)
  const end = Math.max(selectionStart, selectionEnd)

  switch (action) {
    case 'bold':
      return wrapSelection(value, start, end, '**', '**')
    case 'italic':
      return wrapSelection(value, start, end, '*', '*')
    case 'underline':
      return wrapSelection(value, start, end, '__', '__')
    case 'strike':
      return wrapSelection(value, start, end, '~~', '~~')
    case 'align':
      return transformLines(value, start, end, (line) => {
        const trimmed = line.trimStart()
        const indent = '    '
        return trimmed ? `${indent}${trimmed}` : line
      })
    case 'bullet':
      return transformLines(value, start, end, (line) => {
        const trimmed = line.replace(/^•\s*/, '')
        return trimmed ? `• ${trimmed}` : '• '
      })
    case 'number':
      return transformLines(value, start, end, (line, index) => {
        const trimmed = line.replace(/^\d+\.\s*/, '')
        return trimmed ? `${index + 1}. ${trimmed}` : `${index + 1}. `
      })
    case 'image': {
      const url = imageUrl?.trim()
      if (!url) return { value, selectionStart: start, selectionEnd: end }
      const insert = `\n![image](${url})\n`
      const newValue = value.slice(0, end) + insert + value.slice(end)
      const cursor = end + insert.length
      return { value: newValue, selectionStart: cursor, selectionEnd: cursor }
    }
    default:
      return { value, selectionStart: start, selectionEnd: end }
  }
}

export function focusTextareaWithSelection(
  el: HTMLTextAreaElement,
  selectionStart: number,
  selectionEnd: number,
) {
  el.focus()
  el.setSelectionRange(selectionStart, selectionEnd)
}
