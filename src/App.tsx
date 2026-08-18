import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Flame } from 'lucide-react';
import { t, Lang } from '../translations';

export default function LiveIndexer({ lang }: { lang: Lang }) {
  const [supply, setSupply] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [justUpdated, setJustUpdated] = useState(false);

  const MAX_SUPPLY = 500000; // 500,000 $MILLI
  const TARGET_CA = "0x211f03ACa1F0D096D56ba277A4B13a95E177f1Bc";

  const fetchSupply = async () => {
    try {
      const res = await fetch(`https://robinhoodchain.blockscout.com/api/v2/tokens/${TARGET_CA}`);
      const data = await res.json();
      
      if (data && data.total_supply) {
        const rawSupply = BigInt(data.total_supply);
        const decimals = BigInt(data.decimals || "18");
        const formattedSupply = Number(rawSupply / (10n ** decimals));
        
        setSupply((prev) => {
          if (prev !== formattedSupply && prev !== 0) {
            // Trigger animation on change
            setJustUpdated(true);
            setTimeout(() => setJustUpdated(false), 2000);
          }
          return formattedSupply;
        });
      }
    } catch (err) {
      console.error("Failed to fetch $MILLI supply:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupply();
    // Auto-refresh every 20 seconds
    const interval = setInterval(fetchSupply, 20000);
    return () => clearInterval(interval);
  }, []);

  const formattedNumber = new Intl.NumberFormat('en-US').format(supply);
  const progressPercentage = Math.min((supply / MAX_SUPPLY) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className="w-full max-w-4xl mx-auto relative z-20 group"
    >
      {/* Outer Absurd Glow Container */}
      <motion.div 
        animate={{ 
          boxShadow: [
            "0 0 30px rgba(34,197,94,0.3)", 
            "0 0 80px rgba(34,197,94,0.6)", 
            "0 0 30px rgba(34,197,94,0.3)"
          ] 
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="bg-black border-4 border-green-500 rounded-[40px] p-6 md:p-10 relative overflow-hidden backdrop-blur-xl"
      >
        {/* Animated Background Stripes */}
        <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#22c55e_10px,#22c55e_20px)] animate-[pan_60s_linear_infinite]"></div>

        <div className="relative z-10 flex flex-col items-center text-center">
          
          <h2 className="text-2xl md:text-4xl font-black text-yellow-400 uppercase tracking-widest mb-4 flex items-center gap-3 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]">
            <Flame size={40} className="text-red-500 animate-pulse" />
            {t[lang].liveTitle}
            <Flame size={40} className="text-red-500 animate-pulse" />
          </h2>

          <p className="text-green-300 font-bold uppercase tracking-wider text-sm md:text-lg mb-2">
            {t[lang].minted}
          </p>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-5xl md:text-7xl font-black text-green-500 font-mono tracking-tighter py-4 animate-pulse"
              >
                {t[lang].printing}
              </motion.div>
            ) : (
              <motion.div
                key="supply"
                animate={justUpdated ? { 
                  scale: [1, 1.2, 0.9, 1.1, 1],
                  color: ["#4ade80", "#facc15", "#ef4444", "#4ade80"] 
                } : {}}
                transition={{ duration: 0.6 }}
                className="text-6xl md:text-[6rem] font-black text-green-400 font-mono tracking-tighter py-2 drop-shadow-[0_0_20px_rgba(74,222,128,1)] break-all"
              >
                {formattedNumber}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Absurd Progress Bar */}
          <div className="w-full mt-6 relative">
            <div className="w-full h-10 bg-green-950 rounded-full border-2 border-green-700 overflow-hidden relative shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1.5, type: "spring" }}
                className="h-full bg-gradient-to-r from-green-600 via-yellow-400 to-green-500 rounded-full relative"
              >
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.5)_50%,transparent_100%)] animate-[shimmer_2s_infinite]"></div>
              </motion.div>
            </div>
            
            {/* Flying Lambo Indicator */}
            <motion.div 
              animate={{ left: `${progressPercentage}%` }}
              transition={{ duration: 1.5, type: "spring" }}
              className="absolute top-[-24px] ml-[-20px] text-5xl drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)] z-20"
            >
              🏎️💨
            </motion.div>
          </div>
          
          <div className="flex justify-between w-full mt-6 text-sm md:text-base font-black text-green-400 uppercase font-mono bg-black/50 py-2 px-4 rounded-xl border border-green-500/50">
            <span>{progressPercentage.toFixed(2)}%</span>
            <span>{new Intl.NumberFormat('en-US').format(MAX_SUPPLY)} TARGET</span>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-green-500 font-bold bg-green-900/40 px-4 py-2 rounded-full border border-green-700">
            <RefreshCw size={16} className="animate-spin" />
            <span>{t[lang].refreshing}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
