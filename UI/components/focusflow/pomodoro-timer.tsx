"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Volume2,
  VolumeX,
  Coffee,
  Brain,
  Target,
  Clock,
  Sparkles,
  Plus as PlusIcon,
  Minus as MinusIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/store"
import { playNotificationSound, playClickSound } from "@/lib/sounds"
import { showBrowserNotification } from "@/lib/notifications"
import { toast } from "sonner"

export function PomodoroTimer() {
  const {
    timerMode,
    timerTimeRemaining,
    timerRunning,
    timerPaused,
    focusDuration,
    shortBreakDuration,
    longBreakDuration,
    sessionsCompleted,
    totalFocusMinutes,
    sessionHistory,
    soundEnabled,
    notificationsEnabled,
    notificationVolume,
    setTimerMode,
    startTimer,
    pauseTimer,
    resetTimer,
    tickTimer,
    completeFocusSession,
    setTimerDurations,
    setSoundEnabled,
  } = useAppStore()

  const [isZenMode, setIsZenMode] = useState(false)

  // Listen to timer ticks
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (timerRunning) {
      interval = setInterval(() => {
        const completed = tickTimer()
        if (completed) {
          if (soundEnabled) {
            playNotificationSound(notificationVolume / 100)
          }
          if (notificationsEnabled) {
            showBrowserNotification(
              "Timer Completed!",
              timerMode === "focus"
                ? `Excellent work! Time for a well-deserved break.`
                : `Break is over! Let's get back to work.`
            )
          }
          completeFocusSession()
          toast.success("Timer session completed successfully!")
        }
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [timerRunning, timerMode, soundEnabled, notificationVolume, notificationsEnabled, tickTimer, completeFocusSession])

  // ESC key to exit Zen mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isZenMode) {
        setIsZenMode(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isZenMode])

  const toggleTimer = () => {
    playClickSound()
    if (timerRunning) {
      pauseTimer()
      toast.info("Timer paused.")
    } else {
      startTimer()
      toast.success("Timer started!")
    }
  }

  const handleReset = () => {
    playClickSound()
    resetTimer()
    toast.info("Timer reset to default duration.")
  }

  const switchMode = (newMode: "focus" | "shortBreak" | "longBreak") => {
    playClickSound()
    setTimerMode(newMode)
  }

  const getModeTime = useCallback(() => {
    switch (timerMode) {
      case "focus":
        return focusDuration * 60
      case "shortBreak":
        return shortBreakDuration * 60
      case "longBreak":
        return longBreakDuration * 60
    }
  }, [timerMode, focusDuration, shortBreakDuration, longBreakDuration])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Adjust duration directly inside component
  const adjustDuration = (amountMinutes: number) => {
    playClickSound()
    
    let newFocus = focusDuration
    let newShort = shortBreakDuration
    let newLong = longBreakDuration

    if (timerMode === "focus") {
      newFocus = Math.max(1, focusDuration + amountMinutes)
    } else if (timerMode === "shortBreak") {
      newShort = Math.max(1, shortBreakDuration + amountMinutes)
    } else {
      newLong = Math.max(1, longBreakDuration + amountMinutes)
    }

    setTimerDurations(newFocus, newShort, newLong)
    toast.info(`Adjusted current session to ${timerMode === "focus" ? newFocus : timerMode === "shortBreak" ? newShort : newLong} minutes!`)
  }

  // Quick preset switches
  const applyPreset = (minutes: number) => {
    playClickSound()
    
    let newFocus = focusDuration
    let newShort = shortBreakDuration
    let newLong = longBreakDuration

    if (timerMode === "focus") {
      newFocus = minutes
    } else if (timerMode === "shortBreak") {
      newShort = minutes
    } else {
      newLong = minutes
    }

    setTimerDurations(newFocus, newShort, newLong)
    toast.success(`Preset applied: ${minutes} minutes!`)
  }

  const totalDuration = getModeTime()
  const progress = totalDuration > 0 ? ((totalDuration - timerTimeRemaining) / totalDuration) * 100 : 0
  const circumference = 2 * Math.PI * 140

  const modeColors = {
    focus: { gradient: "from-primary to-accent", glow: "glow-primary" },
    shortBreak: { gradient: "from-green-500 to-emerald-400", glow: "glow-accent" },
    longBreak: { gradient: "from-blue-500 to-cyan-400", glow: "glow-accent" },
  }

  return (
    <AnimatePresence mode="wait">
      {isZenMode ? (
        <ZenMode
          timeLeft={timerTimeRemaining}
          isRunning={timerRunning}
          progress={progress}
          mode={timerMode}
          onToggle={toggleTimer}
          onReset={handleReset}
          onExit={() => setIsZenMode(false)}
          formatTime={formatTime}
          onAdjust={adjustDuration}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gradient">Timer Workspace</h1>
              <p className="text-muted-foreground mt-1">
                Deep work session blocks with direct local custom time controllers
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl border border-border/10 bg-secondary/20 hover:bg-secondary/40 text-muted-foreground hover:text-foreground"
                onClick={() => setSoundEnabled(!soundEnabled)}
              >
                {!soundEnabled ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
              <motion.button
                onClick={() => setIsZenMode(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl glass border border-border/30 font-medium hover:border-primary/30 text-foreground transition-all duration-300 animate-fade-in"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Maximize2 className="w-5 h-5 text-primary" />
                Zen Mode
              </motion.button>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="flex justify-center">
            <div className="glass rounded-2xl p-2 border border-border/30 flex gap-2">
              {[
                { id: "focus", label: "Focus Session", icon: Brain },
                { id: "shortBreak", label: "Short Break", icon: Coffee },
                { id: "longBreak", label: "Long Break", icon: Target },
              ].map((item) => {
                const Icon = item.icon
                const isActive = timerMode === item.id
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => switchMode(item.id as any)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                      isActive
                        ? `bg-gradient-to-r ${modeColors[item.id as keyof typeof modeColors].gradient} text-white shadow-lg`
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-semibold text-xs">{item.label}</span>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Main Timer Circle with Direct Time Controllers */}
          <div className="flex flex-col items-center justify-center py-6">
            <motion.div
              className={`relative ${modeColors[timerMode].glow}`}
              animate={{ scale: timerRunning ? [1, 1.015, 1] : 1 }}
              transition={{ repeat: timerRunning ? Infinity : 0, duration: 3, ease: "easeInOut" }}
            >
              <div
                className="absolute inset-0 rounded-full blur-2xl opacity-20 transition-all duration-500"
                style={{
                  background: timerMode === "focus"
                    ? "linear-gradient(135deg, oklch(0.65 0.2 280), oklch(0.7 0.15 200))"
                    : timerMode === "shortBreak"
                    ? "linear-gradient(135deg, oklch(0.6 0.2 150), oklch(0.65 0.18 160))"
                    : "linear-gradient(135deg, oklch(0.6 0.18 220), oklch(0.7 0.15 200))"
                }}
              />

              <svg className="w-80 h-80 -rotate-90" viewBox="0 0 300 300">
                <circle
                  cx="150"
                  cy="150"
                  r="140"
                  fill="none"
                  stroke="oklch(0.2 0.02 270)"
                  strokeWidth="10"
                />
                <motion.circle
                  cx="150"
                  cy="150"
                  r="140"
                  fill="none"
                  stroke="url(#timerGradient)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: circumference - (progress / 100) * circumference }}
                  transition={{ duration: 0.2, ease: "linear" }}
                />
                <defs>
                  <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    {timerMode === "focus" ? (
                      <>
                        <stop offset="0%" stopColor="oklch(0.65 0.2 280)" />
                        <stop offset="100%" stopColor="oklch(0.7 0.15 200)" />
                      </>
                    ) : timerMode === "shortBreak" ? (
                      <>
                        <stop offset="0%" stopColor="oklch(0.6 0.2 150)" />
                        <stop offset="100%" stopColor="oklch(0.65 0.18 160)" />
                      </>
                    ) : (
                      <>
                        <stop offset="0%" stopColor="oklch(0.6 0.18 220)" />
                        <stop offset="100%" stopColor="oklch(0.7 0.15 200)" />
                      </>
                    )}
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  className="text-6xl font-bold font-mono tracking-tight"
                  key={timerTimeRemaining}
                  initial={{ scale: 0.95, opacity: 0.9 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  {formatTime(timerTimeRemaining)}
                </motion.span>
                <span className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase mt-2">
                  {timerMode === "focus" ? "Deep Focus" : timerMode === "shortBreak" ? "Short Break" : "Long Break"}
                </span>
                
                {/* Micro timing buttons right inside the clock display */}
                <div className="flex gap-4 mt-3 bg-secondary/50 rounded-xl px-2.5 py-1 border border-border/10">
                  <button
                    onClick={() => adjustDuration(-1)}
                    className="p-1 hover:text-primary transition-colors text-muted-foreground"
                    title="Decrease 1 minute"
                  >
                    <MinusIcon className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-black font-mono">1m</span>
                  <button
                    onClick={() => adjustDuration(1)}
                    className="p-1 hover:text-primary transition-colors text-muted-foreground"
                    title="Increase 1 minute"
                  >
                    <PlusIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Quick presets & Manual increments directly below clock */}
          <div className="flex flex-col items-center gap-3">
            {/* Quick Adjust Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustDuration(-5)}
                className="rounded-xl border-border/30 hover:border-primary/20 text-xs px-4"
              >
                -5 Minutes
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustDuration(5)}
                className="rounded-xl border-border/30 hover:border-primary/20 text-xs px-4"
              >
                +5 Minutes
              </Button>
            </div>

            {/* Presets Row */}
            <div className="flex items-center gap-2 bg-secondary/20 px-3 py-2 rounded-2xl border border-border/10 text-xs">
              <span className="text-muted-foreground font-semibold">Preset Quick-Bumps:</span>
              <div className="flex gap-1.5">
                {timerMode === "focus" ? (
                  [15, 25, 30, 45, 60].map((t) => (
                    <button
                      key={t}
                      onClick={() => applyPreset(t)}
                      className={`px-2.5 py-1 rounded-lg border font-bold text-[10px] transition-all ${
                        focusDuration === t
                          ? "bg-primary text-white border-primary"
                          : "border-border/30 text-muted-foreground hover:bg-secondary/40"
                      }`}
                    >
                      {t}m
                    </button>
                  ))
                ) : (
                  [3, 5, 10, 15, 20].map((t) => (
                    <button
                      key={t}
                      onClick={() => applyPreset(t)}
                      className={`px-2.5 py-1 rounded-lg border font-bold text-[10px] transition-all ${
                        (timerMode === "shortBreak" ? shortBreakDuration : longBreakDuration) === t
                          ? "bg-primary text-white border-primary"
                          : "border-border/30 text-muted-foreground hover:bg-secondary/40"
                      }`}
                    >
                      {t}m
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Play/Pause Controls */}
          <div className="flex justify-center gap-4 pt-2">
            <motion.button
              onClick={handleReset}
              className="p-4 rounded-2xl glass border border-border/30 text-muted-foreground hover:text-foreground transition-colors hover:border-primary/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw className="w-6 h-6" />
            </motion.button>

            <motion.button
              onClick={toggleTimer}
              className={`px-14 py-4 rounded-2xl bg-gradient-to-r ${modeColors[timerMode].gradient} text-white font-semibold text-lg hover:shadow-lg transition-all duration-300 ${modeColors[timerMode].glow}`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {timerRunning ? (
                <span className="flex items-center gap-2">
                  <Pause className="w-6 h-6 fill-white" />
                  Pause
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Play className="w-6 h-6 fill-white" />
                  Start Focus
                </span>
              )}
            </motion.button>
          </div>

          {/* Stats and History */}
          <div className="grid lg:grid-cols-2 gap-6 mt-8">
            {/* Session Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-6 border border-border/30"
            >
              <h2 className="text-lg font-semibold mb-4 text-gradient flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Today's Timer Summary
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-secondary/30 border border-border/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-5 h-5 text-primary" />
                    <span className="text-xs text-muted-foreground font-semibold">Sessions Done</span>
                  </div>
                  <p className="text-2xl font-bold">{sessionsCompleted}</p>
                </div>
                <div className="p-4 rounded-xl bg-secondary/30 border border-border/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-accent" />
                    <span className="text-xs text-muted-foreground font-semibold">Total Focused</span>
                  </div>
                  <p className="text-2xl font-bold">{totalFocusMinutes}m</p>
                </div>
                <div className="p-4 rounded-xl bg-secondary/30 border border-border/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Coffee className="w-5 h-5 text-green-400" />
                    <span className="text-xs text-muted-foreground font-semibold">Daily Target</span>
                  </div>
                  <p className="text-2xl font-bold">4 Sessions</p>
                </div>
                <div className="p-4 rounded-xl bg-secondary/30 border border-border/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-yellow-400" />
                    <span className="text-xs text-muted-foreground font-semibold">Progress</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {Math.min(100, Math.round((sessionsCompleted / 4) * 100))}%
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Session History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-6 border border-border/30 flex flex-col"
            >
              <h2 className="text-lg font-semibold mb-4 text-gradient flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Session History
              </h2>
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 flex-1">
                {sessionHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-center">
                    <p className="text-sm text-muted-foreground">No sessions completed yet.</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Start the timer to begin your journey!</p>
                  </div>
                ) : (
                  sessionHistory.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/10"
                    >
                      <div className="flex items-center gap-3">
                        {session.type === "focus" ? (
                          <Brain className="w-4 h-4 text-primary" />
                        ) : (
                          <Coffee className="w-4 h-4 text-green-400" />
                        )}
                        <div>
                          <p className="text-sm font-bold capitalize">
                            {session.type === "focus" ? "Focus Session" : session.type === "shortBreak" ? "Short Break" : "Long Break"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(session.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground font-mono">{session.duration} min</span>
                        {session.completed && (
                          <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ZenMode({
  timeLeft,
  isRunning,
  progress,
  mode,
  onToggle,
  onReset,
  onExit,
  formatTime,
  onAdjust,
}: {
  timeLeft: number
  isRunning: boolean
  progress: number
  mode: string
  onToggle: () => void
  onReset: () => void
  onExit: () => void
  formatTime: (seconds: number) => string
  onAdjust: (min: number) => void
}) {
  const circumference = 2 * Math.PI * 180

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background z-50 flex items-center justify-center"
    >
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute w-[600px] h-[600px] rounded-full floating-orb opacity-10"
          style={{
            background: 'radial-gradient(circle, oklch(0.5 0.2 280 / 0.4) 0%, transparent 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Large Timer */}
        <motion.div
          className="relative"
          animate={{ scale: isRunning ? [1, 1.015, 1] : 1 }}
          transition={{ repeat: isRunning ? Infinity : 0, duration: 3, ease: "easeInOut" }}
        >
          <svg className="w-[400px] h-[400px] -rotate-90" viewBox="0 0 400 400">
            <circle
              cx="200"
              cy="200"
              r="180"
              fill="none"
              stroke="oklch(0.2 0.02 270)"
              strokeWidth="6"
            />
            <motion.circle
              cx="200"
              cy="200"
              r="180"
              fill="none"
              stroke="url(#zenGradient)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset: circumference - (progress / 100) * circumference }}
              transition={{ duration: 0.2, ease: "linear" }}
            />
            <defs>
              <linearGradient id="zenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="oklch(0.65 0.2 280)" />
                <stop offset="100%" stopColor="oklch(0.7 0.15 200)" />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-8xl font-bold font-mono tracking-tight text-gradient">{formatTime(timeLeft)}</span>
            <span className="text-lg text-muted-foreground font-semibold uppercase tracking-wider mt-4">
              {mode === "focus" ? "Deep Focus" : mode === "shortBreak" ? "Short Break" : "Long Break"}
            </span>

            {/* Time Adjusters inside Zen Mode */}
            <div className="flex gap-4 mt-4 bg-secondary/40 rounded-xl px-3 py-1.5 border border-border/10">
              <button
                onClick={() => onAdjust(-1)}
                className="hover:text-primary transition-colors text-muted-foreground p-0.5"
              >
                <MinusIcon className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold font-mono">1m</span>
              <button
                onClick={() => onAdjust(1)}
                className="hover:text-primary transition-colors text-muted-foreground p-0.5"
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Controls */}
        <div className="flex gap-6 mt-10">
          <motion.button
            onClick={onReset}
            className="p-5 rounded-2xl glass border border-border/30 hover:border-primary/20 text-muted-foreground hover:text-foreground transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw className="w-8 h-8" />
          </motion.button>

          <motion.button
            onClick={onToggle}
            className="px-16 py-5 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-semibold text-xl glow-primary shadow-lg"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {isRunning ? (
              <span className="flex items-center gap-3">
                <Pause className="w-8 h-8 fill-white" />
                Pause
              </span>
            ) : (
              <span className="flex items-center gap-3">
                <Play className="w-8 h-8 fill-white" />
                Start Focus
              </span>
            )}
          </motion.button>
        </div>

        {/* Exit button */}
        <motion.button
          onClick={onExit}
          className="mt-10 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium tracking-wide flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
        >
          Press <kbd className="px-1.5 py-0.5 rounded bg-secondary text-xs">ESC</kbd> or click to exit Zen Mode
        </motion.button>
      </div>
    </motion.div>
  )
}
