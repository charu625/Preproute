import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { login } from '../api/auth'
import { LoginIllustration } from '../components/illustrations/LoginIllustration'
import { Button } from '../components/ui/Button'
import { UnderlineInput } from '../components/ui/UnderlineInput'
import { useAuthStore } from '../store/authStore'
import { getApiErrorMessage } from '../utils/format'

const loginSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  password: z.string().min(1, 'Password is required'),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [apiError, setApiError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { userId: '', password: '' },
  })

  const onSubmit = async (values: LoginForm) => {
    setApiError('')
    try {
      const response = await login(values.userId, values.password)
      if (response.status !== 'success' || !response.data?.token) {
        setApiError(response.message || 'Login failed')
        return
      }
      setAuth(response.data.token, response.data.user)
      navigate('/dashboard')
    } catch (error) {
      setApiError(getApiErrorMessage(error))
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 items-center justify-center bg-panel lg:flex">
        <LoginIllustration />
      </div>

      <div className="flex w-full flex-col justify-center bg-white px-8 py-12 sm:px-16 lg:w-1/2 lg:px-20">
        <div className="mx-auto w-full max-w-md">
          <h1 className="text-2xl font-bold text-brand-500">Preproute</h1>
          <h2 className="mt-8 text-3xl font-bold text-slate-800">Login</h2>
          <p className="mt-2 text-sm text-muted">
            Use your company provided Login credentials
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-8">
            <UnderlineInput
              label="User ID"
              placeholder="Enter User ID"
              error={errors.userId?.message}
              {...register('userId')}
            />
            <UnderlineInput
              label="Password"
              type="password"
              placeholder="Enter Password"
              error={errors.password?.message}
              {...register('password')}
            />

            <a href="#forgot" className="inline-block text-sm text-brand-500 hover:underline">
              Forgot password?
            </a>

            {apiError && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{apiError}</div>
            )}

            <Button type="submit" className="w-full py-3" loading={isSubmitting}>
              Login
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
