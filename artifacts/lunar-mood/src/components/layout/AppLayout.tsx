import React from "react"
import { Link, useLocation } from "wouter"
import { motion } from "framer-motion"
import { Home, Calendar as CalendarIcon, BarChart3, Settings, MoonStar } from "lucide-react"
import { useTranslation } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation()
  const { t } = useTranslation()
  const [mobileHoverAccent, setMobileHoverAccent] = React.useState<Record<string, string>>({})

  const pickMobileAccent = React.useCallback((href: string) => {
    const accents = ["#8ef2ff", "#c88cff"]
    const nextAccent = accents[Math.floor(Math.random() * accents.length)]

    setMobileHoverAccent((current) => ({
      ...current,
      [href]: nextAccent,
    }))
  }, [])

  const clearMobileAccent = React.useCallback((href: string) => {
    setMobileHoverAccent((current) => {
      const next = { ...current }
      delete next[href]
      return next
    })
  }, [])

  const navItems = [
    { href: "/dashboard", icon: Home, label: t("home") },
    { href: "/calendar", icon: CalendarIcon, label: t("calendar") },
    { href: "/statistics", icon: BarChart3, label: t("statistics") },
    { href: "/settings", icon: Settings, label: t("settings") },
  ]

  return (
    <div className="app-shell min-h-screen flex flex-col md:flex-row relative overflow-hidden bg-black">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex w-64 flex-col border-r border-white/5 glass-panel z-10 rounded-none h-screen fixed left-0 top-0">
        <div className="p-6 flex items-center gap-3">
          <MoonStar className="w-8 h-8 text-primary" />
          <span className="font-display text-xl font-bold cosmic-gradient-text tracking-wider">Lun4rMood</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href
            return (
              <Link key={item.href} href={item.href} className="block">
                <div
                  className={cn(
                    "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300",
                    isActive 
                      ? "bg-primary/10 text-primary shadow-[0_0_24px_rgba(34,211,238,0.22)] border border-primary/20" 
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="sidebar-active" 
                      className="absolute left-0 w-1 h-8 bg-primary rounded-r-full"
                    />
                  )}
                </div>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="relative z-10 flex-1 md:ml-64 pb-24 md:pb-0 min-h-screen overflow-x-hidden bg-transparent">
        <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </main>

      {/* Bottom Nav (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-panel border-t border-white/10 z-50 px-6 py-4 pb-safe flex justify-between items-center rounded-t-3xl">
        {navItems.map((item) => {
          const isActive = location === item.href
          const hoverAccent = mobileHoverAccent[item.href]
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative p-2"
              onMouseEnter={() => pickMobileAccent(item.href)}
              onMouseLeave={() => clearMobileAccent(item.href)}
              onTouchStart={() => pickMobileAccent(item.href)}
              onTouchEnd={() => clearMobileAccent(item.href)}
              onTouchCancel={() => clearMobileAccent(item.href)}
            >
              <div className="flex flex-col items-center gap-1">
                <item.icon 
                  className={cn(
                    "w-6 h-6 transition-colors duration-300",
                    isActive ? "text-primary drop-shadow-[0_0_12px_rgba(34,211,238,0.45)]" : "text-muted-foreground"
                  )}
                  style={
                    !isActive && hoverAccent
                      ? {
                          color: hoverAccent,
                          filter: `drop-shadow(0 0 10px ${hoverAccent})`,
                        }
                      : undefined
                  }
                />
                <span className={cn(
                  "text-[10px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                  {item.label}
                </span>
                  {isActive && (
                    <motion.div 
                      layoutId="bottom-nav-active"
                      className="absolute -top-1 w-1 h-1 bg-primary rounded-full shadow-[0_0_12px_rgba(34,211,238,0.9)]"
                    />
                  )}
              </div>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
