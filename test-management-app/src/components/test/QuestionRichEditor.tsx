import { forwardRef, useImperativeHandle, useRef, useState, type ChangeEvent } from 'react'
import { QUESTION_EDITOR_TOOLBAR } from '../../constants/questionRichEditor'
import type { QuestionRichEditorHandle, QuestionRichEditorProps } from '../../types/components'
import { readImageFileAsDataUrl } from '../../utils/imageUpload'
import {
  applyTextareaFormat,
  focusTextareaWithSelection,
  type TextFormatAction,
} from '../../utils/textEditor'

export type { QuestionRichEditorHandle } from '../../types/components'

export const QuestionRichEditor = forwardRef<QuestionRichEditorHandle, QuestionRichEditorProps>(
  function QuestionRichEditor(
    { registration, onQuestionChange, error, mediaUrl = '', onMediaUrl },
    ref,
  ) {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null)
    const imageInputRef = useRef<HTMLInputElement>(null)
    const [imageError, setImageError] = useState('')

    useImperativeHandle(ref, () => ({
      focus: () => textareaRef.current?.focus(),
    }))

    const applyFormat = (action: TextFormatAction) => {
      const el = textareaRef.current
      if (!el) return

      const result = applyTextareaFormat(el.value, el.selectionStart, el.selectionEnd, action)
      onQuestionChange(result.value)
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          focusTextareaWithSelection(
            textareaRef.current,
            result.selectionStart,
            result.selectionEnd,
          )
        }
      })
    }

    const handleImageButtonClick = () => {
      setImageError('')
      imageInputRef.current?.click()
    }

    const handleImageFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      event.target.value = ''
      if (!file) return

      try {
        const dataUrl = await readImageFileAsDataUrl(file)
        setImageError('')
        onMediaUrl?.(dataUrl)
      } catch (err) {
        setImageError(err instanceof Error ? err.message : 'Could not upload image.')
      }
    }

    const handleRemoveImage = () => {
      setImageError('')
      onMediaUrl?.('')
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
            title="Upload image from device"
            aria-label="Upload image from device"
            onClick={handleImageButtonClick}
            className="rounded px-2 py-1 text-xs hover:bg-slate-100"
          >
            🖼
          </button>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={(e) => void handleImageFileChange(e)}
          />
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

          {mediaUrl && (
            <div className="mt-4 rounded-lg border border-border bg-slate-50 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-slate-600">Question image</span>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-xs text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
              <img
                src={mediaUrl}
                alt="Question attachment"
                className="mx-auto max-h-64 w-auto max-w-full rounded-md object-contain"
              />
            </div>
          )}

          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
          {imageError && <p className="mt-1 text-xs text-red-600">{imageError}</p>}
        </div>
      </div>
    )
  },
)
