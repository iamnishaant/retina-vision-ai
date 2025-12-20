import React from "react";
import { Link } from "react-router-dom";

const datasets = [
  {
    name: "EyePACS",
    source: "Kaggle",
    samples: "≈88,700",
    classes: 5,
    description: "Pretraining. 5-class DR labels."
  },
  {
    name: "DDR",
    source: "Benchmark",
    samples: "≈13,673",
    classes: 5,
    description: "Lesion analysis and main evaluation."
  },
  {
    name: "APTOS 2019",
    source: "Kaggle",
    samples: "3,662",
    classes: 5,
    description: "Blindness detection, DR severity."
  },
  {
    name: "Messidor",
    source: "Public",
    samples: "1,200",
    classes: 4,
    description: "Classic DR dataset, benchmarking."
  }
];

const performance = [
  { model: "EfficientNet-B3", accuracy: "83.20%", qwk: "83.80%" },
  { model: "ConvNeXt-Small", accuracy: "88.01%", qwk: "90.24%" },
  { model: "Swin-Tiny", accuracy: "85.44%", qwk: "87.60%" },
  { model: "Multimodal (proposed)", accuracy: "90.42%", qwk: "94.17%" },
];

const comparison = [
  { dimension: "Interpretability", traditional: "Grad-CAM only", project: "Patch radiomics + lesion graphs" },
  { dimension: "Ordinal handling", traditional: "CE loss", project: "CORAL / ordinal heads" },
  { dimension: "Deployment", traditional: "CPU-only", project: "GPU + quantized on-device" },
  { dimension: "Privacy", traditional: "Centralized", project: "Federated & encrypted aggregation" },
];

const pipelineWeaknesses = [
  {
    weakness: 'Missed tiny lesions (MA, exudates)',
    cause: 'ConvNeXt / Swin lack fine-grain focus',
    impact: 'Confusion in Grade-1 & Grade-2',
    solution: 'EfficientNet-B3',
    added: 'High-resolution local lesion detection'
  },
  {
    weakness: 'Poor global retinal context',
    cause: 'EfficientNet sees patches, not full structure',
    impact: 'Under-grading Moderate/Severe DR',
    solution: 'ConvNeXt-Small',
    added: 'Large receptive fields + contextual reasoning'
  },
  {
    weakness: 'Weak spatial relation modelling',
    cause: 'EfficientNet & ConvNeXt are local filters',
    impact: 'Moderate ⇔ Severe confusion',
    solution: 'Swin Transformer',
    added: 'Attention captures inter-lesion & vessel relations'
  },
  {
    weakness: "CNNs detect texture but don't quantify it",
    cause: 'All CNN backbones',
    impact: 'Unstable mid-grade separation',
    solution: 'Radiomics',
    added: 'Numeric texture & intensity descriptors → measurable severity'
  },
  {
    weakness: 'No explicit vascular health tracking',
    cause: 'All CNNs',
    impact: 'Miss key DR biomarkers',
    solution: 'Vessel Metrics',
    added: 'Vessel density, branching, dropout → clinical vascular indicators'
  },
  {
    weakness: 'Single-model bias',
    cause: 'Any backbone alone',
    impact: 'Overfitting to one visual bias',
    solution: 'Three-Backbone Fusion',
    added: 'Complementary views cancel blind spots'
  },
  {
    weakness: 'Ensembles combine outputs, not understanding',
    cause: 'Softmax/Logit averaging',
    impact: 'No severity order → lower QWK',
    solution: 'Embedding Fusion (MLP)',
    added: 'Learns how much to trust each backbone feature'
  },
  {
    weakness: 'Classes treated as independent labels',
    cause: 'Standard CE loss',
    impact: 'Random jumps in prediction',
    solution: 'Ordinal-Aware Fusion',
    added: 'Severity-aware decision boundaries'
  },
  {
    weakness: 'Mild DR looks like Normal retina',
    cause: 'Early DR subtle changes',
    impact: 'Worst recall for Class-1',
    solution: 'Radiomics + Swin + Fusion Head',
    added: 'Texture + vessel cues + spatial context resolve ambiguity'
  }
];

import AnimatedBackground from '@/components/AnimatedBackground';
import Navbar from '@/components/Navbar';

export default function ProjectDatasets() {
  return (
    <div className="min-h-screen animated-bg relative overflow-hidden">
      <AnimatedBackground />
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 pt-32">
        <h1 className="text-3xl font-bold mb-2 text-primary">Datasets & Performance</h1>
        <p className="mb-6 text-muted-foreground">Datasets used for training, validation, cross-evaluation, and performance summary.</p>
        <div className="card bg-card/80 p-6 rounded-xl shadow mb-6">
          <h2 className="text-xl font-semibold mb-2">Datasets</h2>
          <table className="w-full border rounded-lg mb-6">
            <thead className="bg-muted">
              <tr>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Source</th>
                <th className="p-2 text-left">Samples</th>
                <th className="p-2 text-left">Classes</th>
                <th className="p-2 text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              {datasets.map((ds) => (
                <tr key={ds.name} className="border-t">
                  <td className="p-2 font-medium">{ds.name}</td>
                  <td className="p-2">{ds.source}</td>
                  <td className="p-2">{ds.samples}</td>
                  <td className="p-2">{ds.classes}</td>
                  <td className="p-2 text-sm">{ds.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card bg-card/80 p-6 rounded-xl shadow mb-6">
          <h2 className="text-xl font-semibold mb-2">Performance Summary</h2>
          <table className="w-full border rounded-lg mb-6">
            <thead className="bg-muted">
              <tr>
                <th className="p-2 text-left">Model</th>
                <th className="p-2 text-left">Accuracy</th>
                <th className="p-2 text-left">QWK</th>
              </tr>
            </thead>
            <tbody>
              {performance.map((row) => (
                <tr key={row.model} className="border-t">
                  <td className="p-2 font-medium">{row.model}</td>
                  <td className="p-2">{row.accuracy}</td>
                  <td className="p-2">{row.qwk}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Ablation QWK visualization embedded */}
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
        <div className="card bg-card/80 p-6 rounded-xl shadow mb-6">
          <h2 className="text-xl font-semibold mb-2">Trend-aware Comparison (2025+)</h2>
          <table className="w-full border rounded-lg mb-6">
            <thead className="bg-muted">
              <tr>
                <th className="p-2 text-left">Dimension</th>
                <th className="p-2 text-left">Traditional</th>
                <th className="p-2 text-left">This Project</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row) => (
                <tr key={row.dimension} className="border-t">
                  <td className="p-2 font-medium">{row.dimension}</td>
                  <td className="p-2">{row.traditional}</td>
                  <td className="p-2">{row.project}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card bg-card/80 p-6 rounded-xl shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Pipeline Weaknesses & Remedies</h2>
          <div className="overflow-x-auto">
            <table className="w-full border rounded-lg text-sm">
              <thead className="bg-black-200">
                <tr>
                  <th className="p-2 text-left">Pipeline Weakness</th>
                  <th className="p-2 text-left">Cause</th>
                  <th className="p-2 text-left">Impact</th>
                  <th className="p-2 text-left">Solution</th>
                  <th className="p-2 text-left">What Our Component Added</th>
                </tr>
              </thead>
              <tbody>
                {pipelineWeaknesses.map((r, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="p-2 align-top font-medium">{r.weakness}</td>
                    <td className="p-2 align-top">{r.cause}</td>
                    <td className="p-2 align-top">{r.impact}</td>
                    <td className="p-2 align-top">{r.solution}</td>
                    <td className="p-2 align-top">{r.added}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex justify-between mt-10">
          <Link to="/project-overview" className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg hover:scale-105 transition">Previous</Link>
          <a href="#" className="px-6 py-3 rounded-xl bg-accent text-accent-foreground font-bold shadow-lg hover:scale-105 transition">Download PDF</a>
        </div>
      </div>
    </div>
  );
}
