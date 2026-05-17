import { TableSkeleton } from '@/components/ui/Skeletons'

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse flex justify-between items-center">
        <div className="h-10 bg-gray-200 rounded w-48" />
        <div className="h-10 bg-gray-200 rounded w-36" />
      </div>
      <TableSkeleton rows={5} />
    </div>
  )
}
