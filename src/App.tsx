import { motion, useScroll, useTransform } from 'motion/react';
import { DollarSign, ArrowRight, Github, Twitter, Globe } from 'lucide-react';
import { useState } from 'react';
import AbsurdBackground from './components/AbsurdBackground';
import LaserEyesHero from './components/LaserEyesHero';
import ContractAddress from './components/ContractAddress';
import Tokenomics from './components/Tokenomics';
import LiveIndexer from './components/LiveIndexer';
import { t, Lang } from './translations';

export default function App() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  
  const [lang, setLang] = useState<Lang>('en');
  
  const toggleLang = () => {
    setLang(l => l === 'en' ? 'zh' : 'en');
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden selection:bg-yellow-400 selection:text-black">
      {/* Background Gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900 via-black to-black opacity-90 z-0" />
      
      {/* Interactive Absurd Effect */}
      <AbsurdBackground />

      {/* Navigation */}
      <nav className="relative z-50 p-6 flex justify-between items-center max-w-7xl mx-auto backdrop-blur-xl bg-black/40 rounded-b-[40px] border-x-4 border-b-4 border-yellow-400 shadow-[0_10px_30px_rgba(250,204,21,0.3)]">
        <div className="flex items-center gap-2 font-black text-4xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-yellow-400 hover:scale-110 transition-transform cursor-pointer">
          <DollarSign className="text-yellow-400" strokeWidth={4} size={36} />
          MILLI
        </div>
        <div className="flex gap-4 items-center">
          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleLang}
            className="hidden sm:flex bg-gradient-to-r from-green-600 to-green-800 border-2 border-yellow-400 font-bold text-yellow-400 px-4 py-2 rounded-xl items-center gap-2 shadow-[0_0_15px_rgba(250,204,21,0.5)] uppercase"
          >
            <Globe size={18} />
            {t[lang].langSwitch}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleLang}
            className="flex sm:hidden w-10 h-10 bg-gradient-to-r from-green-600 to-green-800 border-2 border-yellow-400 rounded-xl items-center justify-center text-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]"
          >
            <Globe size={20} />
          </motion.button>
          
          <motion.a 
            whileHover={{ scale: 1.2, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            href="#" 
            className="w-12 h-12 bg-black border-2 border-yellow-400 rounded-full flex items-center justify-center text-yellow-400 hover:bg-yellow-400 hover:text-black transition-colors shadow-[0_0_15px_rgba(250,204,21,0.5)]"
          >
            <Twitter size={24} />
          </motion.a>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-[90vh] flex flex-col items-center justify-center px-4 pt-4 pb-10 text-center">
          
          <div className="w-full mb-12 mt-4">
            <LiveIndexer lang={lang} />
          </div>

          <LaserEyesHero />

          <motion.h1 
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="text-7xl md:text-[12rem] font-black uppercase tracking-tighter mb-2"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-400 to-yellow-600 drop-shadow-[0_10px_30px_rgba(250,204,21,0.8)]">
              $MILLI
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-5xl font-black text-green-400 mb-12 max-w-4xl drop-shadow-[0_0_15px_rgba(74,222,128,0.8)] uppercase"
          >
            {t[lang].subtitle}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
            className="flex flex-col sm:flex-row gap-6 items-center w-full max-w-md mx-auto mb-10"
          >
            <motion.button
              whileHover={{ scale: 1.1, rotate: -3 }}
              whileTap={{ scale: 0.9 }}
              animate={{
                boxShadow: ["0 0 20px rgba(250,204,21,0.5)", "0 0 60px rgba(250,204,21,1)", "0 0 20px rgba(250,204,21,0.5)"]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 text-black font-black text-2xl py-6 px-12 rounded-[40px] w-full flex items-center justify-center gap-3 border-4 border-white transition-all uppercase"
            >
              {t[lang].buyNow} <ArrowRight strokeWidth={4} size={32} />
            </motion.button>
          </motion.div>

          <div className="w-full mt-10">
            <ContractAddress lang={lang} />
          </div>
        </section>

        {/* Marquee Banner */}
        <div className="bg-yellow-400 text-black py-6 overflow-hidden rotate-[-3deg] scale-110 shadow-[0_0_50px_rgba(250,204,21,0.8)] relative z-20 border-y-8 border-green-600 mt-20">
          <motion.div 
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="flex whitespace-nowrap gap-12 text-5xl font-black uppercase tracking-widest"
          >
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="flex items-center gap-12">
                <span className="drop-shadow-[0_5px_0_rgba(22,163,74,1)]">{t[lang].marquee1}</span>
                <span className="text-6xl animate-bounce">🤑</span>
                <span className="drop-shadow-[0_5px_0_rgba(22,163,74,1)]">{t[lang].marquee2}</span>
                <span className="text-6xl animate-bounce">🚀</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Tokenomics Section */}
        <Tokenomics lang={lang} />

        {/* Footer */}
        <footer className="bg-black border-t-8 border-yellow-400 py-16 px-6 relative z-10 mt-20">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-6xl font-black text-yellow-400 mb-8 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]">$MILLI</h2>
            <p className="text-green-300 font-bold text-lg md:text-xl leading-relaxed mb-10 max-w-3xl mx-auto uppercase">
              {t[lang].footer}
            </p>
            <div className="text-green-600 font-black text-sm uppercase bg-green-950/50 inline-block px-6 py-3 rounded-full border border-green-800">
              {t[lang].footerRights}
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
