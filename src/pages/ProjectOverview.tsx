import React from "react";
import { Link } from "react-router-dom";

import AnimatedBackground from '@/components/AnimatedBackground';
import Navbar from '@/components/Navbar';

export default function ProjectOverview() {
  return (
    <div className="min-h-screen animated-bg relative overflow-hidden pt-20">
      <AnimatedBackground />
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 pt-32">
        <h1 className="text-3xl font-bold mb-2 text-primary">Radiomics-Enhanced Diabetic Retinopathy — Project Overview</h1>
        <p className="mb-6 text-muted-foreground">
          Project summary, methodology, highlights, and modern trends — polished for presentation and web delivery.
        </p>
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="bg-card px-3 py-1 rounded-full text-xs text-muted-foreground">Explainability</span>
          <span className="bg-card px-3 py-1 rounded-full text-xs text-muted-foreground">Radiomics</span>
          <span className="bg-card px-3 py-1 rounded-full text-xs text-muted-foreground">Domain Adaptation</span>
          <span className="bg-card px-3 py-1 rounded-full text-xs text-muted-foreground">QWK-driven</span>
          <span className="bg-card px-3 py-1 rounded-full text-xs text-muted-foreground">Deployment-ready</span>
        </div>
        <div className="card bg-card/80 p-6 rounded-xl shadow mb-6">
          <h2 className="text-xl font-semibold mb-2">Project Summary</h2>
          <p className="text-muted-foreground mb-4">A multi-stream fusion framework combining deep CNN embeddings, lesion-level patches (CAM-guided), and handcrafted radiomics — designed for clinically meaningful 5-class DR grading with strong interpretability and deployment considerations.</p>
          <div className="flex gap-3">
            <Link to="/project-datasets" className="btn btn-primary">Explore Datasets</Link>
            <a href="#" className="btn">Live Demo (dev)</a>
            <a href="#" className="btn">Documentation</a>
          </div>
        </div>
        <div className="card bg-card/80 p-6 rounded-xl shadow mb-6">
          <h2 className="text-xl font-semibold mb-2">Key Highlights</h2>
          <ul className="list-disc ml-6 text-muted-foreground">
            <li>EfficientNet-B3, ConvNeXt-Small, Swin-Tiny backbones ensemble.</li>
            <li>Lesion patch extraction (Grad-CAM) + radiomics descriptors (GLCM, GLRLM, GLSZM).</li>
            <li>Ordinal-aware CORAL head improves QWK and clinical ordering.</li>
            <li>Reproducible stack: PyTorch, timm, PyRadiomics, PyG. Checkpoints and metadata exported.</li>
          </ul>
        </div>
        <div className="card bg-card/80 p-6 rounded-xl shadow mb-6">
          <h2 className="text-xl font-semibold mb-2">Methodology (short)</h2>
          <p className="text-muted-foreground mb-2">Feature extraction → radiomics encoder → cross-attention fusion → dual heads (softmax + CORAL ordinal head) → optional lesion-graph reasoning with GNNs for relational understanding between lesions.</p>
          <h3 className="text-lg font-semibold mt-4 mb-2">Artifacts & Outputs</h3>
          <ul className="list-disc ml-6 text-muted-foreground">
            <li>Grad-CAM / Grad-CAM++ heatmaps</li>
            <li>Lesion patch CSV metadata</li>
            <li>Radiomics vector sets per-patch</li>
            <li>Checkpoints & evaluation logs</li>
          </ul>
        </div>
        <div className="card bg-card/80 p-6 rounded-xl shadow mb-6">
          <h2 className="text-xl font-semibold mb-2">Modern Trends & Recommended Additions (2025)</h2>
          <ul className="list-disc ml-6 text-muted-foreground">
            <li>Model cards & datasheets for governance.</li>
            <li>Uncertainty quantification (MC Dropout / Deep Ensembles).</li>
            <li>Federated learning for privacy-sensitive screening.</li>
            <li>Explainability beyond saliency maps: TCAV & concept-based approaches.</li>
          </ul>
        </div>
        <div className="flex justify-between mt-10">
          <Link to="/" className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg hover:scale-105 transition">Previous</Link>
          <Link to="/project-datasets" className="px-6 py-3 rounded-xl bg-accent text-accent-foreground font-bold shadow-lg hover:scale-105 transition">Next</Link>
        </div>
      </div>
    </div>
  );
}
