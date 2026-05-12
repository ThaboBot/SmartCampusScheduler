export default function TimetablePage() {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  const times = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM']

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Timetable</h1>
      <p className="text-gray-600 dark:text-gray-400">Your weekly class schedule.</p>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Time
                </th>
                {days.map((day) => (
                  <th key={day} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {times.map((time, timeIdx) => (
                <tr key={time}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {time}
                  </td>
                  {days.map((day, dayIdx) => (
                    <td key={day} className="px-6 py-4">
                      {(timeIdx + dayIdx) % 3 === 0 && (
                        <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3">
                          <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                            Course {(timeIdx + dayIdx) % 6 + 1}
                          </p>
                          <p className="text-xs text-blue-700 dark:text-blue-300">Room {100 + (timeIdx + dayIdx) % 5}</p>
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
