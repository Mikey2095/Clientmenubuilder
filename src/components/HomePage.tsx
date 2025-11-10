import { motion } from 'motion/react';
import { useEffect } from 'react';
import homeImage from 'figma:asset/8deb2f3bc7f106d635ee3b0d9495f0f08672f5ca.png';

interface HomePageProps {
  onEnter: () => void;
}

export function HomePage({ onEnter }: HomePageProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onEnter();
    }, 4000); // 4 second delay

    return () => clearTimeout(timer);
  }, [onEnter]);

  return (
    <motion.div 
      className="min-h-screen w-full overflow-hidden relative bg-[#ffefc2] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background Image - maintains aspect ratio */}
      <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <motion.img 
          src={homeImage} 
          alt="Graciela's Cocina" 
          className="max-w-full max-h-full w-auto h-auto object-contain"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}