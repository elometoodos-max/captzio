"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  MessageSquare,
  ImageIcon,
  Library,
  CreditCard,
  Settings,
  TrendingUp,
  Wand2,
  Trophy,
  Shield,
} from "lucide-react"

interface DashboardSidebarProps {
  isAdmin?: boolean
}

export function DashboardSidebar({ isAdmin }: DashboardSidebarProps) {
  const pathname = usePathname()

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Gerar Legenda",
      href: "/dashboard/generate-caption",
      icon: MessageSquare,
    },
    {
      name: "Gerar Imagem",
      href: "/dashboard/generate-image",
      icon: ImageIcon,
    },
    {
      name: "Biblioteca",
      href: "/dashboard/library",
      icon: Library,
    },
    {
      name: "Estilo de Marca",
      href: "/dashboard/brand-style",
      icon: Wand2,
    },
    {
      name: "Conquistas",
      href: "/dashboard/achievements",
      icon: Trophy,
    },
    {
      name: "Estatísticas",
      href: "/dashboard/stats",
      icon: TrendingUp,
    },
    {
      name: "Comprar Créditos",
      href: "/dashboard/buy-credits",
      icon: CreditCard,
    },
    {
      name: "Configurações",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ]

  const adminNavigation = [
    {
      name: "Admin Dashboard",
      href: "/dashboard/admin",
      icon: Shield,
    },
  ]

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-border bg-background px-6 pb-4">
        <nav className="flex flex-1 flex-col pt-8">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                        {item.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </li>
            {isAdmin && (
              <li>
                <div className="text-xs font-semibold leading-6 text-muted-foreground">Administração</div>
                <ul role="list" className="-mx-2 mt-2 space-y-1">
                  {adminNavigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={cn(
                            "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 transition-colors",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground",
                          )}
                        >
                          <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                          {item.name}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </aside>
  )
}
