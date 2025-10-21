import type React from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"

interface DashboardLayoutProps {
  children: React.ReactNode
  credits?: number
  isAdmin?: boolean
  userName?: string
}

export function DashboardLayout({ children, credits = 0, isAdmin = false, userName }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DashboardHeader credits={credits} isAdmin={isAdmin} userName={userName} />

      <div className="flex flex-1 pt-16">
        <DashboardSidebar isAdmin={isAdmin} />

        <main className="flex-1 lg:pl-72 transition-all duration-300">
          <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
