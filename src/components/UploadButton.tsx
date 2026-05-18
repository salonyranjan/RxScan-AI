"use client"

import { useState } from 'react'
import { Camera, Upload } from 'lucide-react'

export default function UploadButton({ onUpload }: { onUpload: (base64: string) => void }) {
  const [loading, setLoading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    try {
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = reader.result as string
        onUpload(base64)
      }
      reader.readAsDataURL(file)
    } catch (err) {
      console.error('Error reading file:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleClick = () => {
    // Trigger file input click
    const input = document.getElementById('fileInput') as HTMLInputElement
    if (input) input.click()
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <input
        type="file"
        id="fileInput"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={handleClick}
        className="group relative flex items-center justify-center w-full max-w-md px-8 py-6 bg-blue-600 hover:bg-blue-700 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 opacity-75 group-hover:opacity-100 transition-opacity" />
        <span className="relative flex items-center gap-3">
          <Camera className="h-6 w-6 text-white" />
          <span className="font-bold text-lg">Upload Prescription Image</span>
        </span>
      </button>
      <p className="text-gray-400 text-sm">
        Supports JPG, PNG, or HEIC formats
      </p>
      {loading && (
        <div className="flex items-center gap-2 text-blue-300">
          <svg className="animate-spin h-5 w-5 text-blue-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Processing image...</span>
        </div>
      )}
    </div>
  )
}