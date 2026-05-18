"use client"

interface HealthMetric {
  name: string
  value: string
  status: 'good' | 'warning' | 'critical'
}

export default function SystemHealth() {
  // Mock health data – replace with real API data in production
  const metrics: HealthMetric[] = [
    { name: 'Server Uptime', value: '99.98%', status: 'good' },
    { name: 'Avg Response Time', value: '214ms', status: 'good' },
    { name: 'Error Rate', value: '0.5%', status: 'warning' },
    { name: 'Database Latency', value: '38ms', status: 'good' }
  ]

  const statusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-600'
      case 'warning':
        return 'bg-yellow-600'
      case 'critical':
        return 'bg-red-600'
      default:
        return 'bg-gray-600'
    }
  }

  return (
    <div className="rounded-xl bg-gray-800 p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-200 mb-4">System Health</h3>
      <ul className="space-y-2 text-gray-300">
        {metrics.map((m, i) => (
          <li key={i} className="flex justify-between items-center">
            <span>{m.name}</span>
            <span className={`px-2 py-0.5 rounded ${statusColor(m.status)} text-xs font-medium`}> {m.value} </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
