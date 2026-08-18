import { motion } from "motion/react";
import { useEffect, useState } from "react";

const wealthImages = [
  "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=400&q=80", // Lambo
  "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=400&q=80", // Gold
  "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=400&q=80", // Yacht
  "https://images.unsplash.com/photo-1621504450181-5d356f61d307?w=400&q=80", // Crypto
  "https://images.unsplash.com/photo-1580519542036-ed47f3e42d9d?w=400&q=80", // Cash
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80", // Diamonds
];

export default function AbsurdBackground() {
  const [elements, setElements] = useState<any[]>([]);

  useEffect(() => {
    const newElements = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      img: wealthImages[Math.floor(Math.random() * wealthImages.length)],
      left: `${Math.random() * 100}%`,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 5,
      size: Math.random() * 120 + 80,
      rotateTo: Math.random() > 0.5 ? 1080 : -1080,
    }));
    setElements(newElements);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden mix-blend-screen opacity-50">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-600/30 via-black to-black animate-pulse"></div>
      
      {elements.map((el) => (
        <motion.div
          key={el.id}
          className="absolute top-[-300px] rounded-[40px] border-4 border-yellow-400 shadow-[0_0_50px_rgba(250,204,21,1)] overflow-hidden"
          initial={{ y: -300, x: 0, opacity: 0, rotate: 0 }}
          animate={{
            y: "120vh",
            x: Math.random() * 400 - 200,
            opacity: [0, 1, 1, 0],
            rotate: el.rotateTo,
          }}
          transition={{
            duration: el.duration,
            delay: el.delay,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            left: el.left,
            width: el.size,
            height: el.size,
          }}
        >
          <img src={el.img} className="w-full h-full object-cover scale-125 saturate-200 hue-rotate-15" alt="absurd wealth" />
        </motion.div>
      ))}
    </div>
  );
}
