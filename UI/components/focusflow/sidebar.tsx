"use client"

import { motion } from "framer-motion"
import {
  LayoutDashboard,
  CheckSquare,
  Timer,
  StickyNote,
  BarChart3,
  Calendar,
  Music,
  Bot,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  activeSection: string
  setActiveSection: (section: string) => void
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "pomodoro", label: "Pomodoro Timer", icon: Timer },
  { id: "notes", label: "Notes", icon: StickyNote },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "music", label: "Focus Music", icon: Music },
  { id: "assistant", label: "AI Assistant", icon: Bot },
  { id: "settings", label: "Settings", icon: Settings },
]

export function Sidebar({ activeSection, setActiveSection, collapsed, setCollapsed }: SidebarProps) {
  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 288 }}
      className={cn(
        "fixed left-0 top-0 h-screen glass border-r border-border/30 flex flex-col z-50 transition-all",
        collapsed && "cursor-pointer hover:bg-secondary/10"
      )}
      onClick={() => collapsed && setCollapsed(false)}
    >
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-primary">
          <Zap className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h1 className="text-xl font-bold text-gradient">FocusFlow</h1>
            <p className="text-xs text-muted-foreground">Ultimate</p>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeSection === item.id
          
          return (
            <motion.button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                isActive 
                  ? "bg-primary/20 text-primary" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-accent/10 border border-primary/30"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon className={cn("w-5 h-5 relative z-10", isActive && "text-primary")} />
              {!collapsed && (
                <span className="relative z-10 font-medium">{item.label}</span>
              )}
              {isActive && !collapsed && (
                <motion.div
                  className="absolute right-3 w-2 h-2 rounded-full bg-primary"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                />
              )}
            </motion.button>
          )
        })}
      </nav>

      {/* Collapse button */}
      <div className="p-4 border-t border-border/30">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </button>
      </div>

      {/* Pro badge */}
      {!collapsed && (
        <div className="p-4">
          <div className="glass-card rounded-xl p-4 gradient-border">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Pro Member</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Unlimited access to all premium features
            </p>
          </div>
        </div>
      )}
    </motion.aside>
  )
}
