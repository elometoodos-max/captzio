import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, Library, Images, CreditCard, LogOut, Crown, Menu, User, BarChart3 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DashboardHeaderProps {
  credits?: number
  isAdmin?: boolean
  userName?: string
}

export function DashboardHeader({ credits = 0, isAdmin = false, userName }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">Captzio</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-4 md:flex">
            <Button variant="ghost" size="sm" asChild className="transition-all hover:scale-105">
              <Link href="/dashboard/library">
                <Library className="mr-2 h-4 w-4" />
                Legendas
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="transition-all hover:scale-105">
              <Link href="/dashboard/images">
                <Images className="mr-2 h-4 w-4" />
                Imagens
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="transition-all hover:scale-105">
              <Link href="/dashboard/stats">
                <BarChart3 className="mr-2 h-4 w-4" />
                Estatísticas
              </Link>
            </Button>
            {isAdmin ? (
              <div className="flex items-center gap-2 rounded-lg border border-accent bg-accent/10 px-3 py-1.5 animate-pulse">
                <Crown className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium">Admin • ∞ créditos</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-1.5 transition-all hover:bg-muted">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{credits} créditos</span>
              </div>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="transition-all hover:scale-105">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Meu Perfil
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="cursor-pointer">
                      <Crown className="mr-2 h-4 w-4" />
                      Painel Admin
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/auth/logout" className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Navigation */}
          <div className="flex items-center gap-2 md:hidden">
            {isAdmin ? (
              <div className="flex items-center gap-1 rounded-full bg-accent px-2 py-1 text-xs font-medium animate-pulse">
                <Crown className="h-3 w-3" />
                <span className="hidden sm:inline">Admin</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/50 px-2 py-1 text-xs">
                <CreditCard className="h-3 w-3 text-muted-foreground" />
                <span className="font-medium">{credits}</span>
              </div>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/library" className="cursor-pointer">
                    <Library className="mr-2 h-4 w-4" />
                    Legendas
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/images" className="cursor-pointer">
                    <Images className="mr-2 h-4 w-4" />
                    Imagens
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/stats" className="cursor-pointer">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Estatísticas
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/buy-credits" className="cursor-pointer">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Comprar Créditos
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer">
                        <Crown className="mr-2 h-4 w-4" />
                        Painel Admin
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/auth/logout" className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
