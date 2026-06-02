import type { z } from 'zod'
import type { loginSchema } from '../schemas/login'
import type { questionSchema } from '../schemas/question'
import type { testFormSchema } from '../schemas/testForm'

export type LoginForm = z.infer<typeof loginSchema>
export type TestFormValues = z.infer<typeof testFormSchema>
export type QuestionFormValues = z.infer<typeof questionSchema>
