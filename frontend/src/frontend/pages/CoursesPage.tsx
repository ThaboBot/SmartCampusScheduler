export default function CoursesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Courses</h1>
      <p className="text-gray-600 dark:text-gray-400">Manage and view your enrolled courses.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Course Code {i}</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Course Name {i}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Instructor: Dr. Smith</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="px-3 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full">
                Active
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">3 Credits</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
