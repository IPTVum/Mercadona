'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface LandingGalleryProps {
  images: string[]
  animationClass: string
  autoplayInterval: number
}

export function LandingGallery({ images, animationClass, autoplayInterval }: LandingGalleryProps) {
  const [active, setActive] = useState(0)
  const [hovered, setHovered] = useState(false)

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % images.length)
  }, [images.length])

  const prev = useCallback(() => {
    setActive((prev) => (prev - 1 + images.length) % images.length)
  }, [images.length])

  useEffect(() => {
    if (autoplayInterval <= 0 || hovered || images.length <= 1) return
    const timer = setInterval(next, autoplayInterval * 1000)
    return () => clearInterval(timer)
  }, [autoplayInterval, hovered, next, images.length])

  if (images.length === 0) return null

  return (
    <div
      className={`relative group overflow-hidden rounded-2xl shadow-2xl ${animationClass}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Images with crossfade */}
      <div className="relative w-full aspect-square">
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover lp-image-morph ${
              i === active ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          />
        ))}
      </div>

      {/* Previous / Next buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-20"
            aria-label="Previous"
          >
            <ChevronLeft size={20} className="text-gray-700" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-20"
            aria-label="Next"
          >
            <ChevronRight size={20} className="text-gray-700" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Go to image ${i + 1}`}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === active
                  ? 'bg-white w-6 shadow'
                  : 'bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}

      {/* Overlay glow */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-amber-500/10 pointer-events-none" />

      {/* Shimmer on hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </div>
  )
}
