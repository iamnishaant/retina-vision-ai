// import React from 'react';
// import { Link } from 'react-router-dom';
// import Navbar from '@/components/Navbar';
// import AnimatedBackground from '@/components/AnimatedBackground';

// export default function Group5() {
//   return (
//     <div className="min-h-screen animated-bg relative pt-20">
//       <AnimatedBackground />
//       <Navbar />
//       <div className="max-w-4xl mx-auto p-6 pt-8">
//         <h1 className="text-3xl font-bold mb-4">Group 5 — Vessel-aware & Graph Models (Planned)</h1>
//         <p className="text-muted-foreground mb-4">Planned work: incorporate vessel masks & density as node features and construct vessel-aware graph edges for lesion topology modeling.</p>
//         <p className="text-muted-foreground mb-6">We would try to include graph construction details, node/edge feature lists, and GNN training notes.</p>
//         <Link to="/preprocessing" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">Back to Preprocessing</Link>
//       </div>
//     </div>
//   );
// }

import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import AnimatedBackground from '@/components/AnimatedBackground';

export default function OrdinalSpatialKG() {
  return (
    <div className="min-h-screen animated-bg relative pt-20">
      <AnimatedBackground />
      <Navbar />

      <div className="max-w-5xl mx-auto p-6 pt-8">

        {/* ================================================= */}
        <h1 className="text-3xl font-bold mb-6">
          Ordinal & Spatial Severity Learning in Diabetic Retinopathy
        </h1>

        {/* ================================================= */}
        <h2 className="text-2xl font-semibold mb-2">
          1. Ordinal Severity Learning (Global Disease Estimation)
        </h2>

        <h3 className="font-semibold mt-4 mb-1">
          What problem does this solve?
        </h3>
        <p className="text-muted-foreground mb-4">
          Diabetic Retinopathy (DR) is ordinal by nature. The disease progresses
          in a strict clinical order:
        </p>

        <p className="font-medium mb-4">
          No DR → Mild → Moderate → Severe → Proliferative
        </p>

        <p className="text-muted-foreground mb-6">
          Traditional classification treats these categories as independent,
          ignoring the fact that misclassifying <b>No DR as Mild</b> is far less
          severe than misclassifying <b>No DR as Proliferative</b>. Our approach
          explicitly models this severity progression.
        </p>

        <h3 className="font-semibold mb-1">
          How does our model work?
        </h3>
        <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-1">
          <li>A transformer backbone (Swin-Tiny) extracts deep visual features</li>
          <li>The classifier head is removed</li>
          <li>A single regression head outputs a continuous severity score</li>
        </ul>

        <p className="text-muted-foreground mb-6">
          This score reflects how advanced the disease is, rather than forcing a
          hard class decision.
        </p>

        <h3 className="font-semibold mb-1">
          How is ordinal structure enforced?
        </h3>
        <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-1">
          <li>Regression loss ensures numerical closeness to true DR grades</li>
          <li>Pairwise ranking loss enforces correct ordering between samples</li>
        </ul>

        <p className="text-muted-foreground mb-6">
          Images with higher DR grades are always encouraged to receive higher
          severity scores than milder cases.
        </p>

        <h3 className="font-semibold mb-1">
          Why is this better?
        </h3>
        <ul className="list-disc list-inside text-muted-foreground mb-8 space-y-1">
          <li>Preserves clinical ordering of disease</li>
          <li>Reduces catastrophic misclassification</li>
          <li>Optimizes directly for Quadratic Weighted Kappa (QWK)</li>
        </ul>

        

        {/* ================================================= */}
        {/* Image: 1stcode.png should be placed in public/images/1stcode.png */}
        <div className="max-w-4xl mx-auto mb-6">
            <img
              src="/images/1st%20code(1).png"
              alt="Token-based spatial severity schematic"
              className="w-full rounded-2xl shadow-lg object-contain"
            />
        </div>

        <h2 className="text-2xl font-semibold mb-2">
          2. Token-Based Spatial Severity Learning (Local Damage Analysis)
        </h2>

        <h3 className="font-semibold mt-4 mb-1">
          Why spatial severity?
        </h3>
        <p className="text-muted-foreground mb-4">
          Global severity alone does not explain where the damage lies.
          Clinicians need to understand:
        </p>

        <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-1">
          <li>Which regions contribute most to disease severity</li>
          <li>How lesion distribution affects disease progression</li>
        </ul>

        <h3 className="font-semibold mb-1">
          What does this model do?
        </h3>
        <p className="text-muted-foreground mb-6">
          The spatial severity model decomposes the image into local tokens
          (patches) and assigns each token both a severity contribution and an
          attention weight. The final severity score is computed as a weighted
          sum of token contributions.
        </p>

        <h3 className="font-semibold mb-1">
          What does the attention map show?
        </h3>
        <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-1">
          <li>Bright regions indicate strong severity contribution</li>
          <li>Attention is learned without pixel-level annotations</li>
          <li>Provides fine-grained spatial interpretability</li>
        </ul>

        <h3 className="font-semibold mb-8">
          Why is this important?
        </h3>
        <ul className="list-disc list-inside text-muted-foreground mb-10 space-y-1">
          <li>Produces human-interpretable severity heatmaps</li>
          <li>Aligns well with known lesion regions</li>
          <li>Bridges prediction and explanation in one model</li>
        </ul>

        {/* ================================================= */}
        {/* Image: part3.png should be placed in public/images/part3.png */}
        <div className="max-w-4xl mx-auto mb-6">
            <img
              src="/images/part3.png"
              alt="Multi-level knowledge graph overview"
              className="w-full rounded-2xl shadow-lg object-contain"
            />
        </div>

        <h2 className="text-2xl font-semibold mb-2">
          3. Multi-Level Diabetic Retinopathy Knowledge Graph
        </h2>

        <h3 className="font-semibold mt-4 mb-1">
          Motivation
        </h3>
        <p className="text-muted-foreground mb-6">
          Deep learning models produce powerful representations but lack
          structured clinical reasoning. To address this, we introduce a
          multi-level knowledge graph that organizes information from pixels to
          disease states.
        </p>

        <h3 className="font-semibold mb-2">
          3. Knowledge Graph Hierarchy
        </h3>

        <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
          <li>
            <b>Level 1 – Eye:</b> Each node represents a complete fundus image
            and serves as the root entity.
          </li>
          <li>
            <b>Level 2 – Lesions:</b> Salient pathological patches detected via
            CAM scores, storing DR grade and importance.
          </li>
          <li>
            <b>Level 3 – Disease Concepts:</b> High-level clinical findings such
            as macular damage, hemorrhage, exudates, and vessel abnormalities.
          </li>
          <li>
            <b>Level 4 – Global Clinical State:</b> Final disease interpretation
            (Non-DR, Mild DR, Severe DR).
          </li>
        </ul>

        <h3 className="font-semibold mb-2">
          4. Types of Relationships in the Graph
        </h3>
        <ul className="list-disc list-inside text-muted-foreground mb-8 space-y-1">
          <li>Eye → Lesion</li>
          <li>Lesion → Lesion</li>
          <li>Eye → Disease Concept</li>
          <li>Disease → Disease</li>
          <li>Eye → Eye</li>
          <li>Eye → Global State</li>
        </ul>

        <h3 className="font-semibold mb-2">
          5. 3D Interactive Visualization
        </h3>
        <p className="text-muted-foreground mb-4">
          A 3D layout separates hierarchy levels, reduces clutter, and enables
          intuitive cross-level reasoning.
        </p>

        <div className="mb-6">
          <a
            href="/3d_familywise_kg_small.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-5 py-2 bg-primary text-primary-foreground rounded-lg"
            title="Open 3D family-wise knowledge graph"
          >
            Open 3D Knowledge Graph
          </a>
          <p className="text-sm text-muted-foreground mt-2">
            
          </p>
        </div>

        <ul className="list-disc list-inside text-muted-foreground mb-8 space-y-1">
          <li>Blue nodes: Eye images</li>
          <li>Red nodes: Lesions (size ∝ importance)</li>
          <li>Orange nodes: Disease concepts</li>
          <li>Green nodes: Global DR states</li>
        </ul>

        <h3 className="font-semibold mb-2">
          6. Key Advantages of the Knowledge Graph
        </h3>
        <ul className="list-disc list-inside text-muted-foreground mb-8 space-y-1">
          <li>Integrates deep learning with symbolic reasoning</li>
          <li>Enables traceability from diagnosis to lesions</li>
          <li>Supports explainable and auditable medical AI</li>
        </ul>

        <h3 className="font-semibold mb-2">
          7. Final Takeaway
        </h3>
        <p className="text-muted-foreground mb-10">
          By combining ordinal severity learning, spatial token-level reasoning,
          radiomics-guided fusion, and multi-level knowledge graph modeling, the
          proposed system delivers a clinically interpretable, severity-aware,
          and explainable diabetic retinopathy analysis pipeline.
        </p>

        🔹 Detailed Experiments
{/* <section className="mb-10">
  <h2 className="text-xl font-semibold mb-4">Detailed Experiments</h2>

  <div className="flex flex-wrap gap-4">
    <a
      href="/g2_results/radiomics_umap.html"
      target="_blank"
      rel="noopener noreferrer"
      className="px-5 py-2 bg-primary text-primary-foreground rounded-lg"
    >
      Radiomics UMAP Projection
    </a> */}

    {/* <a
      href="/g2_results/radiomics_correlation_network.html"
      target="_blank"
      rel="noopener noreferrer"
      className="px-5 py-2 bg-primary text-primary-foreground rounded-lg"
    >
      Feature Correlation Network
    </a> */}

    {/* <a
      href="/g2_results/radiomics_family_correlation.html"
      target="_blank"
      rel="noopener noreferrer"
      className="px-5 py-2 bg-primary text-primary-foreground rounded-lg"
    >
      Correlation by Feature Family
    </a> */}

    {/* <a
      href="/g2_results/radiomics_top_redundancy.html"
      target="_blank"
      rel="noopener noreferrer"
      className="px-5 py-2 bg-primary text-primary-foreground rounded-lg"
    >
      Top Redundant Features
    </a>
  </div>
</section> */}

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
