export default function AnnouncementsPage() {
  const announcements = [
    { id: 1, title: 'Midterm Exam Schedule Released', content: 'The midterm exam schedule has been published. Please check your course pages for specific dates and times.', author: 'Dr. Smith', date: '2025-02-01', pinned: true },
    { id: 2, title: 'Campus Closure Notice', content: 'The campus will be closed on February 20th for maintenance. All classes will be held online.', author: 'Admin', date: '2025-01-28', pinned: true },
    { id: 3, title: 'New Library Resources Available', content: 'The library has acquired new digital resources. Access them through the student portal.', author: 'Librarian', date: '2025-01-25', pinned: false },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Announcements</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Stay updated with the latest news and notifications.</p>
      </div>

      <div className="space-y-4">
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border ${announcement.pinned ? 'border-blue-300 dark:border-blue-700 ring-2 ring-blue-100 dark:ring-blue-900/30' : 'border-gray-200 dark:border-gray-700'} p-6`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                {announcement.pinned && (
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full">
                    Pinned
                  </span>
                )}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{announcement.title}</h3>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">{announcement.date}</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{announcement.content}</p>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">By {announcement.author}</p>
              <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
                Read More →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
