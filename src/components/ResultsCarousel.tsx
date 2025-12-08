import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ResultCard {
  id: number;
  title: string;
  severity: string;
  accuracy: string;
  description: string;
  color: string;
}

const results: ResultCard[] = [
  {
    id: 0,
    title: 'No DR',
    severity: 'Grade 0',
    accuracy: '98.2%',
    description: 'No visible signs of diabetic retinopathy detected. Healthy retinal appearance with normal blood vessel patterns.',
    color: 'from-green-500/30 to-emerald-500/30',
  },
  {
    id: 1,
    title: 'Mild NPDR',
    severity: 'Grade 1',
    accuracy: '95.8%',
    description: 'Presence of microaneurysms only. Early stage with minimal damage to blood vessels.',
    color: 'from-yellow-500/30 to-amber-500/30',
  },
  {
    id: 2,
    title: 'Moderate NPDR',
    severity: 'Grade 2',
    accuracy: '94.5%',
    description: 'Multiple microaneurysms, dot hemorrhages, and hard exudates present. Requires monitoring.',
    color: 'from-orange-500/30 to-amber-600/30',
  },
  {
    id: 3,
    title: 'Severe NPDR',
    severity: 'Grade 3',
    accuracy: '93.1%',
    description: 'Extensive hemorrhages, venous beading, and intraretinal microvascular abnormalities (IRMA).',
    color: 'from-red-500/30 to-rose-500/30',
  },
  {
    id: 4,
    title: 'Proliferative DR',
    severity: 'Grade 4',
    accuracy: '96.7%',
    description: 'Advanced stage with neovascularization, vitreous hemorrhage, and risk of retinal detachment.',
    color: 'from-purple-500/30 to-red-500/30',
  },
];

const ResultsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % results.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative h-[400px] perspective-1000">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="absolute inset-0"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className={`h-full glass-card overflow-hidden bg-gradient-to-br ${results[currentIndex].color}`}>
              <div className="p-8 h-full flex flex-col justify-between relative">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-60 h-60 bg-primary/5 rounded-full blur-3xl" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-sm font-medium px-4 py-2 rounded-full bg-primary/20 text-primary border border-primary/30">
                      {results[currentIndex].severity}
                    </span>
                    <span className="text-3xl font-display font-bold text-primary glow-text">
                      {results[currentIndex].accuracy}
                    </span>
                  </div>
                  
                  <h3 className="text-4xl font-display font-bold text-foreground mb-4">
                    {results[currentIndex].title}
                  </h3>
                  
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {results[currentIndex].description}
                  </p>
                </div>

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                    <span className="text-sm text-muted-foreground">Classification Result</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Model: Deep Learning CNN
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Dots */}
      <div className="flex justify-center gap-3 mt-6">
        {results.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-primary w-8 shadow-[0_0_15px_rgba(79,209,197,0.5)]'
                : 'bg-muted hover:bg-muted-foreground'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ResultsCarousel;
