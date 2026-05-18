'use client'

import SafeImage from '@/components/ui/SafeImage'
import { formatDate } from '@/lib/utils'
import { Calendar, ArrowRight } from 'lucide-react'
import type { Blog } from '@/types'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'

interface BlogCardProps {
  blog: Blog
  featured?: boolean
}

export default function BlogCard({ blog, featured }: BlogCardProps) {
  const t = useTranslations('common')

  if (featured) {
    return (
      <Link href={`/blog/${blog.slug}`} className="group block md:row-span-2">
        <div className="relative h-full bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
          <div className="relative h-64 md:h-80 overflow-hidden">
            {blog.image ? (
              <SafeImage
                src={blog.image}
                alt={blog.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary-100 to-accent-100 text-primary-400">
                <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              {blog.tags && blog.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {blog.tags.slice(0, 2).map((tag, i) => (
                    <span key={i} className="px-2.5 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <h2 className="text-xl md:text-2xl font-display font-bold text-white group-hover:text-primary-200 transition-colors line-clamp-2">
                {blog.title}
              </h2>
              {blog.excerpt && (
                <p className="mt-2 text-gray-200 text-sm line-clamp-2 hidden md:block">{blog.excerpt}</p>
              )}
              <div className="mt-3 flex items-center gap-2 text-gray-300 text-sm">
                <Calendar size={14} />
                <span>{blog.published_at ? formatDate(blog.published_at) : ''}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/blog/${blog.slug}`} className="group block">
      <article className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col">
        <div className="relative h-48 overflow-hidden">
          {blog.image ? (
            <SafeImage
              src={blog.image}
              alt={blog.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <div className="p-5 flex-1 flex flex-col">
          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {blog.tags.slice(0, 2).map((tag, i) => (
                <span key={i} className="px-2 py-0.5 bg-primary-50 text-primary-700 text-xs font-medium rounded-md">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200 line-clamp-2 leading-snug">
            {blog.title}
          </h3>

          {blog.excerpt && (
            <p className="mt-2 text-sm text-gray-500 line-clamp-2 flex-1">{blog.excerpt}</p>
          )}

          <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Calendar size={12} />
              <span>{blog.published_at ? formatDate(blog.published_at) : ''}</span>
            </div>
            <span className="text-xs font-medium text-primary-600 group-hover:text-primary-700 flex items-center gap-1 transition-colors">
              {t('readMore')} <ArrowRight size={12} />
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}