import { NextResponse } from 'next/server'

const rateMap = new Map<string, { count: number; resetAt: number }>()

const WINDOW_MS = 60 * 1000
const MAX_REQUESTS = 30

export function rateLimit(ip: string) {
  const now = Date.now()
  const entry = rateMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return null
  }

  if (entry.count >= MAX_REQUESTS) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }

  entry.count++
  return null
}

setInterval(() => {
  const now = Date.now()
  for (const key of Array.from(rateMap.keys())) {
    const value = rateMap.get(key)
    if (value && now > value.resetAt) {
      rateMap.delete(key)
    }
  }
}, 60 * 1000)
