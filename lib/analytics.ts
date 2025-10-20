/**
 * Analytics and monitoring utilities for Captzio
 * Track user behavior and system performance
 */

interface AnalyticsEvent {
  name: string
  properties?: Record<string, any>
  timestamp: number
}

class Analytics {
  private events: AnalyticsEvent[] = []
  private sessionId: string

  constructor() {
    this.sessionId = this.generateSessionId()
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  track(name: string, properties?: Record<string, any>): void {
    const event: AnalyticsEvent = {
      name,
      properties,
      timestamp: Date.now(),
    }

    this.events.push(event)

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log("[Analytics]", event)
    }

    // In production, send to analytics service
    // this.sendToAnalytics(event)
  }

  trackPageView(path: string): void {
    this.track("page_view", { path })
  }

  trackError(error: Error, context?: Record<string, any>): void {
    this.track("error", {
      message: error.message,
      stack: error.stack,
      ...context,
    })
  }

  trackPerformance(metric: string, value: number): void {
    this.track("performance", {
      metric,
      value,
      unit: "ms",
    })
  }

  getSessionId(): string {
    return this.sessionId
  }

  getEvents(): AnalyticsEvent[] {
    return [...this.events]
  }

  clearEvents(): void {
    this.events = []
  }
}

export const analytics = new Analytics()

// Track Web Vitals
export function trackWebVitals(): void {
  if (typeof window === "undefined") return

  // Track First Contentful Paint
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === "paint" && entry.name === "first-contentful-paint") {
        analytics.trackPerformance("FCP", entry.startTime)
      }
    }
  })

  try {
    observer.observe({ entryTypes: ["paint"] })
  } catch (e) {
    // Browser doesn't support Performance Observer
  }
}
