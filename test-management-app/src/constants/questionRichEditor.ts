import type { TextFormatAction } from '../utils/textEditor'

export const QUESTION_EDITOR_TOOLBAR: { action: TextFormatAction; label: string; title: string }[] =
  [
    { action: 'bold', label: 'B', title: 'Bold' },
    { action: 'italic', label: 'I', title: 'Italic' },
    { action: 'underline', label: 'U', title: 'Underline' },
    { action: 'strike', label: 'S', title: 'Strikethrough' },
    { action: 'align', label: '≡', title: 'Indent' },
    { action: 'bullet', label: '•', title: 'Bullet list' },
    { action: 'number', label: '1.', title: 'Numbered list' },
  ]
