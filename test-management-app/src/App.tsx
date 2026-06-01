import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { PreviewPage } from './pages/PreviewPage'
import { QuestionsPage } from './pages/QuestionsPage'
import { TestFormPage } from './pages/TestFormPage'
import { useAuthStore } from './store/authStore'

function App() {
  const token = useAuthStore((s) => s.token)

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={token ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/tests/new" element={<TestFormPage />} />
            <Route path="/tests/:id/edit" element={<TestFormPage />} />
            <Route path="/tests/:id/questions" element={<QuestionsPage />} />
            <Route path="/tests/:id/preview" element={<PreviewPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to={token ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
