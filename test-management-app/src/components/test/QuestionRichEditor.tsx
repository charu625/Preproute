import { forwardRef, useImperativeHandle, useRef } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'
import {
  applyTextareaFormat,
  focusTextareaWithSelection,
  type TextFormatAction,
} from '../../utils/textEditor'

const TOOLBAR: { action: TextFormatAction; label: string; title: string }[] = [
  { action: 'bold', label: 'B', title: 'Bold' },
  { action: 'italic', label: 'I', title: 'Italic' },
  { action: 'underline', label: 'U', title: 'Underline' },
  { action: 'strike', label: 'S', title: 'Strikethrough' },
  { action: 'align', label: '≡', title: 'Indent' },
  { action: 'bullet', label: '•', title: 'Bullet list' },
  { action: 'number', label: '1.', title: 'Numbered list' },
]

interface QuestionRichEditorProps {
  registration: UseFormRegisterReturn<'question'>
  onQuestionChange: (value: string) => void
  error?: string
  onMediaUrl?: (url: string) => void
}

export type QuestionRichEditorHandle = {
  focus: () => void
}

export const QuestionRichEditor = forwardRef<QuestionRichEditorHandle, QuestionRichEditorProps>(
  function QuestionRichEditor({ registration, onQuestionChange, error, onMediaUrl }, ref) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useImperativeHandle(ref, () => ({
    focus: () => textareaRef.current?.focus(),
  }))

  const applyFormat = (action: TextFormatAction) => {
    const el = textareaRef.current
    if (!el) return

    let imageUrl: string | undefined
    if (action === 'image') {
      imageUrl = window.prompt('Enter image URL to insert:', '') ?? undefined
      if (!imageUrl?.trim()) return
      onMediaUrl?.(imageUrl.trim())
    }

    const result = applyTextareaFormat(
      el.value,
      el.selectionStart,
      el.selectionEnd,
      action,
      imageUrl,
    )
    onQuestionChange(result.value)
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        focusTextareaWithSelection(textareaRef.current, result.selectionStart, result.selectionEnd)
      }
    })
  }

  const { ref: registerRef, ...registerProps } = registration

  return (
    <div className="rounded-xl border border-border bg-white shadow-sm">
      <div className="flex flex-wrap gap-1 border-b border-border px-3 py-2">
        {TOOLBAR.map(({ action, label, title }) => (
          <button
            key={action}
            type="button"
            title={title}
            aria-label={title}
            onClick={() => applyFormat(action)}
            className="min-w-[28px] rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          title="Insert image"
          aria-label="Insert image"
          onClick={() => applyFormat('image')}
          className="rounded px-2 py-1 text-xs hover:bg-slate-100"
        >
          🖼
        </button>
      </div>
      <div className="relative p-4">
        <textarea
          {...registerProps}
          ref={(el) => {
            registerRef(el)
            textareaRef.current = el
          }}
          className="min-h-[140px] w-full resize-y rounded-lg border-0 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
          rows={5}
          placeholder="Type here"
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    </div>
  )
},
)
