"use client"

interface Activity {
  description: string
  timestamp: string
}

export default function UserActivity() {
  // Mock data – in a real app this would come from an API
  const activities: Activity[] = [
    { description: 'Uploaded prescription image', timestamp: '2 mins ago' },
    { description: 'Viewed interaction alerts', timestamp: '5 mins ago' },
    { description: 'Signed out', timestamp: '10 mins ago' },
  ]

  return (
    <div className="rounded-xl bg-gray-800 p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-200 mb-4">User Activity</h3>
      <ul className="space-y-2 text-gray-300">
        {activities.map((act, i) => (
          <li key={i} className="flex justify-between text-sm">
            <span>{act.description}</span>
            <span className="text-gray-500">{act.timestamp}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
