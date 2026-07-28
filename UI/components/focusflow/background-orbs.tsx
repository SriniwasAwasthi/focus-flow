"use client"

export function BackgroundOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Primary purple orb */}
      <div 
        className="absolute w-96 h-96 rounded-full floating-orb opacity-30"
        style={{
          background: 'radial-gradient(circle, oklch(0.5 0.2 280 / 0.4) 0%, transparent 70%)',
          top: '10%',
          left: '10%',
          filter: 'blur(60px)',
        }}
      />
      
      {/* Cyan accent orb */}
      <div 
        className="absolute w-80 h-80 rounded-full floating-orb opacity-25"
        style={{
          background: 'radial-gradient(circle, oklch(0.6 0.15 200 / 0.4) 0%, transparent 70%)',
          top: '50%',
          right: '5%',
          filter: 'blur(50px)',
          animationDelay: '-5s',
        }}
      />
      
      {/* Indigo orb */}
      <div 
        className="absolute w-72 h-72 rounded-full floating-orb opacity-20"
        style={{
          background: 'radial-gradient(circle, oklch(0.5 0.18 260 / 0.4) 0%, transparent 70%)',
          bottom: '10%',
          left: '30%',
          filter: 'blur(40px)',
          animationDelay: '-10s',
        }}
      />
      
      {/* Small accent orb */}
      <div 
        className="absolute w-48 h-48 rounded-full floating-orb opacity-30"
        style={{
          background: 'radial-gradient(circle, oklch(0.7 0.2 300 / 0.3) 0%, transparent 70%)',
          top: '30%',
          right: '30%',
          filter: 'blur(30px)',
          animationDelay: '-15s',
        }}
      />
    </div>
  )
}
