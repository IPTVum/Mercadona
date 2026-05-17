export default function ProductLoading() {
  return (
    <div className="bg-white">
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="container-custom py-3">
          <div className="h-5 w-64 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
      <div className="container-custom py-8 md:py-12">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
          <div className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
          <div>
            <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse mb-3" />
            <div className="h-5 w-40 bg-gray-200 rounded animate-pulse mb-6" />
            <div className="h-12 w-32 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="h-16 w-full bg-gray-200 rounded animate-pulse mb-6" />
            <div className="flex gap-3 mb-8">
              <div className="h-12 w-40 bg-gray-200 rounded animate-pulse" />
              <div className="h-12 w-12 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
