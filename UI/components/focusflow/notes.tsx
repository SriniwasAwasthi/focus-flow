"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Search,
  Pin,
  Trash2,
  MoreHorizontal,
  X,
  Edit2,
  Check,
  Tag,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/store"
import { playClickSound } from "@/lib/sounds"

const noteColors = [
  { name: "Ideas", value: "from-purple-500/20 to-purple-600/10 border-purple-500/30", label: "💡 Ideas" },
  { name: "Meetings", value: "from-blue-500/20 to-blue-600/10 border-blue-500/30", label: "📅 Meetings" },
  { name: "Studies", value: "from-cyan-500/20 to-cyan-600/10 border-cyan-500/30", label: "📚 Studies" },
  { name: "Tasks", value: "from-green-500/20 to-green-600/10 border-green-500/30", label: "✅ Tasks" },
  { name: "Goals", value: "from-yellow-500/20 to-yellow-600/10 border-yellow-500/30", label: "⭐ Goals" },
  { name: "Inspirations", value: "from-pink-500/20 to-pink-600/10 border-pink-500/30", label: "❤️ Inspirations" },
]

export function Notes() {
  const { notes, addNote, deleteNote, toggleNotePin, updateNote } = useAppStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddNote, setShowAddNote] = useState(false)
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)

  const selectedNote = notes.find((n) => n.id === selectedNoteId) || null

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const pinnedNotes = filteredNotes.filter((note) => note.pinned)
  const unpinnedNotes = filteredNotes.filter((note) => !note.pinned)

  const handleTogglePin = (id: string) => {
    playClickSound()
    toggleNotePin(id)
  }

  const handleDeleteNote = (id: string) => {
    playClickSound()
    deleteNote(id)
  }

  const handleAddNote = (noteData: { title: string; content: string; color: string; pinned: boolean }) => {
    playClickSound()
    addNote(noteData)
  }

  const handleUpdateNote = (id: string, updates: { title?: string; content?: string; color?: string }) => {
    updateNote(id, updates)
  }

  const getFriendlyTime = (isoString: string) => {
    try {
      const date = new Date(isoString)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      
      if (diffMins < 1) return "Just now"
      if (diffMins < 60) return `${diffMins}m ago`
      if (diffHours < 24) return `${diffHours}h ago`
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    } catch {
      return "Recently"
    }
  }

  const getColorLabel = (colorValue: string) => {
    const match = noteColors.find((c) => c.value === colorValue)
    return match ? match.label : "🏷️ General"
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 animate-fade-in"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Workspace Notes</h1>
          <p className="text-muted-foreground mt-1">
            Maintain study guides, subject notes, and checklist boards sorted by functional color categories
          </p>
        </div>
        <motion.button
          onClick={() => setShowAddNote(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-medium glow-primary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-5 h-5" />
          New Note
        </motion.button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search notes by keyword..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl glass border border-border/30 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
        />
      </div>

      {/* Pinned Notes */}
      {pinnedNotes.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 px-1">
            <Pin className="w-4 h-4 text-primary fill-primary" />
            Pinned Notes
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pinnedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onTogglePin={handleTogglePin}
                onDelete={handleDeleteNote}
                onClick={() => setSelectedNoteId(note.id)}
                getFriendlyTime={getFriendlyTime}
                getColorLabel={getColorLabel}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Notes */}
      <div className="space-y-3">
        {pinnedNotes.length > 0 && (
          <h2 className="text-sm font-semibold text-muted-foreground px-1">All Notes</h2>
        )}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {unpinnedNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onTogglePin={handleTogglePin}
              onDelete={handleDeleteNote}
              onClick={() => setSelectedNoteId(note.id)}
              getFriendlyTime={getFriendlyTime}
              getColorLabel={getColorLabel}
            />
          ))}
        </div>
      </div>

      {/* Empty state */}
      {filteredNotes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center glass rounded-2xl border border-border/20 max-w-xl mx-auto">
          <p className="text-muted-foreground font-medium">No notes available</p>
          <p className="text-sm text-muted-foreground/60 mt-1">
            {searchQuery ? "Try a different search query." : "Click 'New Note' to create your first note."}
          </p>
        </div>
      )}

      {/* Add Note Modal */}
      <AnimatePresence>
        {showAddNote && (
          <AddNoteModal
            onClose={() => setShowAddNote(false)}
            onAdd={(note) => {
              handleAddNote(note)
              setShowAddNote(false)
            }}
          />
        )}
      </AnimatePresence>

      {/* View/Edit Note Modal */}
      <AnimatePresence>
        {selectedNote && (
          <ViewNoteModal
            note={selectedNote}
            onClose={() => setSelectedNoteId(null)}
            onTogglePin={() => handleTogglePin(selectedNote.id)}
            onDelete={() => {
              handleDeleteNote(selectedNote.id)
              setSelectedNoteId(null)
            }}
            onUpdate={(updates) => handleUpdateNote(selectedNote.id, updates)}
            getFriendlyTime={getFriendlyTime}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function NoteCard({
  note,
  onTogglePin,
  onDelete,
  onClick,
  getFriendlyTime,
  getColorLabel,
}: {
  note: any
  onTogglePin: (id: string) => void
  onDelete: (id: string) => void
  onClick: () => void
  getFriendlyTime: (isoString: string) => string
  getColorLabel: (colorVal: string) => string
}) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)" }}
      className={`relative p-5 rounded-2xl bg-gradient-to-br ${note.color} border cursor-pointer group min-h-[190px] flex flex-col justify-between transition-all duration-300 hover:border-foreground/20`}
      onClick={onClick}
    >
      <div>
        {/* Actions */}
        <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 rounded-lg hover:bg-white/10 text-foreground"
            onClick={(e) => {
              e.stopPropagation()
              onTogglePin(note.id)
            }}
          >
            <Pin className={`w-4 h-4 ${note.pinned ? "fill-primary text-primary" : ""}`} />
          </Button>
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 rounded-lg hover:bg-white/10 text-foreground"
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
                  className="absolute right-0 top-full mt-1 w-32 glass rounded-xl border border-border/30 py-1 z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
                    onClick={() => {
                      onDelete(note.id)
                      setShowMenu(false)
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Category Badge */}
        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-black/25 text-[10px] font-bold text-foreground border border-white/5 mb-3 select-none">
          <Tag className="w-3 h-3 text-primary" />
          {getColorLabel(note.color)}
        </div>

        {/* Content */}
        <h3 className="font-bold text-lg mb-2 pr-16 leading-snug">{note.title}</h3>
        <p className="text-sm text-muted-foreground/90 flex-1 line-clamp-4 whitespace-pre-line leading-relaxed">
          {note.content}
        </p>
      </div>
      <p className="text-[10px] text-muted-foreground/80 mt-4 font-bold">{getFriendlyTime(note.createdAt)}</p>
    </motion.div>
  )
}

function AddNoteModal({
  onClose,
  onAdd,
}: {
  onClose: () => void
  onAdd: (note: { title: string; content: string; color: string; pinned: boolean }) => void
}) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [color, setColor] = useState(noteColors[0].value)

  const handleSubmit = () => {
    if (!title.trim()) return
    onAdd({
      title,
      content,
      color,
      pinned: false,
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
        className="glass rounded-2xl p-6 border border-border/30 w-full max-w-lg shadow-2xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gradient">Create Workspace Note</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1.5 block">Note Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border/30 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/10 text-sm font-semibold"
              placeholder="Give your note a title..."
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1.5 block">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border/30 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/10 text-sm resize-none h-36 font-medium"
              placeholder="Type anything here..."
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground mb-2 block">
              Color Palette (Click to assign category)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {noteColors.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => { playClickSound(); setColor(c.value); }}
                  className={`px-3 py-2 rounded-xl bg-gradient-to-br ${c.value} border-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5 truncate ${
                    color === c.value
                      ? "border-primary scale-[1.02] shadow-md"
                      : "border-transparent opacity-85 hover:opacity-100"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="ghost" className="flex-1 rounded-xl text-xs font-semibold" onClick={onClose}>
            Cancel
          </Button>
          <motion.button
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold text-xs shadow-md"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={!title.trim()}
            style={{ opacity: title.trim() ? 1 : 0.6 }}
          >
            Save Note
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function ViewNoteModal({
  note,
  onClose,
  onTogglePin,
  onDelete,
  onUpdate,
  getFriendlyTime,
}: {
  note: any
  onClose: () => void
  onTogglePin: () => void
  onDelete: () => void
  onUpdate: (updates: { title?: string; content?: string; color?: string }) => void
  getFriendlyTime: (iso: string) => string
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [color, setColor] = useState(note.color)

  const handleSave = () => {
    onUpdate({ title, content, color })
    setIsEditing(false)
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
        className={`rounded-2xl p-6 bg-gradient-to-br ${isEditing ? 'from-secondary to-secondary/80' : color} border border-border/30 w-full max-w-lg shadow-2xl relative flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          {isEditing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl font-bold bg-secondary/50 border border-border/30 rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary w-2/3"
            />
          ) : (
            <h2 className="text-xl font-bold leading-snug">{note.title}</h2>
          )}

          <div className="flex items-center gap-1">
            {isEditing ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSave}
                className="hover:bg-white/10 text-green-400"
              >
                <Check className="w-5 h-5" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => { playClickSound(); setIsEditing(true); }}
                className="hover:bg-white/10 text-foreground"
              >
                <Edit2 className="w-5 h-5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onTogglePin}
              className="hover:bg-white/10 text-foreground"
            >
              <Pin className={`w-5 h-5 ${note.pinned ? "fill-primary text-primary" : ""}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="hover:bg-red-500/10 text-red-400"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-white/10 text-foreground">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-4 my-2 flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border/30 focus:outline-none focus:border-primary resize-none h-40 text-sm"
            />
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-2 block">Category Palette</label>
              <div className="grid grid-cols-3 gap-2">
                {noteColors.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => { playClickSound(); setColor(c.value); }}
                    className={`px-2 py-1.5 rounded-lg bg-gradient-to-br ${c.value} border-2 text-[10px] font-semibold truncate transition-all flex items-center justify-center ${
                      color === c.value ? "border-primary scale-[1.02]" : "border-transparent"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-foreground whitespace-pre-line leading-relaxed text-sm flex-1 my-2 max-h-[300px] overflow-y-auto pr-1">
            {note.content}
          </p>
        )}

        <div className="flex items-center justify-between border-t border-border/20 pt-4 mt-4">
          <p className="text-[10px] text-muted-foreground font-semibold">Created {getFriendlyTime(note.createdAt)}</p>
          {isEditing && (
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="rounded-lg">
              Discard
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
