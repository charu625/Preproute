import type { QuestionPayload } from '../types/api'
import type { QuestionFormValues } from '../types/forms'
import { stripEmbeddedQuestionImages } from './questionText'

export function payloadToFormValues(
  q: Pick<
    QuestionPayload,
    | 'question'
    | 'option1'
    | 'option2'
    | 'option3'
    | 'option4'
    | 'correct_option'
    | 'explanation'
    | 'difficulty'
    | 'media_url'
  >,
): QuestionFormValues {
  return {
    question: stripEmbeddedQuestionImages(q.question),
    option1: q.option1,
    option2: q.option2,
    option3: q.option3,
    option4: q.option4,
    correct_option: q.correct_option,
    explanation: q.explanation ?? '',
    difficulty: (q.difficulty as QuestionFormValues['difficulty']) || 'easy',
    media_url: q.media_url ?? '',
  }
}
