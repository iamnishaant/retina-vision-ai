import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import AnimatedBackground from '@/components/AnimatedBackground';
import ResultsCarousel from '@/components/ResultsCarousel';
import { BarChart3, Database, Cpu, Target } from 'lucide-react';

const metrics = [
  { icon: Target, label: 'Overall Accuracy', value: '95.4%' },
  { icon: Database, label: 'Training Images', value: '88,702' },
  { icon: Cpu, label: 'Model Type', value: 'Deep CNN' },
  { icon: BarChart3, label: 'Classes', value: '5' },
];

const Results = () => {
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
              <span className="text-foreground">Model</span>
              <br />
              <span className="gradient-text">Performance Results</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore the classification results of our deep learning model trained on 
              DDR and EyePACS datasets for diabetic retinopathy detection.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Metrics */}
      <section className="py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {metrics.map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 text-center"
              >
                <metric.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-display font-bold text-foreground">{metric.value}</p>
                <p className="text-sm text-muted-foreground">{metric.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Results Carousel */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl font-bold text-foreground text-center mb-12"
          >
            Classification Results by Grade
          </motion.h2>
          
          <ResultsCarousel />
        </div>
      </section>

      {/* Detailed Results */}
      <section className="py-16 px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl font-bold text-foreground text-center mb-12"
          >
            Detailed Performance Metrics
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card overflow-hidden"
          >
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-semibold text-foreground">Class</th>
                  <th className="text-center p-4 font-semibold text-foreground">Precision</th>
                  <th className="text-center p-4 font-semibold text-foreground">Recall</th>
                  <th className="text-center p-4 font-semibold text-foreground">F1-Score</th>
                  <th className="text-center p-4 font-semibold text-foreground">Support</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {[
                  { class: 'No DR (Grade 0)', precision: '0.98', recall: '0.97', f1: '0.98', support: '25810' },
                  { class: 'Mild NPDR (Grade 1)', precision: '0.89', recall: '0.86', f1: '0.87', support: '2443' },
                  { class: 'Moderate NPDR (Grade 2)', precision: '0.91', recall: '0.93', f1: '0.92', support: '5292' },
                  { class: 'Severe NPDR (Grade 3)', precision: '0.88', recall: '0.85', f1: '0.86', support: '873' },
                  { class: 'Proliferative DR (Grade 4)', precision: '0.94', recall: '0.96', f1: '0.95', support: '708' },
                ].map((row, index) => (
                  <tr key={index} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 text-foreground font-medium">{row.class}</td>
                    <td className="p-4 text-center text-muted-foreground">{row.precision}</td>
                    <td className="p-4 text-center text-muted-foreground">{row.recall}</td>
                    <td className="p-4 text-center text-primary font-semibold">{row.f1}</td>
                    <td className="p-4 text-center text-muted-foreground">{row.support}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-muted-foreground mt-6"
          >
            * Results based on validation set from combined DDR and EyePACS datasets
          </motion.p>
        </div>
      </section>
    </div>
  );
};

export default Results;
