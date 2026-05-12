export default function GradesPage() {
  const grades = [
    { id: 1, course: 'CS101', courseName: 'Introduction to Programming', midterm: 85, final: 90, overall: 87.5, letter: 'B+', gpa: 3.5 },
    { id: 2, course: 'CS201', courseName: 'Data Structures', midterm: 92, final: 88, overall: 90, letter: 'A-', gpa: 3.7 },
    { id: 3, course: 'CS301', courseName: 'Algorithms', midterm: 78, final: 82, overall: 80, letter: 'B-', gpa: 2.7 },
    { id: 4, course: 'MATH101', courseName: 'Calculus I', midterm: 95, final: 97, overall: 96, letter: 'A', gpa: 4.0 },
  ]

  const getGradeColor = (letter: string) => {
    if (letter.startsWith('A')) return 'text-green-600 dark:text-green-400'
    if (letter.startsWith('B')) return 'text-blue-600 dark:text-blue-400'
    if (letter.startsWith('C')) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Grades</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">View your academic performance and GPA.</p>
      </div>

      {/* GPA Summary */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
        <h2 className="text-lg font-semibold mb-4">Cumulative GPA</h2>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-5xl font-bold">3.48</p>
            <p className="text-blue-100 mt-2">Total Credits: 45</p>
          </div>
          <div className="text-right">
            <p className="text-blue-100">Standing</p>
            <p className="text-2xl font-semibold">Good Standing</p>
          </div>
        </div>
      </div>

      {/* Grades Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Midterm</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Final</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Overall</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Letter</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">GPA Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {grades.map((grade) => (
              <tr key={grade.id}>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{grade.course}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{grade.courseName}</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{grade.midterm}%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{grade.final}%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{grade.overall}%</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${getGradeColor(grade.letter)}`}>
                  {grade.letter}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{grade.gpa}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
