import { motion } from 'framer-motion';
import { ArrowRight, Eye, Activity, AlertCircle, Microscope } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimatedBackground from '@/components/AnimatedBackground';
import SearchBar from '@/components/SearchBar';
import Navbar from '@/components/Navbar';
import InfoCard from '@/components/InfoCard';

const Index = () => {
  return (
    <div className="min-h-screen animated-bg relative overflow-hidden">
      <AnimatedBackground />
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto z-10"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-8"
          >
            <Eye className="h-4 w-4 text-primary" />
            <span className="text-sm text-primary font-medium">AI-Powered Diabetic Retinopathy Detection</span>
          </motion.div>

          <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="text-foreground">Protecting Vision with</span>
            <br />
            <span className="gradient-text">Deep Learning</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Advanced retinal image analysis using state-of-the-art deep learning models 
            for early detection and classification of diabetic retinopathy.
          </p>

          <SearchBar />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
          >
            <Link
              to="/upload"
              className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-xl flex items-center gap-2 hover:shadow-[0_0_30px_rgba(79,209,197,0.4)] transition-all duration-300 hover:scale-105"
            >
              Analyze Retinal Image
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/about-dr"
              className="px-8 py-4 bg-secondary text-secondary-foreground font-semibold rounded-xl hover:bg-secondary/80 transition-all duration-300"
            >
              Learn About DR
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-primary/50 flex items-start justify-center p-2"
          >
            <div className="w-1.5 h-3 bg-primary rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Quick Info Section */}
      <section className="relative py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl font-bold text-foreground mb-4">
              What is Diabetic Retinopathy?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A serious eye condition that affects people with diabetes, caused by damage to blood vessels in the retina.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <InfoCard
              icon={Eye}
              title="Vision Threat"
              description="Leading cause of blindness in working-age adults. Early detection is crucial for preventing vision loss."
              delay={0.1}
            />
            <InfoCard
              icon={Activity}
              title="Progressive Disease"
              description="Develops in stages from mild to severe. Regular screening can catch it early when treatment is most effective."
              delay={0.2}
            />
            <InfoCard
              icon={AlertCircle}
              title="Silent Symptoms"
              description="Often has no symptoms in early stages. By the time vision is affected, significant damage may have occurred."
              delay={0.3}
            />
            <InfoCard
              icon={Microscope}
              title="AI Detection"
              description="Our deep learning model analyzes retinal fundus images to detect and classify DR with high accuracy."
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-12 glow-border"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Analyze Your Retinal Images?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Upload fundus images from DDR or EyePACS datasets for instant AI-powered analysis.
            </p>
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-10 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(79,209,197,0.4)] transition-all duration-300 hover:scale-105"
            >
              Start Analysis
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-8 px-6 border-t border-border/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            <span className="font-display font-semibold">DRVision</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Deep Learning Research Project • DDR & EyePACS Datasets
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
