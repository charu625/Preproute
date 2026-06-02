import { forwardRef, useImperativeHandle, useRef } from 'react'
import { QUESTION_EDITOR_TOOLBAR } from '../../constants/questionRichEditor'
import type { QuestionRichEditorHandle, QuestionRichEditorProps } from '../../types/components'
import {
  applyTextareaFormat,
  focusTextareaWithSelection,
  type TextFormatAction,
} from '../../utils/textEditor'

export type { QuestionRichEditorHandle } from '../../types/components'

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
        {QUESTION_EDITOR_TOOLBAR.map(({ action, label, title }) => (
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
