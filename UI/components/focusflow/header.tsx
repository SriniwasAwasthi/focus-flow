"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Bell,
  User,
  Flame,
  Command,
  Check,
  Settings as SettingsIcon,
  Trash2,
  Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAppStore } from "@/lib/store"
import { playClickSound } from "@/lib/sounds"
import { toast } from "sonner"

export function Header() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileCard, setShowProfileCard] = useState(false)
  
  const theme = useAppStore((s) => s.theme)
  const setTheme = useAppStore((s) => s.setTheme)
  const currentStreak = useAppStore((s) => s.currentStreak)
  const userName = useAppStore((s) => s.userName)
  const setUserName = useAppStore((s) => s.setUserName)
  const activityLog = useAppStore((s) => s.activityLog)
  const level = useAppStore((s) => s.level)
  const totalXP = useAppStore((s) => s.totalXP)

  const [localNameInput, setLocalNameInput] = useState(userName)

  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  const toggleTheme = () => {
    playClickSound()
    const nextTheme = isDark ? 'light' : 'dark'
    setTheme(nextTheme)
    toast.success(`Switched to ${nextTheme === 'dark' ? 'Dark' : 'Light'} Mode`, {
      description: "Visual elements updated instantly."
    })
  }

  useEffect(() => {
    setCurrentTime(new Date())
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  // Count recent activities as notifications (last 10 minutes)
  const recentNotifications = activityLog.slice(0, 5)
  const recentCount = activityLog.filter(a => Date.now() - a.timestamp < 10 * 60 * 1000).length

  const handleSaveProfileName = () => {
    if (!localNameInput.trim()) return
    playClickSound()
    setUserName(localNameInput.trim())
    setShowProfileCard(false)
    toast.success("Profile display name updated!")
  }

  return (
    <header className="glass border-b border-border/30 px-6 py-4 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        {/* Left: Date and Time */}
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs text-muted-foreground font-semibold">
              {currentTime ? formatDate(currentTime) : "Loading..."}
            </p>
            <p className="text-xl font-black font-mono text-gradient mt-0.5">
              {currentTime ? formatTime(currentTime) : "--:--:--"}
            </p>
          </div>
        </div>

        {/* Center: Search Stub */}
        <div className="flex-1 max-w-md mx-8 hidden sm:block">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search tasks, notes, shortcuts..."
              className="w-full pl-11 pr-20 py-2.5 rounded-2xl glass-card border border-border/30 bg-transparent text-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all duration-300"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary/50 text-[10px] font-bold text-muted-foreground">
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Streak Badge */}
          <motion.div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-card border border-border/30 select-none cursor-default"
            whileHover={{ scale: 1.03 }}
          >
            <Flame className="w-4.5 h-4.5 text-orange-500 fill-orange-500 animate-pulse" />
            <span className="font-extrabold text-sm">{currentStreak}</span>
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider hidden md:inline">Day Streak</span>
          </motion.div>

          {/* Dynamic Notifications Bell */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-xl border shadow-sm transition-colors ${showNotifications ? 'bg-primary/10 border-primary text-primary' : 'bg-secondary/20 border-border/10 text-muted-foreground hover:text-foreground'}`}
              onClick={() => { playClickSound(); setShowNotifications(!showNotifications); setShowProfileCard(false); }}
            >
              <Bell className="w-4.5 h-4.5" />
              {recentCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-[9px] font-black flex items-center justify-center text-primary-foreground shadow-[0_0_8px_rgba(168,85,247,0.5)]">
                  {Math.min(recentCount, 9)}
                </span>
              )}
            </Button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-80 glass rounded-2xl border border-border/30 shadow-2xl p-4 z-50 text-foreground"
                >
                  <div className="flex items-center justify-between border-b border-border/10 pb-2 mb-3">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-primary" /> Live Alerts Log
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-lg">
                      {recentCount} Unread
                    </span>
                  </div>

                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {recentNotifications.length === 0 ? (
                      <div className="text-center py-6 text-xs text-muted-foreground font-semibold">
                        No recent focus activities.
                      </div>
                    ) : (
                      recentNotifications.map((act) => (
                        <div key={act.id} className="p-2 rounded-lg bg-secondary/30 border border-border/10 flex flex-col gap-0.5">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-extrabold text-primary capitalize">{act.action}</span>
                            <span className="text-muted-foreground font-mono text-[9px]">{act.time}</span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1 leading-snug">{act.item}</p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>



          {/* User Profile Card Popover */}
          <div className="relative">
            <motion.div
              onClick={() => { playClickSound(); setShowProfileCard(!showProfileCard); setShowNotifications(false); setLocalNameInput(userName); }}
              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border cursor-pointer select-none transition-all duration-300 ${
                showProfileCard ? 'bg-primary/10 border-primary' : 'glass-card border-border/30 hover:border-primary/20'
              }`}
              whileHover={{ scale: 1.01 }}
            >
              <Avatar className="w-7 h-7 border-2 border-primary/50 shrink-0">
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                  <User className="w-3.5 h-3.5" />
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left shrink-0">
                <p className="text-xs font-bold leading-none">{userName}</p>
                <p className="text-[9px] text-muted-foreground font-semibold mt-0.5">Lvl {level} Member</p>
              </div>
            </motion.div>

            <AnimatePresence>
              {showProfileCard && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-72 glass rounded-2xl border border-border/30 shadow-2xl p-4 z-50 text-foreground"
                >
                  <div className="flex flex-col items-center text-center pb-3 border-b border-border/10">
                    <Avatar className="w-14 h-14 border-2 border-primary/50 mb-2">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-lg">
                        <User className="w-6 h-6" />
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-extrabold text-sm text-gradient">{userName}</h3>
                    <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">FocusFlow Pro Scholar</p>
                  </div>

                  {/* Level & XP Progression */}
                  <div className="py-3 border-b border-border/10 space-y-1.5 text-left">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span>Level {level} Progress</span>
                      <span className="font-mono text-[10px] text-muted-foreground">{totalXP} XP</span>
                    </div>
                    <div className="h-2 bg-secondary/50 border border-border/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-accent"
                        style={{ width: `${Math.min(100, (totalXP % 500) / 5)}%` }}
                      />
                    </div>
                  </div>

                  {/* Quick Edit Name Form */}
                  <div className="pt-3 space-y-2.5">
                    <div>
                      <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Quick Edit Name</label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={localNameInput}
                          onChange={(e) => setLocalNameInput(e.target.value)}
                          className="flex-1 px-2.5 py-1.5 rounded-lg bg-secondary/50 border border-border/30 text-xs focus:outline-none focus:border-primary"
                        />
                        <Button
                          size="sm"
                          onClick={handleSaveProfileName}
                          className="h-8 rounded-lg bg-primary text-white text-xs font-bold px-2.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
}
