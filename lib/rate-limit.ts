// Simple in-memory rate limiting
// For production, consider using Redis or a dedicated rate-limiting service

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

const WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const MAX_REQUESTS = 100 // requests per window

export function rateLimit(identifier: string): { success: boolean; remaining: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier)

  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired one
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + WINDOW_MS
    })
    return { success: true, remaining: MAX_REQUESTS - 1 }
  }

  if (entry.count >= MAX_REQUESTS) {
    return { success: false, remaining: 0 }
  }

  entry.count++
  return { success: true, remaining: MAX_REQUESTS - entry.count }
}

export function getRateLimitIdentifier(req: Request): string {
  // Use IP address or user ID for rate limiting
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown'
  return ip
}

// Stricter rate limiting for auth endpoints
export function rateLimitAuth(identifier: string): { success: boolean; remaining: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(`auth:${identifier}`)

  const AUTH_WINDOW_MS = 15 * 60 * 1000 // 15 minutes
  const AUTH_MAX_REQUESTS = 5 // stricter limit for auth

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(`auth:${identifier}`, {
      count: 1,
      resetTime: now + AUTH_WINDOW_MS
    })
    return { success: true, remaining: AUTH_MAX_REQUESTS - 1 }
  }

  if (entry.count >= AUTH_MAX_REQUESTS) {
    return { success: false, remaining: 0 }
  }

  entry.count++
  return { success: true, remaining: AUTH_MAX_REQUESTS - entry.count }
}
