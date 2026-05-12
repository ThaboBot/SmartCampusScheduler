import { useAuth } from '../store/auth-context'
import { motion } from 'framer-motion'
import { BookOpen, Clock, AlertCircle, CheckCircle } from 'lucide-react'

const stats = [
  { name: 'Total Courses', value: '5', icon: BookOpen, change: '+2 this semester' },
  { name: 'Assignments Due', value: '3', icon: AlertCircle, change: 'This week' },
  { name: 'Attendance Rate', value: '94%', icon: CheckCircle, change: '+2% from last month' },
  { name: 'Average Grade', value: '87%', icon: Clock, change: '+5% from last semester' },
]

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.full_name}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Here's what's happening with your courses today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3">
                <stat.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.name}
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">{stat.change}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity & Upcoming */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Assignments */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Assignments
          </h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Assignment {i}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Course Name • Due in {i} days</p>
                </div>
                <span className="px-3 py-1 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded-full">
                  Pending
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Classes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Today's Schedule
          </h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex-shrink-0 w-16 text-center">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">9:00</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">AM</p>
                </div>
                <div className="ml-4 flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">Course Name {i}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Room 101 • Lecture Hall</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
