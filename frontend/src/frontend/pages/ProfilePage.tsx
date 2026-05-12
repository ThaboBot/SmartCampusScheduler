import { useAuth } from '../store/auth-context'
import { useState } from 'react'
import { User, Mail, Phone, Calendar } from 'lucide-react'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateUser(formData)
    setIsEditing(false)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your account settings and preferences.</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-32" />
        <div className="px-6 pb-6">
          <div className="relative -mt-12 mb-4">
            <div className="w-24 h-24 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center text-3xl font-bold text-blue-600 dark:text-blue-400 border-4 border-white dark:border-gray-800">
              {user?.full_name.charAt(0).toUpperCase()}
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.full_name}</h2>
              <p className="text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                Save Changes
              </button>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
                  <p className="font-medium text-gray-900 dark:text-white">{user?.full_name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email Address</p>
                  <p className="font-medium text-gray-900 dark:text-white">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Member Since</p>
                  <p className="font-medium text-gray-900 dark:text-white">January 2025</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Phone Number</p>
                  <p className="font-medium text-gray-900 dark:text-white">Not provided</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
