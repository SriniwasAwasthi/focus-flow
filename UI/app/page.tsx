"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/focusflow/sidebar"
import { Header } from "@/components/focusflow/header"
import { Dashboard } from "@/components/focusflow/dashboard"
import { Tasks } from "@/components/focusflow/tasks"
import { PomodoroTimer } from "@/components/focusflow/pomodoro-timer"
import { Notes } from "@/components/focusflow/notes"
import { AnalyticsPage } from "@/components/focusflow/analytics-page"
import { SettingsPage } from "@/components/focusflow/settings-page"
import { CalendarPage } from "@/components/focusflow/calendar-page"
import { MusicPage } from "@/components/focusflow/music-page"
import { AIAssistantPage } from "@/components/focusflow/ai-assistant-page"
import { BackgroundOrbs } from "@/components/focusflow/background-orbs"
import { useAppStore } from "@/lib/store"
import { requestNotificationPermission } from "@/lib/notifications"

export default function FocusFlowApp() {
  const [activeSection, setActiveSection] = useState("dashboard")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const theme = useAppStore((s) => s.theme)
  const migrateFromVanilla = useAppStore((s) => s.migrateFromVanilla)
  const tasks = useAppStore((s) => s.tasks)
  const notes = useAppStore((s) => s.notes)
  const seedDefaultData = useAppStore((s) => s.seedDefaultData)

  // Seed default data if store is empty (fresh load or cleared local storage)
  useEffect(() => {
    if (tasks.length === 0 && notes.length === 0) {
      seedDefaultData()
    }
  }, [tasks, notes, seedDefaultData])

  // Run vanilla data migration on client side mount
  useEffect(() => {
    migrateFromVanilla()
  }, [migrateFromVanilla])

  // Apply theme class
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'light') {
      root.classList.remove('dark')
    } else {
      // system
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) root.classList.add('dark')
      else root.classList.remove('dark')
    }
  }, [theme])

  // Request notification permission on mount and bind shortcuts
  useEffect(() => {
    requestNotificationPermission()
    // Apply dark class on first load
    document.documentElement.classList.add('dark')

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault()
        setSidebarCollapsed((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard onNavigate={setActiveSection} />
      case "tasks":
        return <Tasks />
      case "pomodoro":
        return <PomodoroTimer />
      case "notes":
        return <Notes />
      case "analytics":
        return <AnalyticsPage />
      case "calendar":
        return <CalendarPage />
      case "music":
        return <MusicPage />
      case "assistant":
        return <AIAssistantPage />
      case "settings":
        return <SettingsPage />
      default:
        return <Dashboard onNavigate={setActiveSection} />
    }
  }

  return (
    <div className="min-h-screen animated-gradient relative overflow-hidden">
      {/* Background floating orbs */}
      <BackgroundOrbs />
      
      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar */}
        <Sidebar 
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />
        
        {/* Main content area */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-72'}`}>
          {/* Header */}
          <Header />
          
          {/* Dynamic content */}
          <main className="flex-1 p-6 overflow-y-auto">
            {renderContent()}
          </main>
          
          {/* Footer status bar */}
          <footer className="glass border-t border-border/30 px-6 py-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  System Online
                </span>
                <span>v2.0.0</span>
              </div>
              <div className="flex items-center gap-4">
                <span>Focus Mode: Active</span>
                <span>Local Storage</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}
