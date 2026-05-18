import { createServerClientSSR } from '@/lib/supabase-server'
import { getTranslations } from 'next-intl/server'
import BlogCard from '@/components/blog/BlogCard'
import type { Blog } from '@/types'

async function getBlogs(): Promise<Blog[]> {
  try {
    const supabase = await createServerClientSSR()
    const { data } = await supabase
      .from('blogs')
      .select('*, profiles(full_name, avatar_url)')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
    return data || []
  } catch (error) {
    console.error('Failed to fetch blogs:', error)
    return []
  }
}

export default async function BlogPage() {
  const t = await getTranslations('blog')
  const blogs = await getBlogs()

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 text-white">
        <div className="container-custom py-16 md:py-20">
          <div className="max-w-2xl">
            <p className="text-primary-200 font-medium uppercase tracking-wider text-sm mb-3">{t('title')}</p>
            <h1 className="text-3xl md:text-5xl font-display font-bold leading-tight">
              {t('subtitle')}
            </h1>
            <p className="mt-4 text-lg text-primary-100">
              Stay updated with the latest news, trends, and expert advice from our team.
            </p>
          </div>
        </div>
      </div>

      <div className="container-custom py-12 md:py-16">
        {blogs.length > 0 ? (
          <>
            {/* Featured Post */}
            {blogs.length > 0 && (
              <div className="mb-10">
                <BlogCard blog={blogs[0]} featured />
              </div>
            )}

            {/* Grid */}
            {blogs.length > 1 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.slice(1).map((blog) => (
                  <BlogCard key={blog.id} blog={blog} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('noPosts')}</h3>
            <p className="text-gray-500">Check back soon for new content!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export const revalidate = 60
