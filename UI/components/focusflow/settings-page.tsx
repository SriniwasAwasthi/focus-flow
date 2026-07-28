"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Palette,
  Bell,
  Volume2,
  Timer,
  Download,
  Upload,
  Trash2,
  Moon,
  Check,
  User,
  ShieldAlert,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useAppStore } from "@/lib/store"
import { playClickSound } from "@/lib/sounds"
import { toast } from "sonner"

const themeOptions = [
  { id: "dark", label: "Dark Mode", icon: Moon },
]

const accentColors = [
  { name: "Purple (Default)", value: "oklch(0.65 0.2 280)" },
  { name: "Blue", value: "oklch(0.6 0.2 240)" },
  { name: "Cyan", value: "oklch(0.7 0.15 200)" },
  { name: "Green", value: "oklch(0.6 0.18 150)" },
  { name: "Orange", value: "oklch(0.7 0.18 50)" },
  { name: "Pink", value: "oklch(0.65 0.2 350)" },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
}

export function SettingsPage() {
  const store = useAppStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Local settings states (so user can edit and click "Save Changes" to apply)
  const [userName, setUserName] = useState(store.userName)
  const [theme, setTheme] = useState(store.theme)
  const [soundEnabled, setSoundEnabled] = useState(store.soundEnabled)
  const [notificationsEnabled, setNotificationsEnabled] = useState(store.notificationsEnabled)
  const [notificationVolume, setNotificationVolume] = useState(store.notificationVolume)
  const [ambientVolume, setAmbientVolume] = useState(store.ambientVolume)
  
  const [focusDuration, setFocusDuration] = useState(store.focusDuration)
  const [shortBreakDuration, setShortBreakDuration] = useState(store.shortBreakDuration)
  const [longBreakDuration, setLongBreakDuration] = useState(store.longBreakDuration)
  
  const [autoStartBreaks, setAutoStartBreaks] = useState(store.autoStartBreaks)
  const [autoStartPomodoros, setAutoStartPomodoros] = useState(store.autoStartPomodoros)

  const [selectedAccent, setSelectedAccent] = useState(accentColors[0].value)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const handleSaveChanges = () => {
    playClickSound()
    
    // Commit to Zustand store
    store.setUserName(userName)
    store.setTheme(theme)
    store.setSoundEnabled(soundEnabled)
    store.setNotificationsEnabled(notificationsEnabled)
    store.setNotificationVolume(notificationVolume)
    store.setAmbientVolume(ambientVolume)
    store.setTimerDurations(focusDuration, shortBreakDuration, longBreakDuration)
    store.setAutoStartBreaks(autoStartBreaks)
    store.setAutoStartPomodoros(autoStartPomodoros)

    toast.success("Settings saved successfully!", {
      description: "Your configurations have been synced to browser local storage."
    })
  }

  const handleExportData = () => {
    playClickSound()
    try {
      const dataStr = store.exportData()
      const blob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement("a")
      link.href = url
      link.download = `focusflow-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success("Backup downloaded!", {
        description: "Your focus sessions, tasks, and notes are successfully exported."
      })
    } catch {
      toast.error("Failed to export backup")
    }
  }

  const handleImportTrigger = () => {
    playClickSound()
    fileInputRef.current?.click()
  }

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        const success = store.importData(text)
        if (success) {
          toast.success("Data imported successfully!", {
            description: "Refreshing app state..."
          })
          // Reload settings states with new imported store values
          const updatedStore = useAppStore.getState()
          setUserName(updatedStore.userName)
          setTheme(updatedStore.theme)
          setSoundEnabled(updatedStore.soundEnabled)
          setNotificationsEnabled(updatedStore.notificationsEnabled)
          setNotificationVolume(updatedStore.notificationVolume)
          setAmbientVolume(updatedStore.ambientVolume)
          setFocusDuration(updatedStore.focusDuration)
          setShortBreakDuration(updatedStore.shortBreakDuration)
          setLongBreakDuration(updatedStore.longBreakDuration)
          setAutoStartBreaks(updatedStore.autoStartBreaks)
          setAutoStartPomodoros(updatedStore.autoStartPomodoros)
        } else {
          toast.error("Invalid backup file format.")
        }
      } catch {
        toast.error("Failed to parse the backup file.")
      }
    }
    reader.readAsText(file)
  }

  const handleResetApp = () => {
    playClickSound()
    store.resetAllData()
    setShowResetConfirm(false)
    toast.success("All data has been reset to defaults.")
    
    // Reload local variables
    const updatedStore = useAppStore.getState()
    setUserName(updatedStore.userName)
    setTheme(updatedStore.theme)
    setSoundEnabled(updatedStore.soundEnabled)
    setNotificationsEnabled(updatedStore.notificationsEnabled)
    setNotificationVolume(updatedStore.notificationVolume)
    setAmbientVolume(updatedStore.ambientVolume)
    setFocusDuration(updatedStore.focusDuration)
    setShortBreakDuration(updatedStore.shortBreakDuration)
    setLongBreakDuration(updatedStore.longBreakDuration)
    setAutoStartBreaks(updatedStore.autoStartBreaks)
    setAutoStartPomodoros(updatedStore.autoStartPomodoros)
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-4xl"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Preferences Settings</h1>
          <p className="text-muted-foreground mt-1">
            Customize timers, notifications, themes, and personal credentials
          </p>
        </div>
      </motion.div>

      {/* User profile section */}
      <motion.div
        variants={itemVariants}
        className="glass rounded-2xl p-6 border border-border/30"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-secondary/50 border border-border/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">User Profile</h2>
            <p className="text-sm text-muted-foreground">Adjust personalization options</p>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-2 block">Display Name</label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="max-w-md w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border/30 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/10 text-sm font-medium"
            placeholder="Type your name..."
          />
        </div>
      </motion.div>

      {/* Theme Settings */}
      <motion.div
        variants={itemVariants}
        className="glass rounded-2xl p-6 border border-border/30"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-secondary/50 border border-border/10 flex items-center justify-center">
            <Palette className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Appearance</h2>
            <p className="text-sm text-muted-foreground">Customize UI layout and system theme</p>
          </div>
        </div>

        {/* Theme Selector */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-muted-foreground mb-3 block">Color Theme</label>
          <div className="flex flex-col sm:flex-row gap-3">
            {themeOptions.map((opt) => {
              const Icon = opt.icon
              const isActive = theme === opt.id
              return (
                <motion.button
                  key={opt.id}
                  onClick={() => setTheme(opt.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                    isActive
                      ? "bg-primary/10 border-primary text-primary"
                      : "border-border/30 text-muted-foreground hover:border-border/50 hover:bg-secondary/20"
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-semibold text-sm">{opt.label}</span>
                  {isActive && <Check className="w-3.5 h-3.5" />}
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Accent Color */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-3 block">Accent Palette</label>
          <div className="flex flex-wrap gap-3">
            {accentColors.map((color) => (
              <motion.button
                key={color.name}
                onClick={() => setSelectedAccent(color.value)}
                className={`w-9 h-9 rounded-xl transition-all ${
                  selectedAccent === color.value
                    ? "ring-2 ring-primary ring-offset-4 ring-offset-background"
                    : "opacity-80 hover:opacity-100"
                }`}
                style={{ background: color.value }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title={color.name}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Notification Settings */}
      <motion.div
        variants={itemVariants}
        className="glass rounded-2xl p-6 border border-border/30"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-secondary/50 border border-border/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Notifications</h2>
            <p className="text-sm text-muted-foreground">Manage desktop alerts and triggers</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border/10">
            <div>
              <p className="font-semibold text-sm">Desktop Notifications</p>
              <p className="text-xs text-muted-foreground">Enable system push alerts when timers complete</p>
            </div>
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-semibold text-sm">Sound Signals</p>
              <p className="text-xs text-muted-foreground">Enable synthetic chime feedback during events</p>
            </div>
            <Switch
              checked={soundEnabled}
              onCheckedChange={setSoundEnabled}
            />
          </div>
        </div>
      </motion.div>

      {/* Sound Settings */}
      <motion.div
        variants={itemVariants}
        className="glass rounded-2xl p-6 border border-border/30"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-secondary/50 border border-border/10 flex items-center justify-center">
            <Volume2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Audio Mixer</h2>
            <p className="text-sm text-muted-foreground">Configure global volume thresholds</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Timer Notification Volume</label>
              <span className="text-xs font-mono font-bold text-muted-foreground">{notificationVolume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={notificationVolume}
              onChange={(e) => setNotificationVolume(parseInt(e.target.value))}
              className="w-full h-2 rounded-full appearance-none bg-secondary border border-border/10 accent-primary focus:outline-none cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Ambient Music Volume</label>
              <span className="text-xs font-mono font-bold text-muted-foreground">{ambientVolume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={ambientVolume}
              onChange={(e) => setAmbientVolume(parseInt(e.target.value))}
              className="w-full h-2 rounded-full appearance-none bg-secondary border border-border/10 accent-primary focus:outline-none cursor-pointer"
            />
          </div>
        </div>
      </motion.div>

      {/* Timer Customization */}
      <motion.div
        variants={itemVariants}
        className="glass rounded-2xl p-6 border border-border/30"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-secondary/50 border border-border/10 flex items-center justify-center">
            <Timer className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Timer Profiles</h2>
            <p className="text-sm text-muted-foreground">Adjust Pomodoro session durations (minutes)</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Focus Duration", value: focusDuration, setter: setFocusDuration },
            { label: "Short Break", value: shortBreakDuration, setter: setShortBreakDuration },
            { label: "Long Break", value: longBreakDuration, setter: setLongBreakDuration },
          ].map((item, idx) => (
            <div key={idx}>
              <label className="text-xs font-semibold text-muted-foreground mb-2 block">{item.label}</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={item.value}
                  onChange={(e) => item.setter(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border/30 focus:border-primary/50 focus:outline-none text-center font-bold font-mono"
                />
                <span className="text-xs text-muted-foreground font-semibold">min</span>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">Auto-start Breaks</p>
              <p className="text-xs text-muted-foreground">Switch to break and start timer automatically upon completion</p>
            </div>
            <Switch
              checked={autoStartBreaks}
              onCheckedChange={setAutoStartBreaks}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">Auto-start Pomodoros</p>
              <p className="text-xs text-muted-foreground">Begin next focus session instantly after break finishes</p>
            </div>
            <Switch
              checked={autoStartPomodoros}
              onCheckedChange={setAutoStartPomodoros}
            />
          </div>
        </div>
      </motion.div>

      {/* Data Management */}
      <motion.div
        variants={itemVariants}
        className="glass rounded-2xl p-6 border border-border/30"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-secondary/50 border border-border/10 flex items-center justify-center">
            <Download className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Database & Sync</h2>
            <p className="text-sm text-muted-foreground">Manage backup logs, JSON imports, and local databases</p>
          </div>
        </div>

        <input
          type="file"
          accept=".json"
          ref={fileInputRef}
          onChange={handleFileImport}
          className="hidden"
        />

        <div className="flex flex-wrap gap-3">
          <motion.button
            onClick={handleExportData}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-secondary/40 border border-border/30 hover:border-primary/20 hover:bg-secondary/60 text-sm font-semibold transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download className="w-4 h-4 text-primary" />
            Export Backup (.json)
          </motion.button>
          
          <motion.button
            onClick={handleImportTrigger}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-secondary/40 border border-border/30 hover:border-primary/20 hover:bg-secondary/60 text-sm font-semibold transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Upload className="w-4 h-4 text-primary" />
            Import Backup
          </motion.button>
          
          <motion.button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-sm font-semibold transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Trash2 className="w-4 h-4" />
            Reset FocusFlow
          </motion.button>
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.div variants={itemVariants} className="flex justify-end pt-4">
        <motion.button
          onClick={handleSaveChanges}
          className="px-10 py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-300"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Save Changes
        </motion.button>
      </motion.div>

      {/* Reset Confirmation Overlay */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowResetConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass max-w-md w-full p-6 rounded-2xl border border-red-500/30 shadow-2xl relative text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-red-400">Destructive Action</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Are you absolutely sure you want to reset all data? This will permanently wipe your focus history, streak stats, active tasks, and custom notes. This action is irreversible.
              </p>
              <div className="flex gap-3 mt-6">
                <Button
                  variant="ghost"
                  className="flex-1 rounded-xl"
                  onClick={() => setShowResetConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 rounded-xl bg-red-500 text-white hover:bg-red-600"
                  onClick={handleResetApp}
                >
                  Confirm Reset
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
