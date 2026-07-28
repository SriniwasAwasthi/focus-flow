"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  ListTodo,
  FileText,
  Sparkles,
} from "lucide-react"
import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { playClickSound } from "@/lib/sounds"
import { toast } from "sonner"

const noteColors = [
  { name: "💡 Ideas", value: "from-purple-500/20 to-purple-600/10 border-purple-500/30" },
  { name: "📅 Meetings", value: "from-blue-500/20 to-blue-600/10 border-blue-500/30" },
  { name: "📚 Studies", value: "from-cyan-500/20 to-cyan-600/10 border-cyan-500/30" },
  { name: "✅ Tasks", value: "from-green-500/20 to-green-600/10 border-green-500/30" },
  { name: "⭐ Goals", value: "from-yellow-500/20 to-yellow-600/10 border-yellow-500/30" },
  { name: "❤️ Inspirations", value: "from-pink-500/20 to-pink-600/10 border-pink-500/30" },
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

export function CalendarPage() {
  const { tasks, completeTask, addTask, addNote } = useAppStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  
  // Modal states
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [activeTab, setActiveTab] = useState<"view" | "addTask" | "addNote">("view")

  // Form states for creating items inside calendar
  const [taskTitle, setTaskTitle] = useState("")
  const [taskDesc, setTaskDesc] = useState("")
  const [taskPriority, setTaskPriority] = useState<"low" | "medium" | "high">("medium")

  const [noteTitle, setNoteTitle] = useState("")
  const [noteContent, setNoteContent] = useState("")
  const [noteColor, setNoteColor] = useState(noteColors[0].value)

  // Calendar calculations
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startDayOfWeek = firstDayOfMonth.getDay()

  const prevMonthDaysCount = new Date(year, month, 0).getDate()

  const calendarDays: { date: Date; isCurrentMonth: boolean }[] = []

  // Add leading days
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    calendarDays.push({
      date: new Date(year, month - 1, prevMonthDaysCount - i),
      isCurrentMonth: false,
    })
  }

  // Add current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      date: new Date(year, month, i),
      isCurrentMonth: true,
    })
  }

  // Add trailing days
  const totalDaysAdded = calendarDays.length
  const trailingDaysCount = 42 - totalDaysAdded
  for (let i = 1; i <= trailingDaysCount; i++) {
    calendarDays.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false,
    })
  }

  const handlePrevMonth = () => {
    playClickSound()
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    playClickSound()
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    }
  }

  const getDayTasks = (date: Date) => {
    const compareStr = date.toISOString().split("T")[0]
    return tasks.filter((t) => t.dueDate === compareStr)
  }

  const handleDayClick = (date: Date) => {
    playClickSound()
    setSelectedDate(date)
    setActiveTab("view")
    
    // Reset forms
    setTaskTitle("")
    setTaskDesc("")
    setTaskPriority("medium")
    setNoteTitle("")
    setNoteContent("")
    setNoteColor(noteColors[0].value)
  }

  const handleCreateTask = () => {
    if (!taskTitle.trim() || !selectedDate) return
    playClickSound()
    const targetDateStr = selectedDate.toISOString().split("T")[0]

    addTask({
      title: taskTitle,
      description: taskDesc,
      priority: taskPriority,
      status: "todo",
      dueDate: targetDateStr,
      tags: ["Calendar"],
    })

    toast.success("Task scheduled successfully!", {
      description: `Scheduled for ${selectedDate.toLocaleDateString()}`
    })

    // Return to view list
    setActiveTab("view")
    setTaskTitle("")
    setTaskDesc("")
  }

  const handleCreateNote = () => {
    if (!noteTitle.trim() || !selectedDate) return
    playClickSound()
    const dateFormatted = selectedDate.toLocaleDateString([], { month: "short", day: "numeric" })

    addNote({
      title: `[${dateFormatted}] ${noteTitle}`,
      content: noteContent,
      color: noteColor,
      pinned: false,
    })

    toast.success("Workspace note saved!", {
      description: "Note automatically linked to calendar date."
    })

    setActiveTab("view")
    setNoteTitle("")
    setNoteContent("")
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const activeDateTasks = selectedDate ? getDayTasks(selectedDate) : []
  const selectedDateStr = selectedDate
    ? selectedDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : ""

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Study Calendar Workspace</h1>
          <p className="text-muted-foreground mt-1">
            Tap any date to schedule high-priority tasks and notes directly in your calendar grid
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevMonth}
            className="rounded-xl border border-border/10 bg-secondary/20 hover:bg-secondary/40 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-lg font-bold font-mono min-w-[150px] text-center bg-secondary/30 px-4 py-2 rounded-xl border border-border/10">
            {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextMonth}
            className="rounded-xl border border-border/10 bg-secondary/20 hover:bg-secondary/40 text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </motion.div>

      {/* Grid calendar */}
      <motion.div
        variants={itemVariants}
        className="glass rounded-3xl p-6 border border-border/30 overflow-x-auto shadow-xl"
      >
        <div className="min-w-[700px]">
          {/* Days of week */}
          <div className="grid grid-cols-7 gap-2 mb-4 text-center">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-xs font-bold text-muted-foreground uppercase tracking-wider py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((dayItem, index) => {
              const dayTasks = getDayTasks(dayItem.date)
              const hasTasks = dayTasks.length > 0
              const dayIsToday = isToday(dayItem.date)

              return (
                <motion.div
                  key={index}
                  onClick={() => handleDayClick(dayItem.date)}
                  className={`min-h-[115px] p-3 rounded-2xl border flex flex-col justify-between cursor-pointer transition-all duration-300 ${
                    dayItem.isCurrentMonth
                      ? "bg-secondary/15 border-border/20 text-foreground"
                      : "bg-secondary/5 border-border/5 opacity-40 hover:opacity-75 text-muted-foreground"
                  } ${
                    dayIsToday
                      ? "ring-2 ring-primary border-transparent bg-primary/5"
                      : "hover:border-primary/20 hover:bg-secondary/35"
                  }`}
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-bold font-mono ${
                        dayIsToday
                          ? "w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shadow-lg"
                          : ""
                      }`}
                    >
                      {dayItem.date.getDate()}
                    </span>
                    {hasTasks && (
                      <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-primary to-accent shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                    )}
                  </div>

                  {/* Tasks Preview List */}
                  <div className="mt-2 space-y-1.5 flex-1 flex flex-col justify-end">
                    {dayTasks.slice(0, 2).map((task) => (
                      <div
                        key={task.id}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border truncate capitalize ${
                          task.status === "completed"
                            ? "bg-green-500/10 text-green-400 border-green-500/10 line-through opacity-65"
                            : getPriorityColor(task.priority)
                        }`}
                      >
                        {task.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <div className="text-[9px] text-muted-foreground font-semibold text-center">
                        + {dayTasks.length - 2} more tasks
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* Dynamic Day Details, Quick-Add Tasks & Notes Modal */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedDate(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass max-w-lg w-full p-6 rounded-2xl border border-border/30 shadow-2xl relative flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/10">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold">{selectedDateStr}</h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedDate(null)}
                  className="rounded-xl hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Modal Tabs */}
              <div className="flex gap-2 mb-4 bg-secondary/30 p-1.5 rounded-xl border border-border/10">
                <button
                  onClick={() => { playClickSound(); setActiveTab("view"); }}
                  className={`flex-1 text-xs font-bold py-2 rounded-lg transition-colors ${
                    activeTab === "view" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Schedule ({activeDateTasks.length})
                </button>
                <button
                  onClick={() => { playClickSound(); setActiveTab("addTask"); }}
                  className={`flex-1 text-xs font-bold py-2 rounded-lg transition-colors ${
                    activeTab === "addTask" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  ⚡ Add Task
                </button>
                <button
                  onClick={() => { playClickSound(); setActiveTab("addNote"); }}
                  className={`flex-1 text-xs font-bold py-2 rounded-lg transition-colors ${
                    activeTab === "addNote" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  📝 Add Note
                </button>
              </div>

              {/* Tab Workspace */}
              <div className="min-h-[220px] max-h-[320px] overflow-y-auto pr-1 flex flex-col justify-between">
                {activeTab === "view" && (
                  <div className="space-y-2 flex-1">
                    {activeDateTasks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-44 text-center">
                        <p className="text-sm font-semibold text-muted-foreground">No tasks scheduled today.</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">Tap the quick forms above to schedule tasks or save custom notes!</p>
                      </div>
                    ) : (
                      activeDateTasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-3.5 rounded-xl bg-secondary/30 border border-border/10 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={task.status === "completed"}
                              onChange={() => { playClickSound(); completeTask(task.id); }}
                              className="w-4 h-4 accent-primary rounded cursor-pointer shrink-0"
                            />
                            <div>
                              <p className={`text-sm font-bold capitalize ${task.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                                {task.title}
                              </p>
                              {task.description && (
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                  {task.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === "addTask" && (
                  <div className="space-y-3 flex-1">
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground block mb-1.5">Task Title</label>
                      <input
                        type="text"
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-secondary/40 border border-border/30 focus:outline-none focus:border-primary text-xs"
                        placeholder="Study chapters, review notes..."
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground block mb-1.5">Priority Weight</label>
                      <div className="flex gap-2">
                        {["low", "medium", "high"].map((p) => (
                          <button
                            key={p}
                            onClick={() => { playClickSound(); setTaskPriority(p as any); }}
                            className={`flex-1 text-xs py-1.5 rounded-lg border capitalize font-bold transition-all ${
                              taskPriority === p
                                ? `${getPriorityColor(p)} border-primary scale-[1.02] shadow-sm`
                                : "border-border/30 text-muted-foreground hover:bg-secondary/20"
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground block mb-1.5">Task Details (Optional)</label>
                      <textarea
                        value={taskDesc}
                        onChange={(e) => setTaskDesc(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-secondary/40 border border-border/30 focus:outline-none focus:border-primary text-xs h-16 resize-none"
                        placeholder="Break down specific steps to complete..."
                      />
                    </div>
                    <Button
                      onClick={handleCreateTask}
                      disabled={!taskTitle.trim()}
                      className="w-full rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold text-xs py-3.5 mt-2"
                    >
                      ⚡ Schedule Task
                    </Button>
                  </div>
                )}

                {activeTab === "addNote" && (
                  <div className="space-y-3 flex-1">
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground block mb-1.5">Note Title</label>
                      <input
                        type="text"
                        value={noteTitle}
                        onChange={(e) => setNoteTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-secondary/40 border border-border/30 focus:outline-none focus:border-primary text-xs"
                        placeholder="Formula cheat sheet, study diary..."
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground block mb-1.5">Categorized Colors</label>
                      <div className="grid grid-cols-3 gap-2">
                        {noteColors.map((c) => (
                          <button
                            key={c.name}
                            onClick={() => { playClickSound(); setNoteColor(c.value); }}
                            className={`px-2 py-1.5 rounded-lg bg-gradient-to-br ${c.value} border-2 text-[10px] font-semibold truncate transition-all ${
                              noteColor === c.value ? "border-primary scale-[1.02]" : "border-transparent"
                            }`}
                          >
                            {c.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground block mb-1.5">Note Content</label>
                      <textarea
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-secondary/40 border border-border/30 focus:outline-none focus:border-primary text-xs h-16 resize-none"
                        placeholder="Capture study thoughts here..."
                      />
                    </div>
                    <Button
                      onClick={handleCreateNote}
                      disabled={!noteTitle.trim()}
                      className="w-full rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold text-xs py-3.5 mt-2"
                    >
                      📝 Save Linked Note
                    </Button>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end mt-4 pt-3 border-t border-border/10">
                <Button
                  className="rounded-xl px-5 bg-secondary text-foreground hover:bg-secondary/80 border border-border/10 text-xs font-semibold"
                  onClick={() => setSelectedDate(null)}
                >
                  Close View
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
