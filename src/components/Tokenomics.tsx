import { motion } from "motion/react";
import { Wallet, Gem, HeartHandshake, Plane } from "lucide-react";
import { t, Lang } from "../translations";

export default function Tokenomics({ lang }: { lang: Lang }) {
  const cards = [
    {
      title: t[lang].card1Title,
      desc: t[lang].card1Desc,
      icon: <HeartHandshake className="w-14 h-14 text-yellow-400 group-hover:text-red-500 transition-colors" />,
      delay: 0.1,
    },
    {
      title: t[lang].card2Title,
      desc: t[lang].card2Desc,
      icon: <Plane className="w-14 h-14 text-yellow-400 group-hover:text-blue-500 transition-colors" />,
      delay: 0.2,
    },
    {
      title: t[lang].card3Title,
      desc: t[lang].card3Desc,
      icon: <Wallet className="w-14 h-14 text-yellow-400 group-hover:text-green-500 transition-colors" />,
      delay: 0.3,
    },
    {
      title: t[lang].card4Title,
      desc: t[lang].card4Desc,
      icon: <Gem className="w-14 h-14 text-yellow-400 group-hover:text-purple-500 transition-colors" />,
      delay: 0.4,
    },
  ];

  return (
    <div className="py-24 relative z-10 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-20 relative">
        <motion.div
           animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
           transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
           className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-yellow-400 blur-[100px] opacity-50 z-0"
        />
        <motion.h2 
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 drop-shadow-[0_10px_20px_rgba(250,204,21,0.5)] mb-4 relative z-10 uppercase transform hover:skew-x-12 transition-transform"
        >
          {t[lang].nomicsTitle}
        </motion.h2>
        <p className="text-2xl md:text-3xl text-green-300 font-bold uppercase relative z-10 tracking-widest bg-black/50 inline-block px-6 py-2 rounded-full border border-green-500">
          {t[lang].nomicsSub}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 50, rotateX: 90 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true }}
            transition={{ delay: card.delay, type: "spring", stiffness: 100 }}
            whileHover={{ 
              scale: 1.1, 
              rotateZ: i % 2 === 0 ? 3 : -3, 
              y: -20,
              boxShadow: "0 0 50px rgba(250, 204, 21, 0.8)"
            }}
            className="group bg-gradient-to-br from-green-900 to-black border-4 border-green-500 p-10 rounded-[40px] backdrop-blur-xl flex flex-col items-center gap-6 shadow-[0_0_30px_rgba(34,197,94,0.3)] relative overflow-hidden text-center cursor-pointer"
          >
            {/* Absurd Glow on Hover */}
            <div className="absolute inset-0 bg-yellow-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300 mix-blend-overlay"></div>
            
            <motion.div 
              whileHover={{ rotate: 360, scale: 1.2 }}
              transition={{ duration: 0.5 }}
              className="bg-black p-6 rounded-full border-4 border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.5)] relative z-10"
            >
              {card.icon}
            </motion.div>
            <div className="relative z-10">
              <h3 className="text-3xl font-black text-yellow-400 mb-4 group-hover:text-white transition-colors uppercase tracking-widest">{card.title}</h3>
              <p className="text-xl text-green-100 font-bold leading-relaxed">{card.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
