import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface Task {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  status: 'todo' | 'in-progress' | 'completed'
  tags: string[]
  dueDate: string
  createdAt: string
  completedAt?: string
}

export interface Note {
  id: string
  title: string
  content: string
  color: string
  pinned: boolean
  createdAt: string
}

export interface FocusSession {
  id: string
  type: 'focus' | 'shortBreak' | 'longBreak'
  duration: number // minutes
  completedAt: string
  completed: boolean
}

export interface ActivityItem {
  id: string
  action: string
  item: string
  time: string
  timestamp: number
}

export interface DailyStats {
  date: string
  focusHours: number
  tasksCompleted: number
  sessionsCompleted: number
}

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak'
export type ThemeMode = 'dark' | 'light' | 'system'

// ============================================
// STORE INTERFACE
// ============================================

interface AppStore {
  // --- User ---
  userName: string
  setUserName: (name: string) => void

  // --- Tasks ---
  tasks: Task[]
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void
  deleteTask: (id: string) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  completeTask: (id: string) => void
  moveTask: (id: string, status: Task['status']) => void

  // --- Timer ---
  timerMode: TimerMode
  timerTimeRemaining: number
  timerRunning: boolean
  timerPaused: boolean
  focusDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  sessionsCompleted: number
  totalFocusMinutes: number
  sessionHistory: FocusSession[]
  autoStartBreaks: boolean
  autoStartPomodoros: boolean

  setTimerMode: (mode: TimerMode) => void
  setTimerTimeRemaining: (seconds: number) => void
  startTimer: () => void
  pauseTimer: () => void
  resetTimer: () => void
  tickTimer: () => boolean // returns true if session completed
  completeFocusSession: () => void
  setTimerDurations: (focus: number, shortBreak: number, longBreak: number) => void
  setAutoStartBreaks: (v: boolean) => void
  setAutoStartPomodoros: (v: boolean) => void

  // --- Notes ---
  notes: Note[]
  addNote: (note: Omit<Note, 'id' | 'createdAt'>) => void
  deleteNote: (id: string) => void
  updateNote: (id: string, updates: Partial<Note>) => void
  toggleNotePin: (id: string) => void

  // --- Theme & Settings ---
  theme: ThemeMode
  soundEnabled: boolean
  notificationsEnabled: boolean
  notificationVolume: number
  ambientVolume: number

  setTheme: (theme: ThemeMode) => void
  setSoundEnabled: (v: boolean) => void
  setNotificationsEnabled: (v: boolean) => void
  setNotificationVolume: (v: number) => void
  setAmbientVolume: (v: number) => void

  // --- Streaks ---
  currentStreak: number
  bestStreak: number
  lastActiveDate: string | null
  updateStreak: () => void

  // --- Analytics / Activity ---
  dailyStats: DailyStats[]
  activityLog: ActivityItem[]
  addActivity: (action: string, item: string) => void
  updateDailyStats: (focusMinutes?: number, tasksCompleted?: number, sessions?: number) => void

  // --- XP & Gamification ---
  totalXP: number
  level: number
  addXP: (amount: number) => void

  // --- Bulk ---
  resetAllData: () => void
  seedDefaultData: () => void
  exportData: () => string
  importData: (json: string) => boolean
  vanillaMigrated: boolean
  migrateFromVanilla: () => void
}

// ============================================
// HELPERS
// ============================================

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

function nowISO(): string {
  return new Date().toISOString()
}

function timeAgo(): string {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function calcLevel(xp: number): number {
  // Every 500 XP = 1 level, starting at 1
  return Math.floor(xp / 500) + 1
}

// ============================================
// DEFAULT STATE
// ============================================

// ============================================
// DEFAULT SAMPLE DATA
// ============================================

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

function dateStr(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

function futureDate(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

const defaultTasks: Task[] = [
  {
    id: '1001',
    title: 'Complete React Dashboard UI',
    description: 'Finish building the main dashboard layout with charts and stats cards.',
    priority: 'high',
    status: 'in-progress',
    tags: ['frontend', 'react'],
    dueDate: futureDate(2),
    createdAt: daysAgo(3),
  },
  {
    id: '1002',
    title: 'Write unit tests for API routes',
    description: 'Add Jest tests for all authentication and data endpoints.',
    priority: 'high',
    status: 'todo',
    tags: ['testing', 'backend'],
    dueDate: futureDate(4),
    createdAt: daysAgo(2),
  },
  {
    id: '1003',
    title: 'Design mobile responsive layout',
    description: 'Ensure all pages look great on mobile and tablet screens.',
    priority: 'medium',
    status: 'todo',
    tags: ['design', 'css'],
    dueDate: futureDate(5),
    createdAt: daysAgo(2),
  },
  {
    id: '1004',
    title: 'Set up CI/CD pipeline',
    description: 'Configure GitHub Actions for automatic testing and deployment.',
    priority: 'medium',
    status: 'todo',
    tags: ['devops'],
    dueDate: futureDate(7),
    createdAt: daysAgo(4),
  },
  {
    id: '1005',
    title: 'Research state management patterns',
    description: 'Compare Zustand, Redux Toolkit, and Jotai for the project.',
    priority: 'low',
    status: 'completed',
    tags: ['research'],
    dueDate: dateStr(1),
    createdAt: daysAgo(5),
    completedAt: daysAgo(1),
  },
  {
    id: '1006',
    title: 'Create onboarding flow',
    description: 'Build a 3-step onboarding wizard for new users with animations.',
    priority: 'medium',
    status: 'completed',
    tags: ['ux', 'frontend'],
    dueDate: dateStr(0),
    createdAt: daysAgo(4),
    completedAt: daysAgo(0),
  },
  {
    id: '1007',
    title: 'Optimize bundle size',
    description: 'Analyze and reduce the JavaScript bundle using code splitting.',
    priority: 'low',
    status: 'todo',
    tags: ['performance'],
    dueDate: futureDate(10),
    createdAt: daysAgo(1),
  },
  {
    id: '1008',
    title: 'Fix dark mode color contrast issues',
    description: 'Several text elements have poor contrast in dark mode. Audit and fix.',
    priority: 'high',
    status: 'completed',
    tags: ['accessibility', 'css'],
    dueDate: dateStr(2),
    createdAt: daysAgo(6),
    completedAt: daysAgo(2),
  },
]

const defaultNotes: Note[] = [
  {
    id: '2001',
    title: '📌 Project Architecture Notes',
    content: 'Using Next.js App Router with Zustand for state management.\n\nKey decisions:\n- Server components for static pages\n- Client components for interactive features\n- Zustand persist middleware for localStorage sync\n- Framer Motion for animations',
    color: 'purple',
    pinned: true,
    createdAt: daysAgo(5),
  },
  {
    id: '2002',
    title: '🎨 Design System Colors',
    content: 'Primary: #7c3aed (Violet)\nAccent: #06b6d4 (Cyan)\nSuccess: #10b981 (Emerald)\nWarning: #f59e0b (Amber)\nDanger: #ef4444 (Red)\n\nDark BG: #0a0a1a\nCard BG: rgba(255,255,255,0.05)',
    color: 'blue',
    pinned: true,
    createdAt: daysAgo(4),
  },
  {
    id: '2003',
    title: '💡 Feature Ideas',
    content: '- Drag and drop task reordering\n- Collaborative workspaces\n- AI-powered task suggestions\n- Weekly email digest\n- Integrations with Google Calendar\n- Custom themes marketplace',
    color: 'yellow',
    pinned: false,
    createdAt: daysAgo(3),
  },
  {
    id: '2004',
    title: '📚 Learning Resources',
    content: 'React 19 docs: react.dev\nNext.js 15 docs: nextjs.org/docs\nTailwind v4: tailwindcss.com\nFramer Motion: framer.com/motion\nZustand: github.com/pmndrs/zustand',
    color: 'green',
    pinned: false,
    createdAt: daysAgo(2),
  },
  {
    id: '2005',
    title: '🐛 Bug Tracker',
    content: '✅ Fixed: Timer not resetting after break\n✅ Fixed: Notes color picker not saving\n⬜ TODO: Search not filtering completed tasks\n⬜ TODO: Calendar events overlap on mobile',
    color: 'pink',
    pinned: false,
    createdAt: daysAgo(1),
  },
  {
    id: '2006',
    title: '🏆 Sprint Goals - Week 4',
    content: 'Goals for this sprint:\n1. Complete dashboard analytics charts\n2. Add Pomodoro timer sounds\n3. Implement note search\n4. Deploy to production\n5. Write documentation',
    color: 'purple',
    pinned: false,
    createdAt: daysAgo(0),
  },
]

const defaultSessionHistory: FocusSession[] = [
  { id: '3001', type: 'focus', duration: 25, completedAt: daysAgo(0), completed: true },
  { id: '3002', type: 'shortBreak', duration: 5, completedAt: daysAgo(0), completed: true },
  { id: '3003', type: 'focus', duration: 25, completedAt: daysAgo(0), completed: true },
  { id: '3004', type: 'focus', duration: 25, completedAt: daysAgo(1), completed: true },
  { id: '3005', type: 'shortBreak', duration: 5, completedAt: daysAgo(1), completed: true },
  { id: '3006', type: 'focus', duration: 25, completedAt: daysAgo(1), completed: true },
  { id: '3007', type: 'longBreak', duration: 15, completedAt: daysAgo(1), completed: true },
  { id: '3008', type: 'focus', duration: 25, completedAt: daysAgo(2), completed: true },
  { id: '3009', type: 'focus', duration: 25, completedAt: daysAgo(2), completed: true },
  { id: '3010', type: 'focus', duration: 25, completedAt: daysAgo(3), completed: true },
  { id: '3011', type: 'focus', duration: 25, completedAt: daysAgo(4), completed: true },
  { id: '3012', type: 'focus', duration: 25, completedAt: daysAgo(5), completed: true },
]

const defaultDailyStats: DailyStats[] = [
  { date: dateStr(6), focusHours: 1.5, tasksCompleted: 1, sessionsCompleted: 3 },
  { date: dateStr(5), focusHours: 0.42, tasksCompleted: 1, sessionsCompleted: 1 },
  { date: dateStr(4), focusHours: 0.42, tasksCompleted: 0, sessionsCompleted: 1 },
  { date: dateStr(3), focusHours: 0.42, tasksCompleted: 1, sessionsCompleted: 1 },
  { date: dateStr(2), focusHours: 0.83, tasksCompleted: 1, sessionsCompleted: 2 },
  { date: dateStr(1), focusHours: 1.25, tasksCompleted: 2, sessionsCompleted: 3 },
  { date: dateStr(0), focusHours: 0.83, tasksCompleted: 1, sessionsCompleted: 2 },
]

const defaultActivityLog: ActivityItem[] = [
  { id: '4001', action: 'Completed focus session', item: '25 minutes', time: '08:15 PM', timestamp: Date.now() - 1000 * 60 * 5 },
  { id: '4002', action: 'Completed task', item: 'Create onboarding flow', time: '07:48 PM', timestamp: Date.now() - 1000 * 60 * 30 },
  { id: '4003', action: 'Created note', item: '🏆 Sprint Goals - Week 4', time: '06:30 PM', timestamp: Date.now() - 1000 * 60 * 90 },
  { id: '4004', action: 'Completed focus session', item: '25 minutes', time: '05:55 PM', timestamp: Date.now() - 1000 * 60 * 120 },
  { id: '4005', action: 'Created task', item: 'Optimize bundle size', time: '04:20 PM', timestamp: Date.now() - 1000 * 60 * 200 },
  { id: '4006', action: 'Break completed', item: '5 minutes', time: '03:50 PM', timestamp: Date.now() - 1000 * 60 * 240 },
  { id: '4007', action: 'Completed focus session', item: '25 minutes', time: '03:25 PM', timestamp: Date.now() - 1000 * 60 * 270 },
  { id: '4008', action: 'Created note', item: '🐛 Bug Tracker', time: '02:10 PM', timestamp: Date.now() - 1000 * 60 * 350 },
  { id: '4009', action: 'Completed task', item: 'Fix dark mode color contrast issues', time: '01:30 PM', timestamp: Date.now() - 1000 * 60 * 400 },
  { id: '4010', action: 'Created task', item: 'Complete React Dashboard UI', time: '10:00 AM', timestamp: Date.now() - 1000 * 60 * 600 },
]

const defaultState = {
  userName: 'User',

  tasks: defaultTasks,

  timerMode: 'focus' as TimerMode,
  timerTimeRemaining: 25 * 60,
  timerRunning: false,
  timerPaused: false,
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsCompleted: 12,
  totalFocusMinutes: 300,
  sessionHistory: defaultSessionHistory,
  autoStartBreaks: false,
  autoStartPomodoros: false,

  notes: defaultNotes,

  theme: 'dark' as ThemeMode,
  soundEnabled: true,
  notificationsEnabled: true,
  notificationVolume: 75,
  ambientVolume: 50,

  currentStreak: 5,
  bestStreak: 7,
  lastActiveDate: todayStr(),

  dailyStats: defaultDailyStats,
  activityLog: defaultActivityLog,

  totalXP: 1250,
  level: 3,
  vanillaMigrated: false,
}

// ============================================
// STORE
// ============================================

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...defaultState,

      // --- User ---
      setUserName: (name) => set({ userName: name }),

      // --- Tasks ---
      addTask: (taskData) => {
        const task: Task = {
          ...taskData,
          id: Date.now().toString(),
          createdAt: nowISO(),
        }
        set((s) => ({ tasks: [task, ...s.tasks] }))
        get().addActivity('Created task', task.title)
        get().addXP(10)
      },

      deleteTask: (id) => {
        const task = get().tasks.find((t) => t.id === id)
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }))
        if (task) get().addActivity('Deleted task', task.title)
      },

      updateTask: (id, updates) => {
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }))
      },

      completeTask: (id) => {
        const task = get().tasks.find((t) => t.id === id)
        if (!task) return
        const wasCompleted = task.status === 'completed'
        const newStatus = wasCompleted ? 'todo' : 'completed'

        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? { ...t, status: newStatus, completedAt: wasCompleted ? undefined : nowISO() }
              : t
          ),
        }))

        if (!wasCompleted) {
          get().addActivity('Completed task', task.title)
          get().addXP(25)
          get().updateDailyStats(0, 1, 0)
          get().updateStreak()
        }
      },

      moveTask: (id, status) => {
        const task = get().tasks.find((t) => t.id === id)
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? { ...t, status, completedAt: status === 'completed' ? nowISO() : undefined }
              : t
          ),
        }))
        if (task && status === 'completed') {
          get().addActivity('Completed task', task.title)
          get().addXP(25)
          get().updateDailyStats(0, 1, 0)
          get().updateStreak()
        }
      },

      // --- Timer ---
      setTimerMode: (mode) => {
        const s = get()
        const time =
          mode === 'focus'
            ? s.focusDuration * 60
            : mode === 'shortBreak'
            ? s.shortBreakDuration * 60
            : s.longBreakDuration * 60
        set({ timerMode: mode, timerTimeRemaining: time, timerRunning: false, timerPaused: false })
      },

      setTimerTimeRemaining: (seconds) => set({ timerTimeRemaining: seconds }),

      startTimer: () => set({ timerRunning: true, timerPaused: false }),

      pauseTimer: () => set({ timerRunning: false, timerPaused: true }),

      resetTimer: () => {
        const s = get()
        const time =
          s.timerMode === 'focus'
            ? s.focusDuration * 60
            : s.timerMode === 'shortBreak'
            ? s.shortBreakDuration * 60
            : s.longBreakDuration * 60
        set({ timerTimeRemaining: time, timerRunning: false, timerPaused: false })
      },

      tickTimer: () => {
        const s = get()
        if (!s.timerRunning || s.timerPaused) return false
        const newTime = s.timerTimeRemaining - 1
        if (newTime <= 0) {
          set({ timerTimeRemaining: 0, timerRunning: false, timerPaused: false })
          return true // session completed
        }
        set({ timerTimeRemaining: newTime })
        return false
      },

      completeFocusSession: () => {
        const s = get()
        const session: FocusSession = {
          id: Date.now().toString(),
          type: s.timerMode,
          duration:
            s.timerMode === 'focus'
              ? s.focusDuration
              : s.timerMode === 'shortBreak'
              ? s.shortBreakDuration
              : s.longBreakDuration,
          completedAt: nowISO(),
          completed: true,
        }

        const updates: Partial<AppStore> = {
          sessionHistory: [session, ...s.sessionHistory].slice(0, 50),
        }

        if (s.timerMode === 'focus') {
          updates.sessionsCompleted = s.sessionsCompleted + 1
          updates.totalFocusMinutes = s.totalFocusMinutes + s.focusDuration

          // Switch to break
          const nextSessions = (s.sessionsCompleted + 1) % 4
          const nextMode = nextSessions === 0 ? 'longBreak' : 'shortBreak'
          updates.timerMode = nextMode
          updates.timerTimeRemaining =
            nextMode === 'shortBreak' ? s.shortBreakDuration * 60 : s.longBreakDuration * 60

          // XP & stats
          get().addXP(50)
          get().updateDailyStats(s.focusDuration, 0, 1)
          get().updateStreak()
          get().addActivity('Completed focus session', `${s.focusDuration} minutes`)
        } else {
          // Break completed, back to focus
          updates.timerMode = 'focus'
          updates.timerTimeRemaining = s.focusDuration * 60
          get().addActivity('Break completed', `${session.duration} minutes`)
        }

        set(updates as any)
      },

      setTimerDurations: (focus, shortBreak, longBreak) => {
        const s = get()
        const updates: any = {
          focusDuration: focus,
          shortBreakDuration: shortBreak,
          longBreakDuration: longBreak,
        }
        // If timer is not running, update the time remaining too
        if (!s.timerRunning && !s.timerPaused) {
          if (s.timerMode === 'focus') updates.timerTimeRemaining = focus * 60
          else if (s.timerMode === 'shortBreak') updates.timerTimeRemaining = shortBreak * 60
          else updates.timerTimeRemaining = longBreak * 60
        }
        set(updates)
      },

      setAutoStartBreaks: (v) => set({ autoStartBreaks: v }),
      setAutoStartPomodoros: (v) => set({ autoStartPomodoros: v }),

      // --- Notes ---
      addNote: (noteData) => {
        const note: Note = {
          ...noteData,
          id: Date.now().toString(),
          createdAt: nowISO(),
        }
        set((s) => ({ notes: [note, ...s.notes] }))
        get().addActivity('Created note', note.title)
        get().addXP(5)
      },

      deleteNote: (id) => {
        const note = get().notes.find((n) => n.id === id)
        set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }))
        if (note) get().addActivity('Deleted note', note.title)
      },

      updateNote: (id, updates) => {
        set((s) => ({
          notes: s.notes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
        }))
      },

      toggleNotePin: (id) => {
        set((s) => ({
          notes: s.notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)),
        }))
      },

      // --- Theme & Settings ---
      setTheme: (theme) => set({ theme }),
      setSoundEnabled: (v) => set({ soundEnabled: v }),
      setNotificationsEnabled: (v) => set({ notificationsEnabled: v }),
      setNotificationVolume: (v) => set({ notificationVolume: v }),
      setAmbientVolume: (v) => set({ ambientVolume: v }),

      // --- Streaks ---
      updateStreak: () => {
        const today = todayStr()
        const s = get()
        if (s.lastActiveDate === today) return // already updated today

        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]

        let newStreak = s.currentStreak
        if (s.lastActiveDate === yesterdayStr) {
          newStreak = s.currentStreak + 1
        } else if (s.lastActiveDate !== today) {
          newStreak = 1
        }

        set({
          currentStreak: newStreak,
          bestStreak: Math.max(s.bestStreak, newStreak),
          lastActiveDate: today,
        })
      },

      // --- Analytics / Activity ---
      addActivity: (action, item) => {
        const activity: ActivityItem = {
          id: Date.now().toString(),
          action,
          item,
          time: timeAgo(),
          timestamp: Date.now(),
        }
        set((s) => ({
          activityLog: [activity, ...s.activityLog].slice(0, 100),
        }))
      },

      updateDailyStats: (focusMinutes = 0, tasksCompleted = 0, sessions = 0) => {
        const today = todayStr()
        set((s) => {
          const existing = s.dailyStats.find((d) => d.date === today)
          if (existing) {
            return {
              dailyStats: s.dailyStats.map((d) =>
                d.date === today
                  ? {
                      ...d,
                      focusHours: d.focusHours + focusMinutes / 60,
                      tasksCompleted: d.tasksCompleted + tasksCompleted,
                      sessionsCompleted: d.sessionsCompleted + sessions,
                    }
                  : d
              ),
            }
          }
          return {
            dailyStats: [
              ...s.dailyStats,
              {
                date: today,
                focusHours: focusMinutes / 60,
                tasksCompleted,
                sessionsCompleted: sessions,
              },
            ].slice(-90), // keep last 90 days
          }
        })
      },

      // --- XP ---
      addXP: (amount) => {
        set((s) => {
          const newXP = s.totalXP + amount
          return { totalXP: newXP, level: calcLevel(newXP) }
        })
      },

      // --- Bulk ---
      resetAllData: () => {
        set({ ...defaultState })
      },

      seedDefaultData: () => {
        set({
          tasks: defaultTasks,
          notes: defaultNotes,
          sessionsCompleted: 12,
          totalFocusMinutes: 300,
          sessionHistory: defaultSessionHistory,
          dailyStats: defaultDailyStats,
          activityLog: defaultActivityLog,
          totalXP: 1250,
          level: 3,
          currentStreak: 5,
          bestStreak: 7,
          lastActiveDate: todayStr(),
        })
      },

      exportData: () => {
        const s = get()
        const data = {
          userName: s.userName,
          tasks: s.tasks,
          notes: s.notes,
          sessionsCompleted: s.sessionsCompleted,
          totalFocusMinutes: s.totalFocusMinutes,
          sessionHistory: s.sessionHistory,
          dailyStats: s.dailyStats,
          currentStreak: s.currentStreak,
          bestStreak: s.bestStreak,
          totalXP: s.totalXP,
          focusDuration: s.focusDuration,
          shortBreakDuration: s.shortBreakDuration,
          longBreakDuration: s.longBreakDuration,
          theme: s.theme,
          soundEnabled: s.soundEnabled,
          notificationsEnabled: s.notificationsEnabled,
        }
        return JSON.stringify(data, null, 2)
      },

      importData: (json) => {
        try {
          const data = JSON.parse(json)
          set({
            userName: data.userName ?? defaultState.userName,
            tasks: data.tasks ?? [],
            notes: data.notes ?? [],
            sessionsCompleted: data.sessionsCompleted ?? 0,
            totalFocusMinutes: data.totalFocusMinutes ?? 0,
            sessionHistory: data.sessionHistory ?? [],
            dailyStats: data.dailyStats ?? [],
            currentStreak: data.currentStreak ?? 0,
            bestStreak: data.bestStreak ?? 0,
            totalXP: data.totalXP ?? 0,
            level: calcLevel(data.totalXP ?? 0),
            focusDuration: data.focusDuration ?? 25,
            shortBreakDuration: data.shortBreakDuration ?? 5,
            longBreakDuration: data.longBreakDuration ?? 15,
            theme: data.theme ?? 'dark',
            soundEnabled: data.soundEnabled ?? true,
            notificationsEnabled: data.notificationsEnabled ?? true,
          })
          return true
        } catch {
          return false
        }
      },

      migrateFromVanilla: () => {
        if (typeof window === 'undefined') return
        if (get().vanillaMigrated) return

        const hasVanillaData =
          localStorage.getItem('focusflow_tasks') ||
          localStorage.getItem('focusflow_notes') ||
          localStorage.getItem('focusflow_theme') ||
          localStorage.getItem('focusflow_timer_settings') ||
          localStorage.getItem('focusflow_timer_stats') ||
          localStorage.getItem('focusflow_settings')

        if (!hasVanillaData) return

        // 1. Migrate tasks
        const rawTasks = localStorage.getItem('focusflow_tasks')
        let migratedTasks: Task[] = []
        if (rawTasks) {
          try {
            const parsed = JSON.parse(rawTasks)
            if (Array.isArray(parsed)) {
              migratedTasks = parsed.map((t: any) => ({
                id: (t.id || Date.now()).toString(),
                title: t.text || '',
                description: '',
                priority: (t.priority === 'low' || t.priority === 'medium' || t.priority === 'high') ? t.priority : 'medium',
                status: t.completed ? 'completed' : 'todo',
                tags: [],
                dueDate: new Date().toISOString().split('T')[0],
                createdAt: new Date(t.id || Date.now()).toISOString(),
                completedAt: t.completed ? new Date().toISOString() : undefined,
              }))
            }
          } catch (e) {
            console.error('Failed to parse vanilla tasks', e)
          }
        }

        // 2. Migrate notes
        const rawNotes = localStorage.getItem('focusflow_notes')
        let migratedNotes: Note[] = []
        if (rawNotes) {
          try {
            const parsed = JSON.parse(rawNotes)
            if (Array.isArray(parsed)) {
              migratedNotes = parsed.map((n: any) => ({
                id: (n.id || Date.now()).toString(),
                title: n.title || 'Untitled',
                content: n.content || '',
                color: ['yellow', 'pink', 'blue', 'green', 'purple'].includes(n.color) ? n.color : 'purple',
                pinned: !!n.pinned,
                createdAt: new Date(n.id || Date.now()).toISOString(),
              }))
            }
          } catch (e) {
            console.error('Failed to parse vanilla notes', e)
          }
        }

        // 3. Migrate theme
        const rawTheme = localStorage.getItem('focusflow_theme')
        let themeVal: ThemeMode = get().theme
        if (rawTheme) {
          const parsedTheme = rawTheme.replace(/"/g, '')
          if (parsedTheme === 'dark' || parsedTheme === 'light') {
            themeVal = parsedTheme
          } else if (parsedTheme === 'auto') {
            themeVal = 'system'
          }
        }

        // 4. Migrate timer settings
        const rawTimerSettings = localStorage.getItem('focusflow_timer_settings')
        let focus = get().focusDuration
        let shortBreak = get().shortBreakDuration
        let longBreak = get().longBreakDuration
        if (rawTimerSettings) {
          try {
            const parsed = JSON.parse(rawTimerSettings)
            focus = parsed.focusDuration || focus
            shortBreak = parsed.shortBreakDuration || shortBreak
            longBreak = parsed.longBreakDuration || longBreak
          } catch (e) {
            console.error('Failed to parse vanilla timer settings', e)
          }
        }

        // 5. Migrate timer stats
        const rawTimerStats = localStorage.getItem('focusflow_timer_stats')
        let sessions = get().sessionsCompleted
        let focusMinutes = get().totalFocusMinutes
        if (rawTimerStats) {
          try {
            const parsed = JSON.parse(rawTimerStats)
            sessions = (parsed.sessionsCompleted || 0) + sessions
            focusMinutes = ((parsed.totalStudyTime || 0) * 60) + focusMinutes
          } catch (e) {
            console.error('Failed to parse vanilla timer stats', e)
          }
        }

        // 6. Migrate general settings
        const rawSettings = localStorage.getItem('focusflow_settings')
        let sound = get().soundEnabled
        let notifications = get().notificationsEnabled
        if (rawSettings) {
          try {
            const parsed = JSON.parse(rawSettings)
            sound = parsed.soundEnabled !== false
            notifications = parsed.notificationsEnabled !== false
          } catch (e) {
            console.error('Failed to parse vanilla settings', e)
          }
        }

        // Update the store
        set((s) => {
          const existingTaskIds = new Set(s.tasks.map((t) => t.id))
          const uniqueMigratedTasks = migratedTasks.filter((t) => !existingTaskIds.has(t.id))
          const mergedTasks = [...s.tasks, ...uniqueMigratedTasks]

          const existingNoteIds = new Set(s.notes.map((n) => n.id))
          const uniqueMigratedNotes = migratedNotes.filter((n) => !existingNoteIds.has(n.id))
          const mergedNotes = [...s.notes, ...uniqueMigratedNotes]

          return {
            tasks: mergedTasks,
            notes: mergedNotes,
            theme: themeVal,
            focusDuration: focus,
            shortBreakDuration: shortBreak,
            longBreakDuration: longBreak,
            sessionsCompleted: sessions,
            totalFocusMinutes: focusMinutes,
            soundEnabled: sound,
            notificationsEnabled: notifications,
            vanillaMigrated: true,
          }
        })
      },
    }),
    {
      name: 'focusflow-storage',
      partialize: (state) => {
        // Don't persist runtime-only fields
        const { timerRunning, timerPaused, ...rest } = state
        return rest
      },
    }
  )
)
