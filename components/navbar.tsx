"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, MessageSquare, Mic, Settings, Leaf, Globe, Moon, Sun, Newspaper } from "lucide-react"
import { useTheme } from "next-themes"
import { useApp } from "@/lib/app-context"
import { t, languages, type Language } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const navItems = [
  { key: "dashboard" as const, href: "/", icon: LayoutDashboard },
  { key: "chatbot" as const, href: "/chat", icon: MessageSquare },
  { key: "voice" as const, href: "/voice", icon: Mic },
  { key: "news" as const, href: "/news", icon: Newspaper },
  { key: "settings" as const, href: "/settings", icon: Settings },
]

export function Navbar() {
  const pathname = usePathname()
  const { language, setLanguage } = useApp()
  const { theme, setTheme } = useTheme()

  return (
    <>
      {/* Desktop Navbar */}
      <header className="hidden md:flex sticky top-0 z-50 h-16 items-center border-b border-border bg-card/80 backdrop-blur-md px-6">
        <Link href="/" className="flex items-center gap-2.5 mr-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-tight text-foreground">{t("appName", language)}</span>
            <span className="text-[10px] leading-tight text-muted-foreground">{t("tagline", language)}</span>
          </div>
        </Link>

        <nav className="flex items-center gap-1 flex-1">
          {navItems.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <item.icon className="h-4 w-4" />
                {t(item.key, language)}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                <Globe className="h-4 w-4" />
                <span className="text-xs">{languages.find((l) => l.code === language)?.nativeLabel}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setLanguage(lang.code as Language)}
                  className={cn(language === lang.code && "bg-primary/10 text-primary")}
                >
                  {lang.nativeLabel}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md">
        <div className="flex items-center justify-around py-2 px-2">
          {navItems.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors min-w-[50px]",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                <span className="text-[10px] font-medium">{t(item.key, language)}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}