import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { Link } from 'react-router-dom';
import AnimatedBackground from '@/components/AnimatedBackground';
import ResultsCarousel from '@/components/ResultsCarousel';
import { BarChart3, Database, Cpu, Target } from 'lucide-react';

const metrics = [
  { icon: Target, label: 'Overall Accuracy', value: '90.42%' },
  { icon: Database, label: 'Training Images', value: '88,702' },
  { icon: Cpu, label: 'Model Type', value: 'Deep CNN' },
  { icon: BarChart3, label: 'Classes', value: '5' },
];

const performanceComparison = [
  { metric: 'Accuracy', our: '90.42%', fa: '82.10%', fa_kc: '84.49%', comment: 'our model surpasses due to stronger backbone + end-to-end learning' },
  { metric: 'QWK Score', our: '94.17%', fa: '82.68%', fa_kc: '86.17%', comment: 'our QWK =94~95%, our model outperform their best refined fusion' },
  { metric: 'Backbone', our: 'EfficientNet B3 / ConvNeXt-Small / Swin(Tiny)', fa: 'ResNet50', fa_kc: 'ResNet50', comment: 'Modern architectures extract finer retinal lesion features' },
  { metric: 'Explainability', our: 'Grad-CAM', fa: 'No explicit XAI', fa_kc: 'Lesion detector + rules', comment: 'Our method is simpler but more stable' },
  { metric: 'Training Pipeline', our: 'End-to-end unified model', fa: 'Two modules (FA + KC)', fa_kc: 'Two modules + rules', comment: 'Rule-based fusion introduces inconsistency' },
  { metric: 'Data Preprocessing', our: 'Advanced, optimized', fa: 'Basic normalization', fa_kc: 'Same as FA', comment: 'Strong influence on micro-lesion visibility' },
  { metric: 'Handling Class Imbalance', our: 'Weighted loss', fa: 'None mentioned', fa_kc: 'None', comment: 'Major reason for our higher DR1/DR3 recall' },
  { metric: 'Inference Stability', our: 'High', fa: 'Moderate', fa_kc: 'Lower (KC-Net fails on DR4)', comment: 'Paper admits KC-Net cannot classify DR4' },
];

const Results = () => {
  return (
    <div className="min-h-screen animated-bg relative pt-20">
      <AnimatedBackground />
      <Navbar />
      <div className="flex justify-between px-6 pt-6">
        <Link to="/eye-anatomy" className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg hover:scale-105 transition">Previous</Link>
        <Link to="/upload" className="px-6 py-3 rounded-xl bg-accent text-accent-foreground font-bold shadow-lg hover:scale-105 transition">Next</Link>
      </div>
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
          {/* Performance comparison table from literature */}
          <div className="mt-6 glass-card p-4">
            <h3 className="font-semibold mb-3">Performance Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-grey-200">
                  <tr>
                    <th className="p-2 text-left">Metric</th>
                    <th className="p-2 text-left">Our Model</th>
                    <th className="p-2 text-left">FA-Net (Paper)</th>
                    <th className="p-2 text-left">FA+KC-Net (R2)</th>
                    <th className="p-2 text-left">Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {performanceComparison.map((r, i) => (
                    <tr key={i} className="border-t align-top">
                      <td className="p-2 font-medium align-top">{r.metric}</td>
                      <td className="p-2 align-top">{r.our}</td>
                      <td className="p-2 align-top">{r.fa}</td>
                      <td className="p-2 align-top">{r.fa_kc}</td>
                      <td className="p-2 align-top text-sm text-muted-foreground">{r.comment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Embedded ablation QWK visualization */}
            <div className="mt-4">
              <h4 className="font-medium mb-2">Ablation QWK Visualization</h4>
              <div className="w-full rounded-lg overflow-hidden border border-border">
                <iframe
                  src="/g3_results/fusion_ablation_qwk.html"
                  title="Fusion Ablation QWK"
                  className="w-full h-56 md:h-72 border-0"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">Ablation study visualization for QWK across model variants.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Results Carousel removed per request */}

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
                {
                  [
  { class: 'No DR (Grade 0)', precision: '0.9289', recall: '0.9734', f1: '0.9506', support: '940' },
  { class: 'Mild NPDR (Grade 1)', precision: '0.5000', recall: '0.4211', f1: '0.4571', support: '95' },
  { class: 'Moderate NPDR (Grade 2)', precision: '0.9155', recall: '0.9033', f1: '0.9094', support: '672' },
  { class: 'Severe NPDR (Grade 3)', precision: '0.6000', recall: '0.3429', f1: '0.4364', support: '35' },
  { class: 'Proliferative DR (Grade 4)', precision: '0.9542', recall: '0.9124', f1: '0.9328', support: '137' }
]

.map((row, index) => (
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

          {/* Interactive 3D Visualizations */}
          <section className="mt-12">
            <h3 className="text-2xl font-semibold text-foreground text-center mb-6">Interactive 3D Visualizations</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold">Fusion Confidence Calibration (3D)</h4>
                  <a
                    href="/g3_results/fusion_confidence_calibration.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary underline"
                  >
                    Open in new tab
                  </a>
                </div>
                <div className="w-full rounded-lg overflow-hidden border border-border">
                  <iframe
                    src="/g3_results/fusion_confidence_calibration.html"
                    title="Fusion Confidence Calibration 3D"
                    className="w-full h-64 md:h-80 border-0"
                  />
                </div>
              </div>

              <div className="glass-card p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold">Absolute Ordinal Error (3D)</h4>
                  <a
                    href="/g3_results/fusion_absolute_ordinal_error.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary underline"
                  >
                    Open in new tab
                  </a>
                </div>
                <div className="w-full rounded-lg overflow-hidden border border-border">
                  <iframe
                    src="/g3_results/fusion_absolute_ordinal_error.html"
                    title="Fusion Absolute Ordinal Error 3D"
                    className="w-full h-64 md:h-80 border-0"
                  />
                </div>
              </div>

              <div className="glass-card p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold">Multi-Level KG (3D)</h4>
                  <a
                    href="/g3_results/DR_MULTI_LEVEL_KG_3D111.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary underline"
                  >
                    Open in new tab
                  </a>
                </div>
                <div className="w-full rounded-lg overflow-hidden border border-border">
                  <iframe
                    src="/g3_results/DR_MULTI_LEVEL_KG_3D111.html"
                    title="DR Multi Level KG 3D"
                    className="w-full h-64 md:h-80 border-0"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground"></p>
            </div>
          </section>

          {/* Confusion matrix image */}
          <section className="mt-12">
            <h3 className="text-2xl font-semibold text-foreground text-center mb-6">Fusion-Induced Error Reduction Across DR Grades</h3>
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-block rounded-lg overflow-hidden border border-border shadow-lg">
                <img src="/images/confusion.jpg" alt="Confusion Matrix" className="w-full h-auto object-contain" />
              </div>
              <p className="text-sm text-muted-foreground mt-3"></p>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
};

export default Results;
