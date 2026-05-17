import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="animate-spin mx-auto text-primary-600 mb-4" size={40} />
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    </div>
  )
}
