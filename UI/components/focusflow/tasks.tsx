"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  MoreHorizontal,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Trash2,
  X,
  Play,
  RotateCcw,
  Sparkles,
  Info,
  Tag,
  CalendarDays,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppStore, type Task } from "@/lib/store"
import { playClickSound, playNotificationSound } from "@/lib/sounds"
import { toast } from "sonner"

const columns = [
  { id: "todo" as const, title: "To Do (Future Backlog)", color: "from-blue-500 to-cyan-500", desc: "Objectives queued for study. Start a task to focus on it." },
  { id: "in-progress" as const, title: "In Progress (Active Focus)", color: "from-yellow-500 to-orange-500", desc: "Currently active study target. Avoid multi-tasking!" },
  { id: "completed" as const, title: "Completed (XP Awarded)", color: "from-green-500 to-emerald-500", desc: "Finished study targets. Logged to your analytics." },
]

const priorityColors = {
  low: "bg-green-500/20 text-green-400 border-green-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  high: "bg-red-500/20 text-red-400 border-red-500/30",
}

export function Tasks() {
  const tasks = useAppStore((s) => s.tasks)
  const addTask = useAppStore((s) => s.addTask)
  const deleteTask = useAppStore((s) => s.deleteTask)
  const moveTask = useAppStore((s) => s.moveTask)
  const soundEnabled = useAppStore((s) => s.soundEnabled)
  const notificationVolume = useAppStore((s) => s.notificationVolume)
  
  const [showAddTask, setShowAddTask] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const getTasksByStatus = (status: Task["status"]) => tasks.filter((t) => t.status === status)

  const handleStartTask = (id: string, title: string) => {
    playClickSound()
    moveTask(id, "in-progress")
    toast.success(`Active focus locked!`, {
      description: `"${title}" has been moved to In Progress. Focus timer recommended.`
    })
  }

  const handleCompleteTask = (id: string, title: string) => {
    if (soundEnabled) {
      playNotificationSound(notificationVolume / 100)
    }
    moveTask(id, "completed")
    toast.success(`Task finalized!`, {
      description: `Logged "${title}". +25 XP claimed. Stats updated!`
    })
  }

  const handleReopenTask = (id: string, title: string) => {
    playClickSound()
    moveTask(id, "todo")
    toast.info(`Task returned to backlog.`)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Task Kanban Board</h1>
          <p className="text-muted-foreground mt-1">
            Track study tasks across active states to optimize cognitive flow
          </p>
        </div>
        <motion.button
          onClick={() => setShowAddTask(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-medium glow-primary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-5 h-5" />
          Add Task
        </motion.button>
      </div>

      {/* Instructional Board Guide */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-4 border border-border/30 flex items-start gap-3 bg-secondary/10"
      >
        <div className="p-2 rounded-xl bg-primary/15 border border-primary/25 text-primary shrink-0">
          <Info className="w-5 h-5" />
        </div>
        <div className="text-xs leading-relaxed text-muted-foreground">
          <strong className="text-foreground block mb-0.5">Why track "In Progress" and "Completed"?</strong>
          To defeat cognitive overload. The human brain works best when focusing on exactly **one active objective** at a time. Move your tasks from **To Do** to **In Progress** to lock in your focus, and then mark them **Completed** to officially submit them, updating your graphs and collecting XP levels!
        </div>
      </motion.div>

      {/* Kanban Board */}
      <div className="grid lg:grid-cols-3 gap-6">
        {columns.map((column) => (
          <div key={column.id} className="flex flex-col">
            <div className="flex items-center justify-between mb-4 px-1.5">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${column.color}`} />
                <h2 className="font-bold text-sm tracking-wide">{column.title}</h2>
                <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-secondary/60 font-mono">
                  {getTasksByStatus(column.id).length}
                </span>
              </div>
            </div>
            
            <p className="text-[10px] text-muted-foreground mb-3 px-1.5 leading-relaxed">{column.desc}</p>

            <div className="flex-1 glass rounded-2xl p-4 border border-border/30 min-h-[500px] space-y-3">
              <AnimatePresence mode="popLayout">
                {getTasksByStatus(column.id).map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStart={() => handleStartTask(task.id, task.title)}
                    onComplete={() => handleCompleteTask(task.id, task.title)}
                    onReopen={() => handleReopenTask(task.id, task.title)}
                    onMove={(id, status) => {
                      moveTask(id, status)
                      toast.success(`Task shifted to ${status.replace('-', ' ')}`)
                    }}
                    onDelete={(id) => {
                      deleteTask(id)
                      toast.success("Task deleted")
                    }}
                    onClick={() => setSelectedTask(task)}
                  />
                ))}
              </AnimatePresence>
              <motion.button
                className="w-full py-3.5 rounded-xl border border-dashed border-border/50 text-muted-foreground hover:border-primary/50 hover:text-primary transition-all flex items-center justify-center gap-2 text-xs font-semibold"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setShowAddTask(true)}
              >
                <Plus className="w-4 h-4" />
                Add Task
              </motion.button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {showAddTask && (
          <AddTaskModal
            onClose={() => setShowAddTask(false)}
            onAdd={(taskData) => {
              addTask(taskData)
              setShowAddTask(false)
              toast.success("Task added successfully!")
            }}
          />
        )}
      </AnimatePresence>

      {/* Edit Details Task Modal */}
      <AnimatePresence>
        {selectedTask && (
          <EditTaskModal
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onDelete={(id) => {
              deleteTask(id)
              setSelectedTask(null)
              toast.success("Task deleted successfully.")
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function TaskCard({
  task,
  onStart,
  onComplete,
  onReopen,
  onMove,
  onDelete,
  onClick,
}: {
  task: Task
  onStart: () => void
  onComplete: () => void
  onReopen: () => void
  onMove: (id: string, status: Task["status"]) => void
  onDelete: (id: string) => void
  onClick: () => void
}) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2, boxShadow: "0 8px 24px -10px rgba(0,0,0,0.5)" }}
      onClick={onClick}
      className="bg-secondary/35 rounded-xl p-4 border border-border/20 hover:border-primary/20 transition-all cursor-pointer group relative flex flex-col justify-between min-h-[140px]"
    >
      <div>
        <div className="flex items-start justify-between mb-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border capitalize tracking-wide ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity text-foreground rounded-lg"
              onClick={(e) => {
                e.stopPropagation()
                setShowMenu(!showMenu)
              }}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute right-0 top-full mt-1 w-44 glass rounded-xl border border-border/30 py-1.5 z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold hover:bg-secondary/50 transition-colors text-left" onClick={() => { onMove(task.id, "todo"); setShowMenu(false) }}>
                    <Circle className="w-3.5 h-3.5" /> Move to To Do
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold hover:bg-secondary/50 transition-colors text-left" onClick={() => { onMove(task.id, "in-progress"); setShowMenu(false) }}>
                    <Clock className="w-3.5 h-3.5" /> Move to In Progress
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold hover:bg-secondary/50 transition-colors text-left" onClick={() => { onMove(task.id, "completed"); setShowMenu(false) }}>
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> Mark Complete
                  </button>
                  <div className="border-t border-border/20 my-1" />
                  <button className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors text-left" onClick={() => { onDelete(task.id); setShowMenu(false) }}>
                    <Trash2 className="w-3.5 h-3.5" /> Delete Task
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <h3 className="font-bold text-sm tracking-tight text-foreground leading-snug capitalize mb-1">{task.title}</h3>
        {task.description && <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed mb-3">{task.description}</p>}
      </div>

      <div>
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3 select-none">
            {task.tags.map((tag) => (
              <span key={tag} className="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                <Tag className="w-2.5 h-2.5" /> {tag}
              </span>
            ))}
          </div>
        )}

        {/* Dynamic workflow movers directly on card bottom */}
        <div className="flex items-center justify-between border-t border-border/10 pt-3 mt-1.5">
          <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground font-mono">
            <CalendarDays className="w-3.5 h-3.5" />
            <span>{task.dueDate || "No due date"}</span>
          </div>

          {/* Quick Active Column Action Buttons */}
          <div onClick={(e) => e.stopPropagation()}>
            {task.status === "todo" && (
              <Button
                size="sm"
                onClick={onStart}
                className="h-7 text-[10px] font-extrabold rounded-lg bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/35"
              >
                <Play className="w-3 h-3 fill-current mr-1" /> Focus Work
              </Button>
            )}
            {task.status === "in-progress" && (
              <Button
                size="sm"
                onClick={onComplete}
                className="h-7 text-[10px] font-extrabold rounded-lg bg-green-500/20 text-green-400 border border-green-500/20 hover:bg-green-500/35"
              >
                <CheckCircle2 className="w-3 h-3 mr-1" /> Submit Finished
              </Button>
            )}
            {task.status === "completed" && (
              <Button
                size="sm"
                onClick={onReopen}
                className="h-7 text-[10px] font-extrabold rounded-lg bg-secondary text-muted-foreground border border-border/10 hover:text-foreground"
              >
                <RotateCcw className="w-3 h-3 mr-1" /> Re-open Backlog
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function AddTaskModal({
  onClose,
  onAdd,
}: {
  onClose: () => void
  onAdd: (task: Omit<Task, "id" | "createdAt">) => void
}) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<Task["priority"]>("medium")
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [dueDate, setDueDate] = useState("")

  const handleAddTag = () => {
    const tag = tagInput.trim()
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag])
      setTagInput("")
    }
  }

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error("Please enter a task title")
      return
    }
    
    // Fallback date to today's date if blank
    const targetDate = dueDate || new Date().toISOString().split('T')[0]
    
    onAdd({
      title: title.trim(),
      description: description.trim(),
      priority,
      tags,
      dueDate: targetDate,
      status: "todo",
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="glass rounded-2xl p-6 border border-border/30 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gradient">Create New Task</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl"><X className="w-5 h-5" /></Button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1.5 block">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border/30 focus:border-primary/50 focus:outline-none text-sm font-semibold" placeholder="Enter task title..." />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1.5 block">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border/30 focus:border-primary/50 focus:outline-none resize-none h-20 text-xs font-medium" placeholder="Describe this objective..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1.5 block">Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-secondary/30 border border-border/30 focus:border-primary/50 focus:outline-none text-xs font-semibold font-mono" />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1.5 block">Priority</label>
              <div className="flex gap-1.5">
                {(["low", "medium", "high"] as const).map((p) => (
                  <button key={p} onClick={() => { playClickSound(); setPriority(p); }} className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all capitalize ${priority === p ? priorityColors[p] : "border-border/30 text-muted-foreground hover:bg-secondary/20"}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1.5 block">Tags</label>
            <div className="flex gap-2">
              <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag() } }} className="flex-1 px-4 py-2 rounded-xl bg-secondary/30 border border-border/30 focus:border-primary/50 focus:outline-none text-xs" placeholder="Add tag name..." />
              <Button variant="outline" onClick={handleAddTag} className="rounded-xl text-xs font-bold">Add</Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {tags.map((tag) => (
                  <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center gap-1 select-none">
                    {tag}
                    <button onClick={() => setTags(tags.filter((t) => t !== tag))} className="hover:text-red-400 font-black">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="ghost" className="flex-1 rounded-xl text-xs font-semibold" onClick={onClose}>Cancel</Button>
          <motion.button className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold text-xs shadow-md" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSubmit}>
            Create Task
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function EditTaskModal({
  task,
  onClose,
  onDelete,
}: {
  task: Task
  onClose: () => void
  onDelete: (id: string) => void
}) {
  const updateTask = useAppStore((s) => s.updateTask)
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description)
  const [priority, setPriority] = useState(task.priority)
  const [dueDate, setDueDate] = useState(task.dueDate)

  const handleUpdate = () => {
    updateTask(task.id, {
      title,
      description,
      priority,
      dueDate,
    })
    toast.success("Task updated.")
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="glass rounded-2xl p-6 border border-border/30 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gradient">Edit Study Objective</h2>
          <div className="flex gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-red-500/10 text-red-400"
              onClick={() => onDelete(task.id)}
            >
              <Trash2 className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl"><X className="w-5 h-5" /></Button>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1.5 block">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border/30 focus:border-primary/50 focus:outline-none text-sm font-semibold" />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1.5 block">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border/30 focus:border-primary/50 focus:outline-none resize-none h-20 text-xs font-medium" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1.5 block">Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-secondary/30 border border-border/30 focus:border-primary/50 focus:outline-none text-xs font-semibold font-mono" />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1.5 block">Priority</label>
              <div className="flex gap-1.5">
                {(["low", "medium", "high"] as const).map((p) => (
                  <button key={p} onClick={() => { playClickSound(); setPriority(p); }} className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all capitalize ${priority === p ? priorityColors[p] : "border-border/30 text-muted-foreground hover:bg-secondary/20"}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="ghost" className="flex-1 rounded-xl text-xs font-semibold" onClick={onClose}>Cancel</Button>
          <motion.button className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold text-xs shadow-md" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleUpdate}>
            Save Changes
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
