// Rate limiting utilities for API endpoints

interface RateLimitStore {
  [key: string]: {
    count: number
    resetAt: number
  }
}

const store: RateLimitStore = {}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

export function checkRateLimit(
  identifier: string,
  limit: number,
  windowMs = 3600000, // 1 hour default
): RateLimitResult {
  const now = Date.now()
  const key = `${identifier}`

  // Clean up expired entries
  if (store[key] && store[key].resetAt < now) {
    delete store[key]
  }

  // Initialize or get current state
  if (!store[key]) {
    store[key] = {
      count: 0,
      resetAt: now + windowMs,
    }
  }

  const current = store[key]

  // Check if limit exceeded
  if (current.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: current.resetAt,
    }
  }

  // Increment counter
  current.count++

  return {
    allowed: true,
    remaining: limit - current.count,
    resetAt: current.resetAt,
  }
}

export function resetRateLimit(identifier: string): void {
  delete store[`${identifier}`]
}
