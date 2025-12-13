import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import promoSlide1 from '@/assets/promo-slide-1.png';
import promoSlide2 from '@/assets/promo-slide-2.png';
import promoSlide3 from '@/assets/promo-slide-3.png';
import promoSlide4 from '@/assets/promo-slide-4.png';
import promoSlide5 from '@/assets/promo-slide-5.png';

const slides = [
  { image: promoSlide1, title: "Dashboard intuitif" },
  { image: promoSlide4, title: "Fonctionnalités complètes" },
  { image: promoSlide3, title: "Pour les éleveurs exigeants" },
  { image: promoSlide5, title: "Suivi santé" },
  { image: promoSlide2, title: "Commencez maintenant" },
];

const PromoSlideshow = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div 
      className="relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl bg-card/50 backdrop-blur-sm border border-primary/20"
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
    >
      {/* Aspect ratio container */}
      <div className="relative aspect-video">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <img
              src={slides[currentSlide].image}
              alt={slides[currentSlide].title}
              className="w-full h-full object-cover"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Title overlay */}
        <motion.div 
          key={`title-${currentSlide}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="absolute bottom-6 left-6 right-6"
        >
          <h3 className="text-xl md:text-2xl font-bold text-foreground drop-shadow-lg">
            {slides[currentSlide].title}
          </h3>
        </motion.div>

        {/* Progress dots */}
        <div className="absolute bottom-6 right-6 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-primary w-6' 
                  : 'bg-foreground/30 hover:bg-foreground/50'
              }`}
            />
          ))}
        </div>

        {/* Play/Pause indicator */}
        <div className="absolute top-4 right-4">
          <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-primary animate-pulse' : 'bg-muted-foreground'}`} />
        </div>
      </div>

      {/* Decorative glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-2xl blur-xl -z-10" />
    </div>
  );
};

export default PromoSlideshow;
