import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle, TrendingUp, Eye, Heart, Droplets, Activity, Shield } from 'lucide-react';
import Navbar from '@/components/Navbar';
import AnimatedBackground from '@/components/AnimatedBackground';

const stages = [
  {
    grade: 0,
    name: 'No DR',
    description: 'No abnormalities detected in the retina. The blood vessels appear normal with no signs of damage.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    grade: 1,
    name: 'Mild NPDR',
    description: 'Microaneurysms present - small areas of balloon-like swelling in the retinas tiny blood vessels.',
    color: 'from-yellow-500 to-amber-500',
  },
  {
    grade: 2,
    name: 'Moderate NPDR',
    description: 'More microaneurysms, dot/blot hemorrhages, and hard exudates. Blood vessels may show some blockage.',
    color: 'from-orange-500 to-amber-600',
  },
  {
    grade: 3,
    name: 'Severe NPDR',
    description: 'Many more blocked blood vessels, extensive hemorrhages, venous beading, and IRMA (intraretinal microvascular abnormalities).',
    color: 'from-red-500 to-rose-500',
  },
  {
    grade: 4,
    name: 'Proliferative DR',
    description: 'Advanced stage with neovascularization (new abnormal blood vessel growth), high risk of vitreous hemorrhage and retinal detachment.',
    color: 'from-purple-500 to-red-500',
  },
];

const causes = [
  { icon: Droplets, title: 'High Blood Sugar', description: 'Prolonged high glucose levels damage the small blood vessels in the retina over time.' },
  { icon: Heart, title: 'Diabetes Duration', description: 'The longer you have diabetes, the higher your risk of developing diabetic retinopathy.' },
  { icon: Activity, title: 'Blood Pressure', description: 'High blood pressure can accelerate damage to retinal blood vessels.' },
  { icon: TrendingUp, title: 'Cholesterol Levels', description: 'High cholesterol can contribute to blood vessel blockage and damage.' },
];

const AboutDR = () => {
  return (
    <div className="min-h-screen animated-bg relative pt-20">
      <AnimatedBackground />
      <Navbar />
      <div className="flex justify-between px-6 pt-6">
        <Link to="/" className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg hover:scale-105 transition">Previous</Link>
        <Link to="/eye-anatomy" className="px-6 py-3 rounded-xl bg-accent text-accent-foreground font-bold shadow-lg hover:scale-105 transition">Next</Link>
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
              <span className="text-foreground">Understanding</span>
              <br />
              <span className="gradient-text">Diabetic Retinopathy</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A comprehensive guide to one of the leading causes of vision loss worldwide, 
              affecting millions of people with diabetes.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Intro video */}
      <section className="px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8"
        >
          <VideoBlock />
        </motion.div>
      </section>


      {/* What is DR */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8 md:p-12"
          >
            <div className="flex items-start gap-6">
              <div className="hidden md:block">
                <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <Eye className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div>
                <h2 className="font-display text-3xl font-bold text-foreground mb-4">What is Diabetic Retinopathy?</h2>
                <p className="text-muted-foreground text-lg leading-relaxed mb-4">
                  Diabetic retinopathy is a diabetes complication that affects the eyes. It is caused by damage to the 
                  blood vessels of the light-sensitive tissue at the back of the eye (retina). At first, diabetic 
                  retinopathy might cause no symptoms or only mild vision problems. But it can lead to blindness.
                </p>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  The condition can develop in anyone who has type 1 or type 2 diabetes. The longer you have diabetes 
                  and the less controlled your blood sugar is, the more likely you are to develop this eye complication.
                </p>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  DR is one of the leading causes of preventable vision loss worldwide, especially among working‑age adults. Early detection plays a crucial role in avoiding long‑term complications.
                </p>
                <p className="text-muted-foreground text-lg leading-relaxed mb-4">
                  DR is not fully curable, but it is highly manageable when detected early. Vision loss can often be prevented or slowed down with timely treatment and proper diabetes control.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Causes */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl font-bold text-foreground text-center mb-12"
          >
            Causes & Risk Factors
          </motion.h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {causes.map((cause, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 flex items-start gap-4 card-hover"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <cause.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-lg mb-2">{cause.title}</h3>
                  <p className="text-muted-foreground">{cause.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stages/Classification */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              DR Classification Scale
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Diabetic retinopathy is classified into 5 stages based on severity. Our AI model 
              uses this internationally recognized grading system.
            </p>
          </motion.div>

          <div className="space-y-4">
            {stages.map((stage, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 flex flex-col md:flex-row items-start md:items-center gap-4"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stage.color} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-2xl font-bold text-white">{stage.grade}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-xl text-foreground mb-1">{stage.name}</h3>
                  <p className="text-muted-foreground">{stage.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Prevention */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8 md:p-12 glow-border"
          >
            <div className="flex items-center gap-3 mb-6">
              <Shield className="h-8 w-8 text-primary" />
              <h2 className="font-display text-3xl font-bold text-foreground">Prevention & Management</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {[
                'Control your blood sugar levels through diet and medication',
                'Monitor and manage blood pressure and cholesterol',
                'Get regular comprehensive dilated eye exams',
                'Quit smoking to reduce risk of progression',
                'Exercise regularly to improve overall health',
                'Take diabetes medications as prescribed',
                'Report any vision changes to your doctor immediately',
                'Maintain a healthy weight through balanced nutrition',
              ].map((tip, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">{tip}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Warning */}
      <section className="py-16 px-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8 border-l-4 border-destructive/50"
          >
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-8 w-8 text-destructive flex-shrink-0" />
              <div>
                <h3 className="font-display font-semibold text-xl text-foreground mb-2">Important Warning</h3>
                <p className="text-muted-foreground">
                  Diabetic retinopathy often has no early warning signs. Dont wait for symptoms to appear. 
                  If you have diabetes, schedule comprehensive dilated eye exams at least once a year, even 
                  if your vision seems fine. Early detection and treatment can prevent up to 95% of vision 
                  loss from diabetic retinopathy.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutDR;

function VideoBlock() {
  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="rounded-2xl overflow-hidden shadow-2xl bg-black">
        <video
          controls
          className="w-full h-auto"
          preload="metadata"
        >
          <source src="/videos/intro.mp4" type="video/mp4" />
        </video>
      </div>
    </div>
  );
}



