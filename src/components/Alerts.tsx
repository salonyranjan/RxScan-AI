"use client"

interface Interaction {
  interactingDrug: string
  severity: string
  description: string
}

interface AlertProps {
  interactions: Array<{ medication: string; interactions: Interaction[] }>
}

export default function Alerts({ interactions }: AlertProps) {
  if (!interactions || interactions.length === 0) return null

  return (
    <div className="space-y-4">
      {interactions.map((med, idx) => (
        <div
          key={idx}
          className="border-l-4 border-red-600 bg-red-900/30 p-4 rounded-md shadow-lg"
        >
          <h3 className="text-xl font-semibold text-red-200 mb-2">
            Interaction for {med.medication}
          </h3>
          <ul className="space-y-2">
            {med.interactions.map((int, i) => (
              <li
                key={i}
                className={`text-white flex flex-col gap-1 ${
                  int.severity.toLowerCase() === 'high' ? 'animate-pulse' : ''
                }`}
              >
                <span className="font-medium">
                  {int.interactingDrug} ({int.severity})
                </span>
                <span className="text-sm text-gray-300">{int.description}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
