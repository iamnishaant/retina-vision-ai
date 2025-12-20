import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import AnimatedBackground from '@/components/AnimatedBackground';

export default function Group3() {
  return (
    <div className="min-h-screen animated-bg relative pt-20">
      <AnimatedBackground />
      <Navbar />

      <div className="max-w-5xl mx-auto p-6 pt-8">

        <h1 className="text-3xl font-bold mb-4">
          Group-3 — Radiomics-Guided Multimodal Fusion
          <span className="block text-lg text-muted-foreground mt-1">
            (Project Highlight)
          </span>
        </h1>

        {/* 🔹 Video Section */}
        <div className="max-w-4xl mx-auto mb-10">
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-xl bg-black">
            <video
              controls
              preload="metadata"
              className="absolute inset-0 w-full h-full object-contain bg-black"
            >
              <source src="/videos/vid3.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>

        {/* ================= Overview ================= */}
        <h2 className="text-xl font-semibold mt-8 mb-2">
          Overview (Why Group-3 Matters)
        </h2>
        <p className="text-muted-foreground mb-4">
          Group-3 is the core contribution of our work. Instead of naïvely
          concatenating deep features, we introduce a radiomics-guided
          cross-attention fusion model that explicitly aligns handcrafted
          clinical features with multiple CNN backbones for ordinal diabetic
          retinopathy grading.
        </p>
        <p className="text-muted-foreground mb-6">
          This design bridges interpretability (radiomics) and representation
          power (CNNs), yielding a strong and stable performance gain.
        </p>

        {/* ================= Inputs ================= */}
        <h2 className="text-xl font-semibold mb-2">
          Inputs to the Fusion Model
        </h2>
        <p className="text-muted-foreground mb-3">
          Each sample consists of four complementary modalities:
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full border rounded-lg">
            <thead className="bg-muted">
              <tr>
                <th className="p-3 text-left">Modality</th>
                <th className="p-3 text-left">Source</th>
                <th className="p-3 text-left">Dimensionality</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="p-3">EfficientNet-B3 embedding</td>
                <td className="p-3">Group-1</td>
                <td className="p-3">1536</td>
              </tr>
              <tr className="border-t">
                <td className="p-3">ConvNeXt-Small embedding</td>
                <td className="p-3">Group-1</td>
                <td className="p-3">768</td>
              </tr>
              <tr className="border-t">
                <td className="p-3">Swin-Tiny embedding</td>
                <td className="p-3">Group-1</td>
                <td className="p-3">768</td>
              </tr>
              <tr className="border-t">
                <td className="p-3">Radiomics features</td>
                <td className="p-3">Group-2</td>
                <td className="p-3">107 (after filtering)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-muted-foreground mb-6">
          All inputs are precomputed and frozen. Group-3 trains only fusion
          layers, ensuring fast convergence and stability.
        </p>

        {/* ================= Radiomics Alignment ================= */}
        <h2 className="text-xl font-semibold mb-2">
          Radiomics Normalization & Alignment
        </h2>
        <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-1">
          <li>Radiomics loaded from: <code>/kaggle/working/radiomics_ddr_full.csv</code></li>
          <li>Excluded columns: <code>image_id</code>, <code>numeric_label</code></li>
          <li>StandardScaler applied only to radiomic features</li>
          <li>Output dtype enforced as <code>float32</code></li>
          <li>Missing radiomics handled via zero-vector imputation</li>
          <li>Missing sample distribution verified per train / val / test split</li>
        </ul>

        {/* ================= Dataset ================= */}
        <h2 className="text-xl font-semibold mb-2">
          Fusion Dataset Construction
        </h2>
        <p className="text-muted-foreground mb-4">
          A custom <strong>FusionDataset</strong> guarantees perfect index
          alignment across modalities, avoiding silent mismatches common in
          multimodal pipelines.
        </p>
        <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-1">
          <li>Manifest order preserved</li>
          <li>Optional original index for safe embedding lookup</li>
          <li>Each batch yields: (EffNet, ConvNeXt, Swin, Radiomics, Label)</li>
        </ul>

        {/* ================= Architecture ================= */}
        <h2 className="text-xl font-semibold mb-2">
          Architecture Overview
        </h2>
        <p className="text-muted-foreground mb-4">
          The fusion model is not concatenation-based. Each modality is processed
          independently and fused via radiomics-guided cross-attention.
        </p>

        <h3 className="font-semibold mt-4 mb-1">
          1️⃣ Radiomics Encoder (Clinical Prior)
        </h3>
        <p className="text-muted-foreground mb-3">
          MLP: 107 → 512 → 256 → 128 | GELU | LayerNorm | Dropout 0.3  
          Output: 128-D radiomics latent representing disease severity cues.
        </p>

        <h3 className="font-semibold mt-4 mb-1">
          2️⃣ Modality Projections (No Early Mixing)
        </h3>
        <p className="text-muted-foreground mb-3">
          EfficientNet-B3: 1536 → 512  
          ConvNeXt-Small: 768 → 512  
          Swin-Tiny: 768 → 512  
          Radiomics latent: 128 → 512 (Query token)
        </p>

        <h3 className="font-semibold mt-4 mb-1">
          3️⃣ Radiomics-Guided Cross-Attention (Key Innovation)
        </h3>
        <p className="text-muted-foreground mb-3">
          Query: radiomics token (1×512)  
          Keys/Values: CNN tokens (3×512)  
          Multi-Head Attention (8 heads, 64-D per head) with residual and LayerNorm.
        </p>

        <h3 className="font-semibold mt-4 mb-1">
          4️⃣ Fusion Feed-Forward Network
        </h3>
        <p className="text-muted-foreground mb-3">
          512 → 256 → 128 | GELU | Dropout 0.3 | LayerNorm  
          Output: 128-D fused disease representation.
        </p>

        <h3 className="font-semibold mt-4 mb-1">
          5️⃣ Dual Prediction Heads (Ordinal + Categorical)
        </h3>
        <p className="text-muted-foreground mb-6">
          Classification head: 128 → 64 → 5  
          CORAL head: 128 → 4 thresholds (ordinal supervision).
        </p>

        {/* ================= Loss ================= */}
        <h2 className="text-xl font-semibold mb-2">
          Loss Function & Training Objective
        </h2>
        <p className="text-muted-foreground mb-4">
          <strong>L = CrossEntropy + α · CORAL Loss</strong>, where α = 0.2.  
          CORAL targets defined as y &gt; k for k ∈ {0,1,2,3}.
        </p>

        {/* ================= Optimization ================= */}
        <h2 className="text-xl font-semibold mb-2">
          Optimization & Training Details
        </h2>
        <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-1">
          <li>Optimizer: AdamW (LR 3e-4, weight decay 1e-4)</li>
          <li>Scheduler: CosineAnnealingLR (Tmax=20, eta_min=1e-6)</li>
          <li>Epochs: 20 | Batch size: 32</li>
          <li>Gradient clipping: max_norm = 2.0</li>
          <li>NaN protection: non-finite losses skipped</li>
        </ul>

        {/* ================= Results ================= */}
        <h2 className="text-xl font-semibold mb-2">
          Final Test Performance (DDR)
        </h2>
        <p className="text-muted-foreground mb-6">
          Best validation model evaluated on the held-out test set achieved
          <strong> QWK ≈ 0.94</strong>, outperforming all individual backbones.
        </p>

        {/* ================= Takeaway ================= */}
        <h2 className="text-xl font-semibold mb-2">
          Why This Fusion Works (Key Takeaway)
        </h2>
        <p className="text-muted-foreground mb-8">
          CNNs capture visual semantics, radiomics encode clinical priors,
          cross-attention enables context-aware modality weighting, and CORAL
          enforces ordinal correctness — making Group-3 the central contribution
          of the project.
        </p>

        <section className="mb-10">
  <h2 className="text-xl font-semibold mb-4">Detailed Experiments</h2>

  <div className="flex flex-wrap gap-4">
    <a
      href="/g3_results/fusion_confidence_calibration.html"
      target="_blank"
      rel="noopener noreferrer"
      className="px-5 py-2 bg-primary text-primary-foreground rounded-lg"
    >
      Fusion Confidence Calibration
    </a>

    <a
      href="/g3_results/fusion_confusion_delta.html"
      target="_blank"
      rel="noopener noreferrer"
      className="px-5 py-2 bg-primary text-primary-foreground rounded-lg"
    >
      Confusion Matrix Delta (Fusion vs Others)
    </a>

    <a
      href="/g3_results/fusion_vs_convnext_error_map_3d.html"
      target="_blank"
      rel="noopener noreferrer"
      className="px-5 py-2 bg-primary text-primary-foreground rounded-lg"
    >
      Fusion vs ConvNeXt — 3D Error Map
    </a>

    <a
      href="/g3_results/fusion_vs_effb3_error_map_3d.html"
      target="_blank"
      rel="noopener noreferrer"
      className="px-5 py-2 bg-primary text-primary-foreground rounded-lg"
    >
      Fusion vs EfficientNet-B3 — 3D Error Map
    </a>

    <a
      href="/g3_results/fusion_vs_swin_error_map_3d.html"
      target="_blank"
      rel="noopener noreferrer"
      className="px-5 py-2 bg-primary text-primary-foreground rounded-lg"
    >
      Fusion vs Swin — 3D Error Map
    </a>
  </div>
</section>

        <Link
          to="/preprocessing"
          className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          Back
        </Link>

      </div>
    </div>
  );
}
