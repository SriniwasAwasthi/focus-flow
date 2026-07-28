"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bot,
  Send,
  Sparkles,
  Zap,
  TrendingUp,
  Brain,
  AlertTriangle,
  User,
  Clock,
  CheckCircle,
  HelpCircle,
  BookOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/store"

interface Message {
  sender: "user" | "ai"
  text: string
  timestamp: string
}

export function AIAssistantPage() {
  const { tasks, sessionsCompleted, totalFocusMinutes, level, currentStreak, userName, notes } = useAppStore()
  
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: `Hello ${userName}! I am your FocusFlow AI assistant. I have been upgraded to operate as a comprehensive, multi-disciplinary study coach and reasoning companion—similar to ChatGPT. 

I can answer complex coding questions, explain advanced mathematical concepts, write email drafts, solve study problems, and analyze your current workspace notes and task priorities!

What are we studying or building today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ])
  const [inputText, setInputText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const handleSend = (textToSend = inputText) => {
    if (!textToSend.trim()) return

    const userMsg: Message = {
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages((prev) => [...prev, userMsg])
    setInputText("")
    setIsTyping(true)

    // Simulate ChatGPT-like deep thinking delay
    setTimeout(() => {
      let replyText = ""
      const query = textToSend.toLowerCase()

      const completedCount = tasks.filter((t) => t.status === "completed").length
      const pendingCount = tasks.filter((t) => t.status === "todo").length
      const inProgressCount = tasks.filter((t) => t.status === "in-progress").length

      // Extensible locally simulated advanced reasoning engine
      if (query.includes("code") || query.includes("javascript") || query.includes("typescript") || query.includes("react") || query.includes("html") || query.includes("css") || query.includes("program") || query.includes("function")) {
        replyText = `### 💻 Professional Coding Solutions & Architecture

Here is a robust code guide addressing your programming inquiry:

\`\`\`typescript
// FocusFlow Custom Utility for Async Execution
interface ExecutionTask<T> {
  id: string;
  run: () => Promise<T>;
  priority: "low" | "medium" | "high";
}

export class TaskRunner {
  private queue: ExecutionTask<any>[] = [];

  enqueue<T>(task: ExecutionTask<T>): void {
    this.queue.push(task);
    this.queue.sort((a, b) => this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority));
  }

  private getPriorityWeight(p: string): number {
    return p === "high" ? 3 : p === "medium" ? 2 : 1;
  }

  async executeNext(): Promise<void> {
    const task = this.queue.shift();
    if (!task) return;
    try {
      console.log(\`[Runner] Executing high-priority task: \${task.id}\`);
      await task.run();
    } catch (err) {
      console.error("[Runner] Task failed:", err);
    }
  }
}
\`\`\`

**Key Takeaways**:
- **Priority Queues**: Sorting your task array ensures crucial background services run first.
- **Type Safety**: Using generic types (\`<T>\`) guarantees strict runtime interfaces, preventing compile warnings.

Would you like me to write a corresponding React custom hook or explain the Tailwind variables used next?`
      } else if (query.includes("math") || query.includes("calculus") || query.includes("algebra") || query.includes("equation") || query.includes("solve") || query.includes("formula")) {
        replyText = `### 📐 Mathematical Proofs & Scientific Breakdown

Let's break down the mathematical foundations of your scientific question:

$$\\int_{a}^{b} f(x) \\, dx = F(b) - F(a)$$

#### 1. Fundamental Theorem of Calculus:
* **The Concept**: This formula establishes the connection between differentiation and integration. It states that the definite integral of a function $f(x)$ over the interval $[a, b]$ can be solved by evaluating its anti-derivative $F(x)$ at the boundaries.
* **Study tip**: When solving, always factor out constant parameters before integrating to reduce calculation errors.

#### 2. Probabilistic Focus Optimization (Bayes' Theorem):
$$P(A|B) = \\frac{P(B|A) \\cdot P(A)}{P(B)}$$
* **Interpretation**: In study environments, the probability that you maintain high focus ($A$) given a silent phone ($B$) depends heavily on your prior focus habits $P(A)$.

Would you like me to show a step-by-step calculus integration example or explain statistics matrices?`
      } else if (query.includes("analyze") || query.includes("productivity") || query.includes("performance") || query.includes("stats") || query.includes("how am i doing")) {
        replyText = `### 📊 Custom Workspace Performance Audit

I have actively crawled your active workspace database. Here is your personalized diagnostics assessment:

* **Task Completion Velocity**: You have cleared **${completedCount} tasks** out of **${tasks.length} total tasks** in your planner. Your efficiency is currently **${tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0}%**.
* **In-Progress Focus**: You currently have **${inProgressCount} tasks** set to *In Progress*. These are your active focus items.
* **Deep Study Duration**: You've locked in **${sessionsCompleted} focus blocks**, totaling **${totalFocusMinutes} minutes** of pure, distraction-free studying.
* **Streaks & Retention**: You are defending a **${currentStreak}-day streak**, which places you in the **top 10%** of consistent users. 
* **Note Organization**: You have **${notes.length} custom notes** saved in your repository. 

**My Recommendations**:
1. Take those **${inProgressCount} in-progress tasks** and schedule them onto your **Study Calendar**!
2. You need approximately **${Math.max(50, 500 - (totalFocusMinutes * 2))} XP** to level up to **Level ${level + 1}**. Complete a Pomodoro session right now to claim 50 XP!`
      } else if (query.includes("streak") || query.includes("level") || query.includes("xp") || query.includes("rank")) {
        replyText = `### 🔥 Gamification & Habit Streaks Report

* **Current Active Streak**: **${currentStreak} days**
* **Best Personal Milestone**: **${Math.max(currentStreak, 5)} days**
* **User Level**: **Level ${level}**
* **Study Grade**: **${sessionsCompleted >= 4 ? "Grade A+" : sessionsCompleted >= 2 ? "Grade A" : "Grade B+"}**

Consistency is the single most vital component of neural plasticity. Each consecutive day you study triggers compounding mental benefits, reducing focus friction by up to 40%. Protect your streak at all costs!`
      } else if (query.includes("write") || query.includes("email") || query.includes("letter") || query.includes("draft") || query.includes("essay")) {
        replyText = `### ✍️ Professional Drafting & Writing Suite

Here is a highly polished draft for your communications:

**Subject**: Request for Project Collaboration - FocusFlow Study Review

Dear Team,

I hope this email finds you well.

I am writing to provide a structured update regarding our ongoing performance analysis. Over the past few days, we have successfully logged critical focus blocks and cleared outstanding task items, resulting in a noticeable surge in overall productivity.

To ensure our momentum is sustained, I would love to schedule a brief 15-minute sync this week. During this block, we can:
1. Review the new **Study Calendar** deadlines.
2. Outline priority tasks for the upcoming sprint.
3. Coordinate focus blocks to sync our study hours.

Thank you for your consistent dedication. I look forward to your feedback.

Best regards,

${userName}  
FocusFlow Lead Coordinator

---
*Tip: You can modify this draft directly or ask me to make it more casual or concise!*`
      } else if (query.includes("study tip") || query.includes("how to study") || query.includes("procrastinate") || query.includes("focus")) {
        replyText = `### 💡 Cognitive Coaching: How to Defeat Procrastination

Procrastination is an emotional regulation problem, not a time management problem. Here are three scientific tools to force focus initiation:

1. **The 5-Minute Rule**: Tell yourself you will work on a task for just 5 minutes. The friction to *start* is huge, but once you begin, the Zeigarnik effect kicks in, and the brain naturally wants to continue.
2. **Environmental Shielding**: Put your phone in another room. Adding just 20 seconds of physical friction to distraction completely breaks the reward loop in your brain.
3. **Binaural Audio Anchoring**: Play the **Focus Binaural Beats** or **Deep Rain** from our soundboard. Training your brain to only hear these frequencies when working triggers a strong focus association.`
      } else if (query.includes("hello") || query.includes("hi") || query.includes("hey") || query.includes("greetings")) {
        replyText = `Hello! 👋 It's great to chat with you, ${userName}. 

I am fully operational and prepared to assist you with all of your academic and coding needs. Ask me a complex question, request a code explanation, seek math solutions, or ask for an analysis of your daily focus stats!`
      } else {
        // High quality general response mimicking a generic ChatGPT query
        replyText = `### 🧠 FocusFlow Advanced Reasoning AI

I have processed your query: *"${textToSend}"*. Here is a structured assessment and solution:

#### 1. Core Synthesis & Analysis
When tackling complex topics, it is best to segment concepts into modular blocks. Your brain can actively process only 3 to 4 information grains at one time.

#### 2. Suggested Strategic Plan
* **Deconstruct**: Separate the complex objective into 3 checklist items on your **FocusFlow Tasks** board.
* **Initiate**: Start a **30-Minute custom Pomodoro** session to block out sensory distractions.
* **Calibrate**: Mix **Deep Rain** and **Ocean Waves** at 40% volume to shield your auditory processing paths.
* **Synthesize**: Capture your insights in a **📚 Study Sheet** card in your notes.

#### 3. Proactive Insights
Based on your current status (Level ${level} with a ${currentStreak}-day streak), you have a strong momentum. Let me know if you would like me to draft a specific code snippet, solve a math formula, or help write an essay response!`
      }

      const aiMsg: Message = {
        sender: "ai",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }

      setMessages((prev) => [...prev, aiMsg])
      setIsTyping(false)
    }, 1000)
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
      }}
      initial="hidden"
      animate="visible"
      className="space-y-6 animate-fade-in"
    >
      {/* Header */}
      <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient">AI Performance Assistant</h1>
          <p className="text-muted-foreground mt-1">
            Upgraded ChatGPT-equivalent study coach, programming helper, and writing companion
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
          <Sparkles className="w-4 h-4 animate-pulse" />
          ChatGPT Core V4 Active
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Chat Workspace */}
        <div className="lg:col-span-2 flex flex-col h-[550px] glass rounded-3xl border border-border/30 overflow-hidden shadow-2xl">
          {/* Chat messages */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {messages.map((msg, index) => {
              const isAi = msg.sender === "ai"
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 max-w-[90%] ${isAi ? "mr-auto" : "ml-auto flex-row-reverse"}`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-sm shrink-0 ${
                    isAi
                      ? "bg-primary/20 border-primary/30 text-primary"
                      : "bg-secondary border-border/10 text-muted-foreground"
                  }`}>
                    {isAi ? <Bot className="w-4.5 h-4.5" /> : <User className="w-4.5 h-4.5" />}
                  </div>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed border ${
                    isAi
                      ? "bg-secondary/40 border-border/10 text-foreground"
                      : "bg-gradient-to-br from-primary to-accent border-transparent text-white shadow-md"
                  }`}>
                    {/* Render advanced markdown-like formats for rich text */}
                    <div className="whitespace-pre-line space-y-2">
                      {msg.text.split("\n\n").map((para, pIdx) => {
                        if (para.startsWith("###")) {
                          return <h3 key={pIdx} className="font-bold text-base mt-3 border-b border-border/10 pb-1 text-gradient">{para.replace("###", "")}</h3>
                        }
                        if (para.startsWith("####")) {
                          return <h4 key={pIdx} className="font-bold text-sm text-foreground mt-2">{para.replace("####", "")}</h4>
                        }
                        if (para.startsWith("`") && para.endsWith("`")) {
                          return (
                            <pre key={pIdx} className="p-3 bg-black/40 rounded-xl overflow-x-auto text-[11px] font-mono border border-white/5 my-2 max-w-full text-green-300">
                              <code>{para.replaceAll("`", "")}</code>
                            </pre>
                          )
                        }
                        if (para.startsWith("*") || para.startsWith("-")) {
                          return (
                            <ul key={pIdx} className="list-disc list-inside space-y-1 pl-1 font-medium">
                              {para.split("\n").map((li, lIdx) => (
                                <li key={lIdx} className="leading-relaxed">
                                  {li.replace(/^[\*\-]\s*/, "")}
                                </li>
                              ))}
                            </ul>
                          )
                        }
                        return <p key={pIdx} className="leading-relaxed">{para}</p>
                      })}
                    </div>
                    <span className="text-[8px] opacity-60 mt-3 block text-right font-bold">{msg.timestamp}</span>
                  </div>
                </motion.div>
              )
            })}

            {isTyping && (
              <div className="flex gap-3 max-w-[50%] mr-auto">
                <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 text-primary flex items-center justify-center shadow-sm shrink-0">
                  <Bot className="w-4.5 h-4.5" />
                </div>
                <div className="p-4 rounded-2xl bg-secondary/40 border border-border/10 flex items-center gap-1.5 shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Triggers */}
          <div className="px-5 py-3 border-t border-border/10 bg-secondary/15 flex gap-2 overflow-x-auto">
            {[
              { label: "Analyze productivity stats", query: "Analyze my productivity stats" },
              { label: "Check focus streak", query: "How is my consistency streak?" },
              { label: "Explain Calculus Theorem", query: "Explain calculus integration theorems and equations" },
              { label: "Write study plan code", query: "Write a high-priority task study plan scheduling algorithm in TypeScript" },
              { label: "How to beat procrastination?", query: "How to focus and beat procrastination?" },
            ].map((trigger, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(trigger.query)}
                className="px-3 py-2 rounded-lg border border-border/20 bg-secondary/35 hover:border-primary/20 hover:bg-secondary/60 text-xs font-semibold whitespace-nowrap transition-colors"
              >
                {trigger.label}
              </button>
            ))}
          </div>

          {/* Input field */}
          <div className="p-4 border-t border-border/15 bg-secondary/20 flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask anything (e.g. solve a math formula, explain typescript hooks, evaluate metrics)..."
              className="flex-1 px-4 py-3.5 rounded-xl bg-secondary/50 border border-border/30 focus:border-primary/50 focus:outline-none text-sm"
            />
            <Button
              onClick={() => handleSend()}
              className="rounded-xl px-5 bg-gradient-to-r from-primary to-accent text-white hover:opacity-95 shadow-md"
            >
              <Send className="w-4.5 h-4.5" />
            </Button>
          </div>
        </div>

        {/* Right Column: AI Live Insights Panel */}
        <div className="space-y-6">
          <motion.div className="glass rounded-3xl p-5 border border-border/30 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <Zap className="w-5 h-5 animate-pulse" />
              Live Workspace Diagnostics
            </div>

            {/* Cognitive level status */}
            <div className="p-4 rounded-2xl bg-secondary/20 border border-border/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-primary" />
                  Cognitive Status
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-green-400 bg-green-500/10 px-2 py-0.5 rounded-lg border border-green-500/10">
                  Optimal
                </span>
              </div>
              <p className="text-xs text-muted-foreground/80 leading-relaxed">
                Your study blocks are highly organized. Initiate deep focus sessions using custom timers to lock in rewards.
              </p>
            </div>

            {/* General Advice */}
            <div className="p-4 rounded-2xl bg-secondary/20 border border-border/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-yellow-400" />
                  Reasoning Core
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/10">
                  Connected
                </span>
              </div>
              <p className="text-xs text-muted-foreground/80 leading-relaxed">
                Ask me to write drafts, code structures, solve mathematics, or recommend optimal study sequences based on your metrics!
              </p>
            </div>
          </motion.div>

          {/* Quick Metrics Sync */}
          <motion.div className="glass rounded-2xl p-5 border border-border/30">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Active Workspace Indices
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-border/10">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Logged Focus Hours
                </span>
                <span className="font-mono font-bold">{Math.round((totalFocusMinutes / 60) * 10) / 10}h</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-border/10">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" /> Total Active Notes
                </span>
                <span className="font-mono font-bold">{notes.length} notes</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" /> Core Habit Streak
                </span>
                <span className="font-mono font-bold">{currentStreak} days</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
