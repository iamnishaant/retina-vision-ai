import { motion } from 'framer-motion';
import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import AnimatedBackground from '@/components/AnimatedBackground';
import Eye3D from '@/components/Eye3D';

const eyeParts = [
  {
    name: 'Retina',
    description: 'The light-sensitive layer at the back of the eye that converts light into electrical signals. This is where diabetic retinopathy causes damage.',
    importance: 'Primary site of DR damage',
  },
  {
    name: 'Macula',
    description: 'The central part of the retina responsible for sharp, detailed central vision. Macular edema is a common complication of DR.',
    importance: 'Critical for central vision',
  },
  {
    name: 'Optic Nerve',
    description: 'Transmits visual information from the retina to the brain. Made up of over a million nerve fibers.',
    importance: 'Vision signal transmission',
  },
  {
    name: 'Blood Vessels',
    description: 'Network of arteries and veins that supply oxygen and nutrients to the retina. These are directly affected by diabetic retinopathy.',
    importance: 'Directly affected by DR',
  },
  {
    name: 'Vitreous',
    description: 'The clear gel that fills the space between the lens and retina. Can become clouded by hemorrhages in advanced DR.',
    importance: 'May hemorrhage in PDR',
  },
  {
    name: 'Lens',
    description: 'Focuses light onto the retina. People with diabetes are also at higher risk for cataracts.',
    importance: 'Light focusing',
  },
];

const EyeAnatomy = () => {
  return (
    <div className="min-h-screen animated-bg relative">
      <AnimatedBackground />
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-5xl md:text-6xl font-bold mb-6">
              <span className="text-foreground">Interactive</span>
              <br />
              <span className="gradient-text">Eye Anatomy</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore the human eye in 3D. Hover over different parts to learn about their 
              function and how they are affected by diabetic retinopathy.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 3D Eye Model */}
      <section className="py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Suspense fallback={
              <div className="h-[500px] glass-card flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading 3D Model...</p>
                </div>
              </div>
            }>
              <Eye3D />
            </Suspense>
          </motion.div>
        </div>
      </section>

      {/* Eye Parts Information */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl font-bold text-foreground text-center mb-12"
          >
            Key Structures Affected by DR
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eyeParts.map((part, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 card-hover"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-semibold text-lg text-foreground">{part.name}</h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
                    {part.importance}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {part.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Retinal Imaging Info */}
      <section className="py-16 px-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8 md:p-12"
          >
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              Retinal Fundus Imaging
            </h2>
            <p className="text-muted-foreground mb-6">
              Fundus photography is a specialized form of medical imaging that captures a photograph of the 
              back of the eye (the fundus), including the retina, optic disc, macula, and blood vessels.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-muted/50">
                <h4 className="font-semibold text-foreground mb-2">DDR Dataset</h4>
                <p className="text-sm text-muted-foreground">
                  High-quality fundus images specifically collected for diabetic retinopathy detection research.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-muted/50">
                <h4 className="font-semibold text-foreground mb-2">EyePACS Dataset</h4>
                <p className="text-sm text-muted-foreground">
                  Large-scale dataset with over 88,000 retinal images, widely used for DR classification models.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default EyeAnatomy;
