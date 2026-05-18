export default function BlogLoading() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 text-white">
        <div className="container-custom py-16 md:py-20">
          <div className="max-w-2xl">
            <div className="h-5 w-24 bg-white/20 rounded animate-pulse mb-3" />
            <div className="h-12 w-96 bg-white/20 rounded animate-pulse mb-4" />
            <div className="h-6 w-80 bg-white/20 rounded animate-pulse" />
          </div>
        </div>
      </div>
      <div className="container-custom py-12 md:py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
              <div className="h-48 bg-gray-100" />
              <div className="p-5">
                <div className="h-5 w-3/4 bg-gray-200 rounded mb-3" />
                <div className="h-4 w-full bg-gray-200 rounded mb-2" />
                <div className="h-4 w-2/3 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
