import { notFound } from 'next/navigation'
import SafeImage from '@/components/ui/SafeImage'
import Link from 'next/link'
import { createServerClientSSR } from '@/lib/supabase-server'
import { formatDate } from '@/lib/utils'
import { Calendar, Clock, ArrowLeft, ChevronRight, Tag } from 'lucide-react'
import ShareButton from '@/components/ui/ShareButton'
import { sanitizeHtml } from '@/lib/sanitize'
import type { Blog } from '@/types'

interface BlogPageProps {
  params: { slug: string }
}

async function getBlog(slug: string): Promise<Blog | null> {
  try {
    const supabase = await createServerClientSSR()
    const { data } = await supabase
      .from('blogs')
      .select('*, profiles(full_name, avatar_url)')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle()
    return data
  } catch (error) {
    console.error('Failed to fetch blog:', error)
    return null
  }
}

async function getRelatedBlogs(blogId: string): Promise<Blog[]> {
  try {
    const supabase = await createServerClientSSR()
    const { data } = await supabase
      .from('blogs')
      .select('*, profiles(full_name, avatar_url)')
      .eq('is_published', true)
      .neq('id', blogId)
      .order('published_at', { ascending: false })
      .limit(3)
    return data || []
  } catch (error) {
    console.error('Failed to fetch related blogs:', error)
    return []
  }
}

function estimateReadingTime(content: string | null): number {
  if (!content) return 1
  const words = content.split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

export async function generateMetadata({ params }: BlogPageProps) {
  const blog = await getBlog(params.slug)
  if (!blog) return { title: 'Blog Post Not Found' }

  return {
    title: blog.meta_title || blog.title,
    description: blog.meta_description || blog.excerpt,
    openGraph: {
      title: blog.meta_title || blog.title,
      description: blog.meta_description || blog.excerpt,
      images: blog.image ? [blog.image] : [],
    },
  }
}

export default async function BlogPostPage({ params }: BlogPageProps) {
  const blog = await getBlog(params.slug)
  if (!blog) notFound()

  const relatedBlogs = await getRelatedBlogs(blog.id)
  const readingTime = estimateReadingTime(blog.content)

  return (
    <article className="bg-white">
      {/* Hero Section - Full viewport with parallax */}
      <section className="relative min-h-[70vh] md:min-h-[80vh] flex items-end overflow-hidden">
        {/* Background Image */}
        {blog.image ? (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center bg-fixed bg-no-repeat z-0"
              style={{ backgroundImage: `url(${blog.image})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/80 z-[1]" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-800 via-primary-900 to-gray-900 z-[1]" />
        )}

        {/* Animated decorative lines */}
        <div className="absolute inset-0 z-[1] opacity-20">
          <div className="absolute top-20 left-10 w-px h-32 bg-white/30 animate-slide-down" />
          <div className="absolute top-40 right-20 w-px h-24 bg-white/20 animate-slide-down" style={{ animationDelay: '0.2s' }} />
          <div className="absolute bottom-20 left-1/4 w-24 h-px bg-white/20 animate-fade-in" style={{ animationDelay: '0.4s' }} />
        </div>

        {/* Breadcrumb */}
        <div className="absolute top-0 left-0 right-0 z-[3]">
          <div className="container-custom py-4">
            <nav className="flex items-center gap-1.5 text-sm text-white/70">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight size={14} className="text-white/40" />
              <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
              <ChevronRight size={14} className="text-white/40" />
              <span className="text-white font-medium truncate max-w-[200px]">{blog.title}</span>
            </nav>
          </div>
        </div>

        {/* Hero Content */}
        <div className="container-custom relative z-[2] pb-12 md:pb-16 w-full animate-slide-up">
          <div className="max-w-3xl">
            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                {blog.tags.map((tag, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/15 backdrop-blur-sm text-white text-sm font-medium rounded-full border border-white/10">
                    <Tag size={12} />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white leading-tight animate-fade-in" style={{ animationDelay: '0.15s' }}>
              {blog.title}
            </h1>

            {/* Excerpt */}
            {blog.excerpt && (
              <p className="mt-5 text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl animate-fade-in" style={{ animationDelay: '0.25s' }}>
                {blog.excerpt}
              </p>
            )}

            {/* Author & Meta */}
            <div className="mt-8 flex items-center gap-4 flex-wrap animate-fade-in" style={{ animationDelay: '0.35s' }}>
              <div className="flex items-center gap-4">
                {/* Author Avatar */}
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-400 to-accent-500 rounded-full flex items-center justify-center text-white font-bold text-lg ring-2 ring-white/20">
                    {blog.author?.full_name?.[0] || 'A'}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-black/50" />
                </div>
                <div>
                  <p className="font-semibold text-white text-lg">
                    {blog.author?.full_name || 'Admin'}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-white/60 mt-0.5">
                    {blog.published_at && (
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {formatDate(blog.published_at)}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} />
                      {readingTime} min read
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[2] animate-bounce hidden md:block">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
            <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
          </svg>
        </div>
      </section>

      {/* Content Section */}
      <div className="container-custom py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          {/* Article Content */}
          <div
            className="prose prose-lg prose-headings:scroll-mt-20 max-w-none
              prose-h2:text-3xl prose-h2:font-display prose-h2:font-bold prose-h2:text-gray-900 prose-h2:mt-12 prose-h2:mb-5 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-100
              prose-h3:text-2xl prose-h3:font-display prose-h3:font-semibold prose-h3:text-gray-900 prose-h3:mt-10 prose-h3:mb-4
              prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-5 prose-p:text-[1.0625rem]
              prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline prose-a:font-medium
              prose-strong:text-gray-900 prose-strong:font-semibold
              prose-blockquote:border-l-4 prose-blockquote:border-primary-500 prose-blockquote:bg-primary-50/50 prose-blockquote:py-3 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:italic prose-blockquote:text-gray-700 prose-blockquote:my-8 prose-blockquote:not-italic
              prose-ul:my-6 prose-ol:my-6
              prose-li:text-gray-600 prose-li:my-1.5 prose-li:leading-relaxed
              prose-img:rounded-2xl prose-img:shadow-lg prose-img:my-8 prose-img:mx-auto prose-img:max-w-full
              prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:shadow-lg prose-pre:my-8
              prose-code:bg-gray-100 prose-code:text-primary-700 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm prose-code:font-medium prose-code:before:content-none prose-code:after:content-none
              [&>p:first-child]:text-xl [&>p:first-child]:text-gray-700 [&>p:first-child]:leading-relaxed
              [&>p:first-child]:first-letter:text-5xl [&>p:first-child]:first-letter:font-display [&>p:first-child]:first-letter:font-bold [&>p:first-child]:first-letter:text-primary-600 [&>p:first-child]:first-letter:float-left [&>p:first-child]:first-letter:mr-3 [&>p:first-child]:first-letter:leading-[0.85]
            "
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(blog.content || '') }}
          />

          {/* Share & Author Section */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary-500/20">
                  {blog.author?.full_name?.[0] || 'A'}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-lg">Written by {blog.author?.full_name || 'Admin'}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Calendar size={14} />
                    {blog.published_at ? formatDate(blog.published_at) : ''}
                    <span className="mx-1">·</span>
                    <Clock size={14} />
                    {readingTime} min read
                  </p>
                </div>
              </div>
              <ShareButton title={blog.title} />
            </div>
          </div>

          {/* Back Link */}
          <div className="mt-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-5 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-primary-600 font-medium rounded-xl transition-all duration-200 group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Back to all posts
            </Link>
          </div>
        </div>
      </div>

      {/* Related Posts */}
      {relatedBlogs.length > 0 && (
        <div className="bg-gradient-to-b from-gray-50 to-white py-16 md:py-20">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900">Related Posts</h2>
                <p className="text-gray-500 mt-1">Continue reading more from our blog</p>
              </div>
              <Link href="/blog" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1.5 group">
                View All
                <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedBlogs.map((related, idx) => (
                <Link key={related.id} href={`/blog/${related.slug}`} className="group animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 h-full">
                    <div className="relative h-52 overflow-hidden">
                      {related.image ? (
                        <SafeImage src={related.image} alt={related.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400">
                          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="p-5">
                      {related.tags && related.tags.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full">
                          <Tag size={10} />
                          {related.tags[0]}
                        </span>
                      )}
                      <h3 className="mt-3 font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 leading-snug">
                        {related.title}
                      </h3>
                      <p className="mt-2 text-sm text-gray-400 flex items-center gap-1.5">
                        <Calendar size={12} />
                        {related.published_at ? formatDate(related.published_at) : ''}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </article>
  )
}

export const revalidate = 60
