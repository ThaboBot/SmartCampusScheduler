export default function AssignmentsPage() {
  const assignments = [
    { id: 1, title: 'Essay on Modern Architecture', course: 'CS101', dueDate: '2025-02-15', status: 'pending', points: 100 },
    { id: 2, title: 'Database Design Project', course: 'CS201', dueDate: '2025-02-20', status: 'submitted', points: 150 },
    { id: 3, title: 'Algorithm Analysis', course: 'CS301', dueDate: '2025-02-10', status: 'graded', points: 80, grade: 75 },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
      case 'submitted': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
      case 'graded': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Assignments</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">View and submit your assignments.</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
          New Assignment
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Points</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {assignments.map((assignment) => (
              <tr key={assignment.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{assignment.title}</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{assignment.course}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{assignment.dueDate}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(assignment.status)}`}>
                    {assignment.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {assignment.grade ? `${assignment.grade}/${assignment.points}` : assignment.points}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3">
                    View
                  </button>
                  {assignment.status === 'pending' && (
                    <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                      Submit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
