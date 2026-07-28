"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  CloudRain,
  Flame,
  TreePine,
  Activity,
  Infinity as InfinityIcon,
  Sparkles,
  Coffee,
  Compass,
  Waves,
  Moon,
  Tv,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/store"

interface SoundTrack {
  id: string
  name: string
  description: string
  icon: any
  color: string
  type: "noise" | "binaural" | "synth"
  noiseType?: "white" | "pink" | "brown"
  binauralFreq?: { left: number; right: number }
}

const tracks: SoundTrack[] = [
  {
    id: "rain",
    name: "Deep Rain",
    description: "Low-frequency rain rumble with subtle high crackles",
    icon: CloudRain,
    color: "from-blue-500/20 to-indigo-600/10 border-blue-500/30",
    type: "noise",
    noiseType: "brown",
  },
  {
    id: "fireplace",
    name: "Fireplace Crackle",
    description: "Warm fireplace rumble with randomized popping embers",
    icon: Flame,
    color: "from-orange-500/20 to-red-600/10 border-orange-500/30",
    type: "noise",
    noiseType: "pink",
  },
  {
    id: "forest",
    name: "Forest Stream",
    description: "Modulating organic drone reminiscent of wilderness",
    icon: TreePine,
    color: "from-emerald-500/20 to-teal-600/10 border-emerald-500/30",
    type: "noise",
    noiseType: "white",
  },
  {
    id: "binaural",
    name: "Focus Binaural Beats",
    description: "150Hz left / 154Hz right to create a 4Hz theta wave for concentration",
    icon: Activity,
    color: "from-purple-500/20 to-pink-600/10 border-purple-500/30",
    type: "binaural",
    binauralFreq: { left: 150, right: 154 },
  },
  // --- 6 NEW PREMIUM SYNTHESIZED TRACKS ---
  {
    id: "zen",
    name: "Zen Wind Chimes",
    description: "Soft randomized harmonic bells vibrating at soothing intervals",
    icon: Sparkles,
    color: "from-yellow-500/20 to-amber-600/10 border-yellow-500/30",
    type: "synth",
  },
  {
    id: "cafe",
    name: "Muffled Study Cafe",
    description: "Low-frequency background murmur mixed with coffee cup clinks",
    icon: Coffee,
    color: "from-amber-700/20 to-yellow-800/10 border-amber-700/30",
    type: "noise",
    noiseType: "brown",
  },
  {
    id: "beta",
    name: "Active Beta Beats",
    description: "200Hz left / 215Hz right creating 15Hz Beta waves for alert thinking",
    icon: Compass,
    color: "from-cyan-500/20 to-blue-600/10 border-cyan-500/30",
    type: "binaural",
    binauralFreq: { left: 200, right: 215 },
  },
  {
    id: "ocean",
    name: "Ocean Swells",
    description: "Slow swelling white-noise waves washing onto memory shores",
    icon: Waves,
    color: "from-sky-500/20 to-teal-500/10 border-sky-500/30",
    type: "noise",
    noiseType: "white",
  },
  {
    id: "crickets",
    name: "Summer Night Crickets",
    description: "High-frequency organic rhythmic crickets chirping soft signals",
    icon: Moon,
    color: "from-indigo-950/40 to-slate-900/20 border-indigo-500/30",
    type: "synth",
  },
  {
    id: "cosmic",
    name: "Cosmic Study Drone",
    description: "Deep, sweep-modulated detuned sawtooth oscillators in space",
    icon: Tv,
    color: "from-rose-500/20 to-purple-800/10 border-rose-500/30",
    type: "synth",
  },
]

export function MusicPage() {
  const { soundEnabled, ambientVolume, setAmbientVolume } = useAppStore()
  
  // Track state
  const [playingTracks, setPlayingTracks] = useState<Record<string, boolean>>({})
  const [trackVolumes, setTrackVolumes] = useState<Record<string, number>>({
    rain: 50,
    fireplace: 30,
    forest: 20,
    binaural: 40,
    zen: 40,
    cafe: 40,
    beta: 35,
    ocean: 40,
    crickets: 25,
    cosmic: 30,
  })

  const [isPlayingAny, setIsPlayingAny] = useState(false)

  // Web Audio Refs
  const audioCtxRef = useRef<AudioContext | null>(null)
  const soundNodesRef = useRef<Record<string, { gain: GainNode; sourceNodes: any[]; intervals?: any[] }>>({})

  // Master overall playing switch
  useEffect(() => {
    const isAny = Object.values(playingTracks).some(Boolean)
    setIsPlayingAny(isAny)
  }, [playingTracks])

  // Stop all audio on unmount
  useEffect(() => {
    return () => {
      stopAllWebAudio()
    }
  }, [])

  // Sync ambientVolume change to currently playing nodes
  useEffect(() => {
    if (!audioCtxRef.current) return
    Object.entries(soundNodesRef.current).forEach(([id, nodeData]) => {
      const trackVol = trackVolumes[id] ?? 50
      const actualVolume = (trackVol / 100) * (ambientVolume / 100)
      nodeData.gain.gain.setValueAtTime(actualVolume, audioCtxRef.current!.currentTime)
    })
  }, [ambientVolume, trackVolumes])

  const stopAllWebAudio = () => {
    Object.entries(soundNodesRef.current).forEach(([_, nodeData]) => {
      nodeData.sourceNodes.forEach((node) => {
        try {
          node.stop()
        } catch {}
      })
      nodeData.intervals?.forEach((interval) => {
        try {
          clearInterval(interval)
        } catch {}
      })
    })
    soundNodesRef.current = {}
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close()
      audioCtxRef.current = null
    }
  }

  const initAudioCtx = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume()
    }
  }

  // Create noise buffer helper
  const createNoiseBuffer = (ctx: AudioContext, type: "white" | "pink" | "brown") => {
    const bufferSize = 2 * ctx.sampleRate
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const output = buffer.getChannelData(0)
    
    let lastOut = 0.0
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      if (type === "white") {
        output[i] = white
      } else if (type === "pink") {
        output[i] = (lastOut + 0.02 * white) / 1.02
        lastOut = output[i]
        output[i] *= 3.5
      } else if (type === "brown") {
        output[i] = (lastOut + 0.02 * white) / 1.01
        lastOut = output[i]
        output[i] *= 4.5
      }
    }
    return buffer
  }

  const startTrackSound = (track: SoundTrack) => {
    initAudioCtx()
    const ctx = audioCtxRef.current!

    // Setup master gain for this track
    const trackGain = ctx.createGain()
    const currentVol = trackVolumes[track.id] ?? 50
    const actualVolume = (currentVol / 100) * (ambientVolume / 100)
    trackGain.gain.setValueAtTime(actualVolume, ctx.currentTime)
    trackGain.connect(ctx.destination)

    const sourceNodes: any[] = []
    const intervals: any[] = []

    if (track.type === "noise" && track.noiseType) {
      const buffer = createNoiseBuffer(ctx, track.noiseType)
      const bufferSource = ctx.createBufferSource()
      bufferSource.buffer = buffer
      bufferSource.loop = true

      if (track.id === "rain") {
        const lp = ctx.createBiquadFilter()
        lp.type = "lowpass"
        lp.frequency.setValueAtTime(650, ctx.currentTime)
        bufferSource.connect(lp)
        lp.connect(trackGain)
      } else if (track.id === "fireplace") {
        const band = ctx.createBiquadFilter()
        band.type = "bandpass"
        band.frequency.setValueAtTime(260, ctx.currentTime)
        bufferSource.connect(band)
        band.connect(trackGain)

        // Spawn popping crackles
        const popInt = setInterval(() => {
          if (Math.random() > 0.45) {
            try {
              const popOsc = ctx.createOscillator()
              const popGain = ctx.createGain()
              popOsc.type = "triangle"
              popOsc.frequency.setValueAtTime(800 + Math.random() * 2200, ctx.currentTime)
              
              popGain.gain.setValueAtTime(0.04 * (trackVolumes[track.id] / 100), ctx.currentTime)
              popGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)
              
              popOsc.connect(popGain)
              popGain.connect(ctx.destination)
              popOsc.start()
              popOsc.stop(ctx.currentTime + 0.08)
            } catch {}
          }
        }, 130)
        intervals.push(popInt)
      } else if (track.id === "forest") {
        // Organic wilderness hum LFO
        const mod = ctx.createOscillator()
        const modGain = ctx.createGain()
        mod.frequency.setValueAtTime(0.2, ctx.currentTime)
        modGain.gain.setValueAtTime(140, ctx.currentTime)

        const filter = ctx.createBiquadFilter()
        filter.type = "bandpass"
        filter.frequency.setValueAtTime(450, ctx.currentTime)

        mod.connect(modGain)
        modGain.connect(filter.frequency)
        bufferSource.connect(filter)
        filter.connect(trackGain)

        mod.start()
        sourceNodes.push(mod)
      } else if (track.id === "cafe") {
        // Low passed chatter rumble
        const lp = ctx.createBiquadFilter()
        lp.type = "lowpass"
        lp.frequency.setValueAtTime(180, ctx.currentTime) // very muffled low rumble
        bufferSource.connect(lp)
        lp.connect(trackGain)

        // Occasional cup clinks
        const clinkInt = setInterval(() => {
          if (Math.random() > 0.75) {
            try {
              const osc = ctx.createOscillator()
              const clinkGain = ctx.createGain()
              const filter = ctx.createBiquadFilter()
              
              osc.type = "sine"
              osc.frequency.setValueAtTime(1800 + Math.random() * 1200, ctx.currentTime)
              
              filter.type = "highpass"
              filter.frequency.setValueAtTime(1200, ctx.currentTime)

              clinkGain.gain.setValueAtTime(0.015 * (trackVolumes[track.id] / 100), ctx.currentTime)
              clinkGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)

              osc.connect(filter)
              filter.connect(clinkGain)
              clinkGain.connect(ctx.destination)
              osc.start()
              osc.stop(ctx.currentTime + 0.15)
            } catch {}
          }
        }, 800)
        intervals.push(clinkInt)
      } else if (track.id === "ocean") {
        // Ocean swell periodic volume modulation using an oscillator
        const lfo = ctx.createOscillator()
        const lfoGain = ctx.createGain()
        lfo.type = "sine"
        lfo.frequency.setValueAtTime(0.12, ctx.currentTime) // 8 second cycle

        // Modulate volume gain node
        const swellGain = ctx.createGain()
        swellGain.gain.setValueAtTime(0.5, ctx.currentTime)
        lfoGain.gain.setValueAtTime(0.4, ctx.currentTime)

        const lp = ctx.createBiquadFilter()
        lp.type = "lowpass"
        lp.frequency.setValueAtTime(400, ctx.currentTime)

        lfo.connect(lfoGain)
        lfoGain.connect(swellGain.gain)
        
        bufferSource.connect(lp)
        lp.connect(swellGain)
        swellGain.connect(trackGain)

        lfo.start()
        sourceNodes.push(lfo)
      }

      bufferSource.start()
      sourceNodes.push(bufferSource)
    } else if (track.type === "binaural" && track.binauralFreq) {
      const oscL = ctx.createOscillator()
      const oscR = ctx.createOscillator()
      
      const pannerL = ctx.createStereoPanner()
      const pannerR = ctx.createStereoPanner()

      pannerL.pan.setValueAtTime(-1, ctx.currentTime)
      pannerR.pan.setValueAtTime(1, ctx.currentTime)

      oscL.frequency.setValueAtTime(track.binauralFreq.left, ctx.currentTime)
      oscR.frequency.setValueAtTime(track.binauralFreq.right, ctx.currentTime)

      oscL.connect(pannerL)
      pannerL.connect(trackGain)

      oscR.connect(pannerR)
      pannerR.connect(trackGain)

      oscL.start()
      oscR.start()
      
      sourceNodes.push(oscL, oscR)
    } else if (track.type === "synth") {
      if (track.id === "zen") {
        // Soft Zen bell chime scheduler
        const chimeInt = setInterval(() => {
          if (Math.random() > 0.45) {
            try {
              const notesArr = [220, 277.18, 329.63, 440, 554.37, 659.25]
              const pitch = notesArr[Math.floor(Math.random() * notesArr.length)]

              const osc = ctx.createOscillator()
              const chimeGain = ctx.createGain()
              
              osc.type = "sine"
              osc.frequency.setValueAtTime(pitch, ctx.currentTime)
              
              chimeGain.gain.setValueAtTime(0.06 * (trackVolumes[track.id] / 100), ctx.currentTime)
              chimeGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5)

              osc.connect(chimeGain)
              chimeGain.connect(trackGain)
              osc.start()
              osc.stop(ctx.currentTime + 2.5)
            } catch {}
          }
        }, 1800)
        intervals.push(chimeInt)
      } else if (track.id === "crickets") {
        // soft night crickets
        const cricketInt = setInterval(() => {
          try {
            const now = ctx.currentTime
            const osc = ctx.createOscillator()
            const cGain = ctx.createGain()
            const bqr = ctx.createBiquadFilter()

            osc.type = "triangle"
            osc.frequency.setValueAtTime(3200 + Math.random() * 200, now)

            bqr.type = "highpass"
            bqr.frequency.setValueAtTime(2500, now)

            cGain.gain.setValueAtTime(0.02 * (trackVolumes[track.id] / 100), now)
            cGain.gain.setValueAtTime(0.02 * (trackVolumes[track.id] / 100), now + 0.02)
            cGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)

            osc.connect(bqr)
            bqr.connect(cGain)
            cGain.connect(trackGain)
            osc.start()
            osc.stop(now + 0.06)
          } catch {}
        }, 180)
        intervals.push(cricketInt)
      } else if (track.id === "cosmic") {
        // Space cosmic sweep drone
        const osc1 = ctx.createOscillator()
        const osc2 = ctx.createOscillator()
        const lp = ctx.createBiquadFilter()

        osc1.type = "sawtooth"
        osc1.frequency.setValueAtTime(65, ctx.currentTime) // Low C2
        
        osc2.type = "triangle"
        osc2.frequency.setValueAtTime(65.5, ctx.currentTime) // Detuned

        lp.type = "lowpass"
        lp.frequency.setValueAtTime(150, ctx.currentTime)

        // Slow filter sweeping LFO
        const lfo = ctx.createOscillator()
        const lfoGain = ctx.createGain()
        lfo.type = "sine"
        lfo.frequency.setValueAtTime(0.05, ctx.currentTime) // 20s sweep
        lfoGain.gain.setValueAtTime(80, ctx.currentTime) // sweep 70hz to 230hz

        lfo.connect(lfoGain)
        lfoGain.connect(lp.frequency)

        osc1.connect(lp)
        osc2.connect(lp)
        lp.connect(trackGain)

        lfo.start()
        osc1.start()
        osc2.start()

        sourceNodes.push(lfo, osc1, osc2)
      }
    }

    soundNodesRef.current[track.id] = {
      gain: trackGain,
      sourceNodes,
      intervals,
    }
  }

  const stopTrackSound = (id: string) => {
    const nodeData = soundNodesRef.current[id]
    if (nodeData) {
      nodeData.sourceNodes.forEach((node) => {
        try {
          node.stop()
        } catch {}
      })
      nodeData.intervals?.forEach((int) => {
        try {
          clearInterval(int)
        } catch {}
      })
      delete soundNodesRef.current[id]
    }
  }

  const toggleTrack = (track: SoundTrack) => {
    const isPlaying = !!playingTracks[track.id]
    const nextPlaying = { ...playingTracks, [track.id]: !isPlaying }
    setPlayingTracks(nextPlaying)

    if (!isPlaying) {
      startTrackSound(track)
    } else {
      stopTrackSound(track.id)
    }
  }

  const handleVolumeChange = (id: string, vol: number) => {
    setTrackVolumes((prev) => ({ ...prev, [id]: vol }))
    
    const nodeData = soundNodesRef.current[id]
    if (nodeData && audioCtxRef.current) {
      const actualVolume = (vol / 100) * (ambientVolume / 100)
      nodeData.gain.gain.setValueAtTime(actualVolume, audioCtxRef.current.currentTime)
    }
  }

  const toggleMaster = () => {
    if (isPlayingAny) {
      Object.keys(playingTracks).forEach((id) => {
        stopTrackSound(id)
      })
      setPlayingTracks({})
    } else {
      setPlayingTracks({ rain: true })
      startTrackSound(tracks[0])
    }
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
      }}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Ambient Focus Soundboard</h1>
          <p className="text-muted-foreground mt-1">
            Upgraded premium soundboard featuring 10 customized Web Audio mathematical focus instruments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={toggleMaster}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold shadow-lg transition-all duration-300 ${
              isPlayingAny
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-gradient-to-r from-primary to-accent text-white glow-primary"
            }`}
          >
            {isPlayingAny ? (
              <>
                <Pause className="w-5 h-5 fill-white" />
                Mute Atmosphere
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" />
                Activate Ambient
              </>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Mixer controls */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Ambient Tracks Grid */}
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4 max-h-[550px] overflow-y-auto pr-1">
          {tracks.map((track) => {
            const Icon = track.icon
            const isPlaying = !!playingTracks[track.id]
            const vol = trackVolumes[track.id] ?? 50

            return (
              <motion.div
                key={track.id}
                className={`glass rounded-2xl p-4 border flex flex-col justify-between transition-all duration-300 ${
                  isPlaying ? `bg-gradient-to-br ${track.color} shadow-lg scale-[1.01]` : "bg-secondary/10 border-border/20"
                }`}
                whileHover={{ y: -2 }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-secondary/50 border border-border/10 flex items-center justify-center">
                      <Icon className={`w-5.5 h-5.5 ${isPlaying ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm leading-snug">{track.name}</h3>
                      <p className="text-[11px] text-muted-foreground/80 mt-1 leading-relaxed">{track.description}</p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleTrack(track)}
                    className={`rounded-xl border shadow-sm shrink-0 w-8 h-8 ${
                      isPlaying
                        ? "bg-white text-black hover:bg-white/90"
                        : "bg-secondary/30 text-muted-foreground hover:text-foreground border-border/10"
                    }`}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  </Button>
                </div>

                {/* Slider Mixer */}
                {isPlaying && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-3 border-t border-white/5 space-y-2"
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-muted-foreground">Volume Level</span>
                      <span className="font-mono">{vol}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={vol}
                      onChange={(e) => handleVolumeChange(track.id, parseInt(e.target.value))}
                      className="w-full h-1.5 rounded-full appearance-none bg-white/15 accent-white focus:outline-none cursor-pointer"
                    />
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Right Column: Visualizer and Mixer */}
        <div className="space-y-6">
          {/* Waveform Visualization */}
          <motion.div className="glass rounded-3xl p-6 border border-border/30 flex flex-col items-center justify-center min-h-[300px] shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent opacity-50" />
            
            <AnimatePresence mode="wait">
              {isPlayingAny ? (
                <motion.div
                  key="visualizing"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-4 relative z-10 w-full"
                >
                  <div className="flex items-end justify-center gap-1.5 h-20 w-4/5 mx-auto">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-2.5 bg-gradient-to-t from-primary to-accent rounded-full"
                        animate={{
                          height: [
                            `${15 + Math.random() * 45}px`,
                            `${40 + Math.random() * 40}px`,
                            `${10 + Math.random() * 30}px`,
                          ],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.4 + i * 0.05,
                          repeatType: "reverse",
                        }}
                      />
                    ))}
                  </div>
                  <div className="text-center mt-2">
                    <p className="text-sm font-bold flex items-center gap-2 justify-center">
                      <InfinityIcon className="w-4 h-4 text-primary animate-spin" style={{ animationDuration: '6s' }} />
                      Focus Shield Engaged
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Multi-layered acoustic buffer running</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center text-center p-6 relative z-10"
                >
                  <div className="w-16 h-16 bg-secondary/30 rounded-2xl flex items-center justify-center mb-4 border border-border/10">
                    <VolumeX className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <h3 className="font-bold text-lg">Acoustics Muted</h3>
                  <p className="text-sm text-muted-foreground/80 max-w-xs mt-2 leading-relaxed">
                    Activate any sound mix card to create a custom mathematical acoustic shield.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Master volume controller */}
          <motion.div className="glass rounded-2xl p-6 border border-border/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-sm">Master Sound Volume</h3>
              </div>
              <span className="text-xs font-mono font-bold text-muted-foreground">{ambientVolume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={ambientVolume}
              onChange={(e) => setAmbientVolume(parseInt(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none bg-secondary border border-border/10 accent-primary focus:outline-none cursor-pointer"
            />
            <p className="text-[10px] text-muted-foreground mt-3 font-semibold text-center">
              *Mixes seamlessly in the background with timer chimes and device audio streams.
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
