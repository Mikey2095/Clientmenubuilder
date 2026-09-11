import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Button } from './ui/button';

interface GalleryItem {
  url: string;
  type?: 'image' | 'video';
  caption?: string;
}

interface HeroCarouselProps {
  images: (string | GalleryItem)[];
  autoPlayInterval?: number;
}

export function HeroCarousel({ images, autoPlayInterval = 4000 }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play functionality
  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [images.length, autoPlayInterval]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (images.length === 0) {
    return (
      <div className="relative h-96 bg-gradient-to-br from-[#0f766e] via-[#0d9488] to-[#14b8a6]" />
    );
  }

  const currentItem = images[currentIndex];
  const isGalleryItem = typeof currentItem === 'object' && 'url' in currentItem;
  const itemUrl = isGalleryItem ? currentItem.url : currentItem;
  const itemType = isGalleryItem ? currentItem.type : 'image';

  return (
    <div className="relative h-96 overflow-hidden">
      {/* Carousel Images/Videos */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          {itemType === 'video' ? (
            <video
              src={itemUrl}
              className="w-full h-96 object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <ImageWithFallback
              src={itemUrl}
              alt={`Slide ${currentIndex + 1}`}
              className="w-full h-96 object-cover"
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-15 bg-black/30 hover:bg-black/50 text-white rounded-full w-10 h-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-15 bg-black/30 hover:bg-black/50 text-white rounded-full w-10 h-10"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </>
      )}

      {/* Navigation Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-15 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}