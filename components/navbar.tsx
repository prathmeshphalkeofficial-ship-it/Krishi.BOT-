"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import Image from "next/image"
import {
  LayoutDashboard, MessageSquare, Mic, Settings,
  Globe, Moon, Sun, Newspaper, Sprout, Microscope,
  FlaskConical, MoreHorizontal, X
} from "lucide-react"
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

type NavLabel = { en: string; hi: string; mr: string }

interface NavItem {
  href: string
  icon: React.ElementType
  label: NavLabel
  i18nKey?: string
}

const desktopNavItems: NavItem[] = [
  { href: "/",         icon: LayoutDashboard, label: { en: "Dashboard",  hi: "डैशबोर्ड",          mr: "डॅशबोर्ड"       }, i18nKey: "dashboard" },
  { href: "/chat",     icon: MessageSquare,   label: { en: "Chat",       hi: "चैट",               mr: "चॅट"            }, i18nKey: "chatbot"   },
  { href: "/news",     icon: Newspaper,       label: { en: "News",       hi: "समाचार",            mr: "बातम्या"        }, i18nKey: "news"      },
  { href: "/voice",    icon: Mic,             label: { en: "Voice",      hi: "आवाज़",             mr: "आवाज"           }, i18nKey: "voice"     },
  { href: "/spraying", icon: Sprout,          label: { en: "Spraying",   hi: "छिड़काव",           mr: "फवारणी"         } },
  { href: "/disease",  icon: Microscope,      label: { en: "Disease",    hi: "रोग पहचान",        mr: "रोग ओळख"        } },
  { href: "/soil",     icon: FlaskConical,    label: { en: "Soil Health",hi: "मिट्टी स्वास्थ्य", mr: "माती आरोग्य"    } },
  { href: "/settings", icon: Settings,        label: { en: "Settings",   hi: "सेटिंग",            mr: "सेटिंग"         }, i18nKey: "settings"  },
]

const mobileMainTabs: NavItem[] = [
  { href: "/",        icon: LayoutDashboard, label: { en: "Home",    hi: "होम",    mr: "होम"     }, i18nKey: "dashboard" },
  { href: "/chat",    icon: MessageSquare,   label: { en: "Chat",    hi: "चैट",    mr: "चॅट"    }, i18nKey: "chatbot"   },
  { href: "/news",    icon: Newspaper,       label: { en: "News",    hi: "समाचार", mr: "बातम्या" }, i18nKey: "news"      },
  { href: "/disease", icon: Microscope,      label: { en: "Disease", hi: "रोग",    mr: "रोग"    } },
  { href: "/soil",    icon: FlaskConical,    label: { en: "Soil",    hi: "मिट्टी", mr: "माती"   } },
]

const mobileMoreItems: NavItem[] = [
  { href: "/voice",    icon: Mic,      label: { en: "Voice",    hi: "आवाज़",  mr: "आवाज"   }, i18nKey: "voice"    },
  { href: "/spraying", icon: Sprout,   label: { en: "Spraying", hi: "छिड़काव", mr: "फवारणी" } },
  { href: "/settings", icon: Settings, label: { en: "Settings", hi: "सेटिंग", mr: "सेटिंग" }, i18nKey: "settings" },
]

export function Navbar() {
  const pathname = usePathname()
  const { language, setLanguage } = useApp()
  const { theme, setTheme } = useTheme()
  const [moreOpen, setMoreOpen] = useState(false)

  const getLabel = (item: NavItem): string => {
    if (item.i18nKey) return t(item.i18nKey as never, language)
    return item.label[language as "en" | "hi" | "mr"] || item.label.en
  }

  const isMoreActive = mobileMoreItems.some((item) =>
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
  )

  return (
    <>
      {/* ── Desktop Navbar ── */}
      <header className="hidden md:flex sticky top-0 z-50 h-16 items-center border-b border-border bg-card/80 backdrop-blur-md px-6">
        <Link href="/" className="flex items-center gap-2.5 mr-8 flex-shrink-0">
          <div className="relative h-9 w-9 flex-shrink-0">
            <Image
              src="/krishibot-logo.png"
              alt="KrishiBot Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-tight text-foreground">{t("appName", language)}</span>
            <span className="text-[10px] leading-tight text-muted-foreground">{t("tagline", language)}</span>
          </div>
        </Link>

        <nav className="flex items-center gap-1 flex-1 flex-wrap">
          {desktopNavItems.map((item, i) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
            return (
              <Link
                key={i}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <item.icon className="h-4 w-4" />
                {getLabel(item)}
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

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md">

        {/* More drawer */}
        {moreOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setMoreOpen(false)} />
            <div className="absolute bottom-full left-0 right-0 z-50 bg-card border-t border-border rounded-t-2xl p-4 shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-foreground">
                  {language === "hi" ? "और विकल्प" : language === "mr" ? "आणखी पर्याय" : "More Options"}
                </span>
                <button onClick={() => setMoreOpen(false)} className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {mobileMoreItems.map((item, i) => {
                  const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
                  return (
                    <Link
                      key={i}
                      href={item.href}
                      onClick={() => setMoreOpen(false)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-colors",
                        isActive
                          ? "bg-primary/10 border-primary/30 text-primary"
                          : "bg-secondary border-border text-muted-foreground"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="text-[10px] font-medium">{getLabel(item)}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </>
        )}

        {/* Main 5 tabs */}
        <div className="flex items-center justify-around py-2 px-1">
          {mobileMainTabs.map((item, i) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
            return (
              <Link
                key={i}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg transition-colors min-w-[52px]",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                <span className="text-[9px] font-medium leading-tight text-center">{getLabel(item)}</span>
              </Link>
            )
          })}

          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className={cn(
              "flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg transition-colors min-w-[52px]",
              isMoreActive || moreOpen ? "text-primary" : "text-muted-foreground"
            )}
          >
            <MoreHorizontal className={cn("h-5 w-5", (isMoreActive || moreOpen) && "text-primary")} />
            <span className="text-[9px] font-medium">
              {language === "hi" ? "और" : language === "mr" ? "आणखी" : "More"}
            </span>
          </button>
        </div>
      </nav>
    </>
  )
}