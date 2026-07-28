"use client"

import { motion } from "framer-motion"
import {
  CheckCircle2,
  Clock,
  Target,
  Zap,
  TrendingUp,
  Flame,
  ArrowUpRight,
  Play,
  Quote,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { useAppStore } from "@/lib/store"

const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Success is not final, failure is not fatal.", author: "Winston Churchill" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Great things never come from comfort zones.", author: "Unknown" },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

interface DashboardProps {
  onNavigate: (section: string) => void
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const tasks = useAppStore((s) => s.tasks)
  const sessionsCompleted = useAppStore((s) => s.sessionsCompleted)
  const totalFocusMinutes = useAppStore((s) => s.totalFocusMinutes)
  const currentStreak = useAppStore((s) => s.currentStreak)
  const activityLog = useAppStore((s) => s.activityLog)
  const dailyStats = useAppStore((s) => s.dailyStats)
  const totalXP = useAppStore((s) => s.totalXP)
  const level = useAppStore((s) => s.level)

  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.status === "completed").length
  const focusHours = Math.round((totalFocusMinutes / 60) * 10) / 10
  const productivity = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const statsData = [
    { title: "Total Tasks", value: totalTasks.toString(), change: `${completedTasks} done`, icon: CheckCircle2, color: "from-primary to-accent" },
    { title: "Completed", value: completedTasks.toString(), change: `${productivity}%`, icon: Target, color: "from-green-500 to-emerald-400" },
    { title: "Focus Sessions", value: sessionsCompleted.toString(), change: "sessions", icon: Clock, color: "from-blue-500 to-cyan-400" },
    { title: "Study Hours", value: `${focusHours}h`, change: `${totalFocusMinutes}m`, icon: Zap, color: "from-orange-500 to-yellow-400" },
    { title: "Productivity", value: `${productivity}%`, change: `Lvl ${level}`, icon: TrendingUp, color: "from-pink-500 to-rose-400" },
    { title: "Current Streak", value: currentStreak.toString(), change: "days", icon: Flame, color: "from-red-500 to-orange-400" },
  ]

  // Build weekly chart data from dailyStats
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toISOString().split('T')[0]
    const stat = dailyStats.find((s) => s.date === dateStr)
    return {
      day: days[d.getDay()],
      focus: stat ? Math.round(stat.focusHours * 10) / 10 : 0,
      tasks: stat ? stat.tasksCompleted : 0,
    }
  })

  // Upcoming tasks (not completed, sorted by creation)
  const upcomingTasks = tasks
    .filter((t) => t.status !== "completed")
    .slice(0, 4)

  // Recent activity
  const recentActivity = activityLog.slice(0, 4)

  // Daily goal: focus on 8 sessions target
  const dailyGoal = Math.min(100, Math.round((sessionsCompleted / 8) * 100))
  const todayStat = dailyStats.find((s) => s.date === new Date().toISOString().split('T')[0])
  const todayFocusHours = todayStat ? Math.round(todayStat.focusHours * 10) / 10 : 0

  // Random quote
  const quote = QUOTES[Math.floor(Date.now() / 86400000) % QUOTES.length] // changes daily

  // Greeting based on time
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Welcome section */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{greeting}! 👋</h1>
          <p className="text-muted-foreground mt-1">
            {completedTasks > 0
              ? `You've completed ${completedTasks} task${completedTasks !== 1 ? 's' : ''}. ${totalXP} XP earned!`
              : "Ready to start your productive day? Let's go!"}
          </p>
        </div>
        <motion.button
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-medium glow-primary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate("pomodoro")}
        >
          <Play className="w-5 h-5" />
          Start Focus Session
        </motion.button>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statsData.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              className="glass-card rounded-2xl p-4 border border-border/30 hover:border-primary/30 transition-all group cursor-pointer"
              whileHover={{ scale: 1.02, y: -4 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-muted-foreground">{stat.title}</p>
                <span className="text-xs text-green-400 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" />
                  {stat.change}
                </span>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Weekly Productivity Chart */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-2 glass-card rounded-2xl p-6 border border-border/30"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">Weekly Productivity</h2>
              <p className="text-sm text-muted-foreground">Focus hours and tasks completed</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-muted-foreground">Focus Hours</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent" />
                <span className="text-muted-foreground">Tasks</span>
              </div>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.65 0.2 280)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="oklch(0.65 0.2 280)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="tasksGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.7 0.15 200)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="oklch(0.7 0.15 200)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="oklch(0.5 0.02 270)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.5 0.02 270)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "oklch(0.16 0.02 270 / 0.9)", border: "1px solid oklch(0.3 0.03 270)", borderRadius: "12px", backdropFilter: "blur(12px)" }} />
                <Area type="monotone" dataKey="focus" stroke="oklch(0.65 0.2 280)" strokeWidth={2} fill="url(#focusGradient)" />
                <Area type="monotone" dataKey="tasks" stroke="oklch(0.7 0.15 200)" strokeWidth={2} fill="url(#tasksGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Focus Meter */}
        <motion.div 
          variants={itemVariants}
          className="glass-card rounded-2xl p-6 border border-border/30"
        >
          <h2 className="text-lg font-semibold mb-4">Focus Meter</h2>
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="oklch(0.2 0.02 270)" strokeWidth="8" />
                <motion.circle
                  cx="50" cy="50" r="45" fill="none" stroke="url(#focusMeterGradient)" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={283}
                  initial={{ strokeDashoffset: 283 }}
                  animate={{ strokeDashoffset: 283 * (1 - dailyGoal / 100) }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="focusMeterGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="oklch(0.65 0.2 280)" />
                    <stop offset="100%" stopColor="oklch(0.7 0.15 200)" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-gradient">{dailyGoal}%</span>
                <span className="text-sm text-muted-foreground">Daily Goal</span>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">{todayFocusHours} hours focused today</p>
              <p className="text-xs text-green-400 mt-1">{sessionsCompleted} sessions completed</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Tasks */}
        <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 border border-border/30">
          <h2 className="text-lg font-semibold mb-4">Upcoming Tasks</h2>
          <div className="space-y-3">
            {upcomingTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No pending tasks. Add some!</p>
            ) : (
              upcomingTasks.map((task) => (
                <motion.div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all cursor-pointer group"
                  whileHover={{ x: 4 }}
                >
                  <div className={`w-2 h-2 rounded-full ${
                    task.priority === 'high' ? 'bg-red-500' :
                    task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">{task.status.replace('-', ' ')}</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Motivational Quote */}
        <motion.div 
          variants={itemVariants}
          className="glass-card rounded-2xl p-6 border border-border/30 flex flex-col justify-between gradient-border"
        >
          <Quote className="w-8 h-8 text-primary/50" />
          <div className="my-4">
            <p className="text-lg font-medium italic">{`"${quote.text}"`}</p>
          </div>
          <p className="text-sm text-muted-foreground">— {quote.author}</p>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 border border-border/30">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No activity yet. Start working!</p>
            ) : (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="text-muted-foreground">{activity.action}:</span>{" "}
                      <span className="font-medium">{activity.item}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
