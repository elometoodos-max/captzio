/**
 * Performance utilities for Captzio
 * Includes caching, debouncing, and optimization helpers
 */

// Simple in-memory cache with TTL
class SimpleCache<T> {
  private cache = new Map<string, { value: T; expires: number }>()

  set(key: string, value: T, ttlMs = 60000): void {
    this.cache.set(key, {
      value,
      expires: Date.now() + ttlMs,
    })
  }

  get(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() > item.expires) {
      this.cache.delete(key)
      return null
    }

    return item.value
  }

  clear(): void {
    this.cache.clear()
  }
}

export const cache = new SimpleCache()

// Debounce function for input handlers
export function debounce<T extends (...args: any[]) => any>(func: T, waitMs: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, waitMs)
  }
}

// Throttle function for scroll/resize handlers
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limitMs: number,
): (...args: Parameters<T>) => void {
  let inThrottle = false

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limitMs)
    }
  }
}

// Lazy load images with Intersection Observer
export function lazyLoadImage(img: HTMLImageElement): void {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLImageElement
          const src = target.dataset.src
          if (src) {
            target.src = src
            target.removeAttribute("data-src")
          }
          observer.unobserve(target)
        }
      })
    },
    {
      rootMargin: "50px",
    },
  )

  observer.observe(img)
}

// Preload critical resources
export function preloadResource(href: string, as: string): void {
  const link = document.createElement("link")
  link.rel = "preload"
  link.href = href
  link.as = as
  document.head.appendChild(link)
}

// Measure performance
export function measurePerformance(name: string, fn: () => void): void {
  const start = performance.now()
  fn()
  const end = performance.now()
  console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`)
}
