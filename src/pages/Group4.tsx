import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import AnimatedBackground from '@/components/AnimatedBackground';

export default function Group4() {
  return (
    <div className="min-h-screen animated-bg relative pt-20">
      <AnimatedBackground />
      <Navbar />

      <div className="max-w-5xl mx-auto p-6 pt-8">

        <h1 className="text-3xl font-bold mb-4">
          Group-4 — Lesion-Level Localization, Patch Modeling & Graph Construction
          <span className="block text-lg text-muted-foreground mt-1">
            (From Attention Maps to Graph-Structured Lesions)
          </span>
        </h1>

        {/* ================= Overview ================= */}
        <h2 className="text-xl font-semibold mt-8 mb-2">
          Overview (Role of Group-4)
        </h2>
        <p className="text-muted-foreground mb-4">
          Group-4 converts global diabetic retinopathy predictions into fine-grained
          lesion representations. Using ensemble Grad-CAM++, discriminative retinal
          regions are localized, lesion-level patches are extracted, and each patch
          is encoded using CNN and radiomics features to form graph-ready node
          representations.
        </p>
        <p className="text-muted-foreground mb-6">
          This group introduces spatial structure and lesion interaction modeling,
          which are absent in purely image-level classification pipelines.
        </p>

        {/* ================= Inputs ================= */}
        <h2 className="text-xl font-semibold mt-8 mb-2">
          Inputs to Group-4
        </h2>
        <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-1">
          <li>DDR fundus images (final split)</li>
          <li>Aligned DDR manifest (image paths and labels)</li>
          <li>Fine-tuned classifiers from Group-1</li>
          <li className="ml-6">ResNet-50 (DDR fine-tuned)</li>
          <li className="ml-6">EfficientNet-B3 (DDR fine-tuned)</li>
          <li className="ml-6">ConvNeXt-Small (DDR fine-tuned)</li>
        </ul>

        {/* ================= Grad-CAM ================= */}
        <h2 className="text-xl font-semibold mt-8 mb-2">
          1️⃣ Ensemble Grad-CAM++ (Lesion Localization)
        </h2>
        <p className="text-muted-foreground mb-4">
          Grad-CAM++ heatmaps are generated using an ensemble of three independently
          fine-tuned CNN models. Each model predicts one of five DR severity classes
          (0–4), and heatmaps are computed using the ground-truth label as the target
          class.
        </p>
        <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-1">
          <li>Image resize: 384 × 384</li>
          <li>Normalization: ImageNet mean / std</li>
          <li>CAM method: Grad-CAM++</li>
          <li>Aggregation: Averaged across models and normalized to [0,1]</li>
          <li>Output: Side-by-side original image and heatmap</li>
        </ul>
        <p className="text-muted-foreground mb-6">
          This ensemble strategy reduces model-specific bias and stabilizes lesion
          localization.
        </p>

        {/* ================= Patch Extraction ================= */}
        <h2 className="text-xl font-semibold mt-8 mb-2">
          2️⃣ Adaptive Lesion Patch Extraction
        </h2>
        <p className="text-muted-foreground mb-4">
          Grad-CAM heatmaps are converted into lesion patches using adaptive,
          severity-aware thresholding followed by morphological refinement.
        </p>
        <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-1">
          <li>Threshold: 82nd percentile</li>
          <li>Minimum lesion area: 120 pixels</li>
          <li>Morphology: Binary opening (3×3) and closing (7×7)</li>
          <li>Optional vessel suppression using Canny edge detection</li>
          <li>Top-K lesions per image: 8 (sorted by area)</li>
        </ul>

        {/* ================= Metadata ================= */}
        <h2 className="text-xl font-semibold mt-8 mb-2">
          3️⃣ Lesion Patch Dataset Construction
        </h2>
        <p className="text-muted-foreground mb-4">
          A custom LesionPatchDataset ensures deterministic loading, absolute path
          resolution, and full retention of patch-level metadata.
        </p>
        <p className="text-muted-foreground mb-6">
          Each patch sample includes image and patch identifiers, bounding box
          coordinates, and the corresponding CAM confidence score.
        </p>

        {/* ================= CNN Embeddings ================= */}
        <h2 className="text-xl font-semibold mt-8 mb-2">
          4️⃣ CNN Patch Embedding Extraction
        </h2>
        <p className="text-muted-foreground mb-4">
          Each lesion patch is encoded using a ConvNeXt-Small backbone with global
          average pooling, producing a compact deep representation.
        </p>
        <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-1">
          <li>Input size: 384 × 384</li>
          <li>Embedding dimension: 768</li>
          <li>Batch size: 32</li>
          <li>Shuffle disabled to preserve alignment</li>
        </ul>

        {/* ================= Radiomics ================= */}
        <h2 className="text-xl font-semibold mt-8 mb-2">
          5️⃣ Patch-Level Radiomics Extraction
        </h2>
        <p className="text-muted-foreground mb-4">
          To complement CNN features, handcrafted radiomics descriptors are extracted
          from each lesion patch to capture texture and intensity patterns.
        </p>
        <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-1">
          <li>2D radiomics with force2D enabled</li>
          <li>Feature families: FirstOrder, GLCM, GLRLM, GLSZM</li>
          <li>Central region masking for valid binary labels</li>
          <li>Robust handling of failed patches using NaN alignment</li>
        </ul>

        {/* ================= Graph ================= */}
        <h2 className="text-xl font-semibold mt-8 mb-2">
          6️⃣ Graph-Ready Node Representation & Construction
        </h2>
        <p className="text-muted-foreground mb-4">
          Each lesion patch is converted into a graph node by concatenating deep
          embeddings, radiomics features, spatial coordinates, and CAM confidence.
          Lesions from the same image form a graph using k-NN connectivity over
          normalized centroids.
        </p>
        <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-1">
          <li>Node dimension: ~847</li>
          <li>Edges: k-NN (k ≤ 3)</li>
          <li>Graph label: Image-level DR grade</li>
        </ul>

        {/* ================= Importance ================= */}
        <h2 className="text-xl font-semibold mt-8 mb-2">
          Why Group-4 Is Critical
        </h2>
        <ul className="list-disc list-inside text-muted-foreground mb-8 space-y-1">
          <li>Transforms model attention into structured lesion entities</li>
          <li>Preserves spatial relationships between lesions</li>
          <li>Enables relational disease modeling using graphs</li>
          <li>Bridges interpretability with graph-based learning</li>
        </ul>

        {/* ================= Transition ================= */}
        <h2 className="text-xl font-semibold mt-8 mb-2">
          Group-4 → Group-5 Transition
        </h2>
        <p className="text-muted-foreground mb-8">
          The output of Group-4 consists of per-image lesion graphs with rich node
          attributes. These graphs are passed to Group-5 for GNN-based aggregation
          into image-level graph embeddings, which are finally fused with the
          Group-3 global multimodal representation.
        </p>

        <Link to="/preprocessing" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
          Back to Preprocessing
        </Link>

      </div>
    </div>
  );
}
