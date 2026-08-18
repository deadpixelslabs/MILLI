import { motion } from "motion/react";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { t, Lang } from "../translations";

export default function ContractAddress({ lang }: { lang: Lang }) {
  const [copied, setCopied] = useState(false);
  const CA = "0x211f03aca1f0d096d56ba277a4b13a95e177f1bc";

  const handleCopy = () => {
    navigator.clipboard.writeText(CA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      whileHover={{ scale: 1.05, rotate: 1 }}
      className="bg-green-900/60 border-4 border-yellow-400 p-6 md:p-8 rounded-[40px] max-w-3xl mx-auto backdrop-blur-xl relative overflow-hidden group shadow-[0_0_80px_rgba(250,204,21,0.5)]"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:animate-[shimmer_1s_infinite]"></div>
      
      <div className="text-center mb-6 relative z-10">
        <h3 className="text-yellow-400 font-black text-3xl md:text-4xl uppercase tracking-widest mb-2 drop-shadow-[0_0_15px_rgba(250,204,21,1)]">
          {t[lang].caTitle}
        </h3>
        <p className="text-white text-sm md:text-base font-black bg-green-800/80 inline-block px-4 py-2 rounded-full border-2 border-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]">
          {t[lang].network}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
        <div className="bg-black border-2 border-yellow-400/50 px-4 py-5 rounded-2xl flex-1 w-full font-mono text-sm sm:text-xl text-green-400 truncate shadow-inner text-center sm:text-left">
          {CA}
        </div>
        <motion.button
          whileHover={{ scale: 1.1, rotate: -2 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleCopy}
          className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-black font-black text-xl py-5 px-8 rounded-2xl flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(250,204,21,0.8)] w-full sm:w-auto transition-all"
        >
          {copied ? (
            <>
              <Check size={28} strokeWidth={4} />
              <span>{t[lang].copied}</span>
            </>
          ) : (
            <>
              <Copy size={28} strokeWidth={3} />
              <span>{t[lang].copy}</span>
            </>
          )}
        </motion.button>
      </div>
      
      <div className="text-center mt-6 text-sm md:text-base text-red-500 font-black uppercase relative z-10 animate-pulse bg-black/50 py-2 rounded-xl">
        🚨 {t[lang].verify} 🚨
      </div>
    </motion.div>
  );
}
