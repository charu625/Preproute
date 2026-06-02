import { z } from 'zod'

export const testFormSchema = z.object({
  name: z.string().min(1, 'Test name is required'),
  type: z.string().min(1, 'Test type is required'),
  subject: z.string().min(1, 'Subject is required'),
  topics: z.array(z.string()).min(1, 'Select at least one topic'),
  sub_topics: z.array(z.string()).min(1, 'Select at least one sub topic'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  correct_marks: z.number().min(0),
  wrong_marks: z.number(),
  unattempt_marks: z.number(),
  total_time: z.number().min(1, 'Total time must be at least 1 minute'),
  total_marks: z.number().min(1),
  total_questions: z.number().min(1),
})
