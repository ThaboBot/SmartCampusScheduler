import { Link } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center">
        <AlertCircle className="w-24 h-24 text-gray-400 mx-auto mb-6" />
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Oops! The page you're looking for doesn't exist.
        </p>
        <Link
          to="/dashboard"
          className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  )
}
