import { motion } from 'motion/react';

export default function LaserEyesHero() {
  return (
    <div className="relative w-64 h-64 md:w-96 md:h-96 mx-auto mb-10 group perspective-1000 z-20">
      <motion.div 
        animate={{ 
          rotateY: [0, 15, -15, 0], 
          rotateZ: [0, 5, -5, 0],
          scale: [1, 1.05, 1] 
        }}
        transition={{ 
          rotateY: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          rotateZ: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }}
        className="w-full h-full rounded-full border-[12px] border-yellow-400 overflow-hidden shadow-[0_0_150px_rgba(250,204,21,1)] relative transform-style-3d bg-green-900"
      >
        <img 
          src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&q=80" 
          alt="Rich Doge" 
          className="w-full h-full object-cover scale-110 group-hover:scale-125 transition-transform duration-500 saturate-200 contrast-125"
        />
        
        {/* Laser Eyes (Absurd Overlays) */}
        {/* Left Eye */}
        <div className="absolute top-[38%] left-[30%] w-6 h-6 bg-red-500 rounded-full shadow-[0_0_30px_15px_rgba(239,68,68,1)] animate-ping mix-blend-screen">
            <div className="absolute top-1/2 left-1/2 w-[500px] h-4 bg-red-500 origin-left -rotate-45 shadow-[0_0_30px_10px_rgba(239,68,68,1)] z-50"></div>
            <div className="absolute top-1/2 left-1/2 w-[500px] h-2 bg-white origin-left -rotate-45 z-50"></div>
        </div>
        
        {/* Right Eye */}
        <div className="absolute top-[38%] right-[32%] w-6 h-6 bg-red-500 rounded-full shadow-[0_0_30px_15px_rgba(239,68,68,1)] animate-ping mix-blend-screen">
            <div className="absolute top-1/2 left-1/2 w-[500px] h-4 bg-red-500 origin-left -rotate-[35deg] shadow-[0_0_30px_10px_rgba(239,68,68,1)] z-50"></div>
            <div className="absolute top-1/2 left-1/2 w-[500px] h-2 bg-white origin-left -rotate-[35deg] z-50"></div>
        </div>
      </motion.div>
    </div>
  )
}
