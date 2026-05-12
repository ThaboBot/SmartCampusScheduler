import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './frontend/store/theme-provider'
import { AuthProvider } from './frontend/store/auth-context'

// Pages
import LoginPage from './frontend/pages/LoginPage'
import DashboardPage from './frontend/pages/DashboardPage'
import CoursesPage from './frontend/pages/CoursesPage'
import TimetablePage from './frontend/pages/TimetablePage'
import AssignmentsPage from './frontend/pages/AssignmentsPage'
import GradesPage from './frontend/pages/GradesPage'
import AnnouncementsPage from './frontend/pages/AnnouncementsPage'
import ProfilePage from './frontend/pages/ProfilePage'
import NotFoundPage from './frontend/pages/NotFoundPage'

// Layout
import MainLayout from './frontend/components/MainLayout'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              
              <Route element={<MainLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/courses" element={<CoursesPage />} />
                <Route path="/timetable" element={<TimetablePage />} />
                <Route path="/assignments" element={<AssignmentsPage />} />
                <Route path="/grades" element={<GradesPage />} />
                <Route path="/announcements" element={<AnnouncementsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
          <Toaster position="top-right" />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
