'use client'

import Image from 'next/image'
import { useState } from 'react'

interface SafeImageProps {
  src: string | null | undefined
  alt: string
  fill?: boolean
  priority?: boolean
  className?: string
  sizes?: string
}

const ALLOWED_HOSTS = [
  'dpgqxrmumfkxfcittzyr.supabase.co',
  'images.unsplash.com',
]

function isAllowedHost(url: string): boolean {
  try {
    const host = new URL(url).hostname
    return ALLOWED_HOSTS.some((allowed) =>
      host === allowed || host.endsWith('.' + allowed)
    )
  } catch {
    return false
  }
}

export default function SafeImage({ src, alt, fill, priority, className, sizes }: SafeImageProps) {
  const [error, setError] = useState(false)

  if (!src) {
    return (
      <div className={`flex items-center justify-center h-full bg-gray-200 text-gray-400 ${className || ''}`}>
        No Image
      </div>
    )
  }

  if (error || !isAllowedHost(src)) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${fill ? 'absolute inset-0 w-full h-full object-cover' : ''} ${className || ''}`}
        loading={priority ? 'eager' : 'lazy'}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      priority={priority}
      className={className}
      sizes={sizes}
      onError={() => setError(true)}
    />
  )
}
