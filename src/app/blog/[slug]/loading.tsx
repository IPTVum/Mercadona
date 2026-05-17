export default function BlogPostLoading() {
  return (
    <article className="bg-white">
      <section className="relative min-h-[70vh] md:min-h-[80vh] flex items-end bg-gradient-to-br from-primary-800 via-primary-900 to-gray-900">
        <div className="container-custom pb-12 md:pb-16 w-full">
          <div className="max-w-3xl">
            <div className="flex gap-2 mb-5">
              <div className="h-8 w-20 bg-white/20 rounded-full animate-pulse" />
            </div>
            <div className="space-y-3">
              <div className="h-14 w-full bg-white/20 rounded animate-pulse" />
              <div className="h-14 w-3/4 bg-white/20 rounded animate-pulse" />
            </div>
            <div className="h-6 w-96 bg-white/20 rounded animate-pulse mt-5" />
            <div className="flex items-center gap-4 mt-8">
              <div className="w-14 h-14 bg-white/20 rounded-full animate-pulse" />
              <div>
                <div className="h-5 w-32 bg-white/20 rounded animate-pulse" />
                <div className="h-4 w-48 bg-white/20 rounded animate-pulse mt-1" />
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="container-custom py-12 md:py-16">
        <div className="max-w-3xl mx-auto space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: `${85 - i * 5}%` }} />
          ))}
        </div>
      </div>
    </article>
  )
}
