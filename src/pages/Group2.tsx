import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import AnimatedBackground from '@/components/AnimatedBackground';

export default function Group2() {
  return (
    <div className="min-h-screen animated-bg relative pt-20">
      <AnimatedBackground />
      <Navbar />

      <div className="max-w-4xl mx-auto p-6 pt-8">

        {/* 🔹 Video Section */}
        <div className="max-w-4xl mx-auto mb-10">
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-xl bg-black">
            <video
              controls
              preload="metadata"
              className="absolute inset-0 w-full h-full object-contain bg-black"
            >
              <source src="/videos/vid1_2.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>

        {/* 🔹 Title */}
        <h1 className="text-3xl font-bold mb-6">
          Group 2 — Radiomics & Vessel-Based Feature Extraction (DDR)
        </h1>

        {/* 🔹 Overview */}
        <p className="text-muted-foreground mb-6">
          This group focuses on extracting handcrafted, interpretable radiomic and
          vascular features from DDR fundus images to complement deep CNN-based
          visual embeddings. While CNNs capture high-level semantic patterns,
          radiomics encode low-level intensity statistics, texture descriptors,
          and retinal vessel geometry, enabling clinically meaningful and
          explainable representations.
        </p>

        {/* 🔹 Data Sources */}
        <h2 className="text-xl font-semibold mb-3">Data Sources & Inputs</h2>
        <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-1">
          <li>Fundus images from the DDR dataset</li>
          <li>Vessel probability maps generated using a pre-trained vessel segmentation model</li>
          <li>Manifest file containing image IDs and numeric DR labels</li>
          <li>Final output stored as a consolidated radiomics CSV file</li>
        </ul>

        {/* 🔹 Preprocessing */}
        <h2 className="text-xl font-semibold mb-3">Image Preprocessing</h2>
        <p className="text-muted-foreground mb-6">
          All images are resized to a uniform resolution of 384 × 384 pixels.
          RGB fundus images are converted to grayscale for radiomics extraction.
          A retinal foreground mask is created using intensity thresholding
          followed by morphological closing to suppress background noise while
          preserving anatomical structures.
        </p>

        {/* 🔹 Radiomics */}
        <h2 className="text-xl font-semibold mb-3">Radiomic Feature Extraction</h2>
        <p className="text-muted-foreground mb-6">
          Radiomic features are extracted using PyRadiomics with fixed and
          reproducible settings. Enabled feature families include First-Order
          statistics, GLCM, GLRLM, GLSZM, NGTDM, and GLDM. Only original,
          unfiltered features are retained to avoid redundancy.
        </p>

        {/* 🔹 LBP */}
        <h2 className="text-xl font-semibold mb-3">Local Binary Pattern Features</h2>
        <p className="text-muted-foreground mb-6">
          To capture lesion-level micro-texture variations, Local Binary Patterns
          (LBP) are computed using uniform encoding. A normalized histogram is
          extracted, and the first ten bins are retained as compact texture
          descriptors associated with microaneurysms and hemorrhagic patterns.
        </p>

        {/* 🔹 Vessel Features */}
        <h2 className="text-xl font-semibold mb-3">Vessel Geometry & Morphology</h2>
        <p className="text-muted-foreground mb-6">
          Retinal vessel structure is analyzed using binarized vessel probability
          maps. Skeletonization enables extraction of vessel length, branch
          points, vessel area, and vessel density. These vascular descriptors
          correlate strongly with disease progression through vessel distortion
          and rarefaction.
        </p>

        {/* 🔹 Feature Assembly */}
        <h2 className="text-xl font-semibold mb-3">Feature Assembly</h2>
        <p className="text-muted-foreground mb-6">
          For each fundus image, radiomics features, LBP texture descriptors, and
          vessel morphology metrics are concatenated into a single tabular
          feature vector, along with image-level metadata and ground-truth
          labels.
        </p>

        {/* 🔹 Why Radiomics */}
        <h2 className="text-xl font-semibold mb-3">Why Radiomics Matter</h2>
        <p className="text-muted-foreground mb-8">
          CNN embeddings primarily encode semantic appearance, whereas radiomics
          capture low-level texture, intensity distribution, and vascular
          geometry. Empirical analysis shows near-zero correlation between the
          two, highlighting their strong complementarity. Radiomics add
          interpretability, clinical relevance, and robustness to the overall
          pipeline.
        </p>

        {/* 🔹 Detailed Experiments */}
<section className="mb-10">
  <h2 className="text-xl font-semibold mb-4">Detailed Experiments</h2>

  <div className="flex flex-wrap gap-4">
    <a
      href="/g2_results/radiomics_umap.html"
      target="_blank"
      rel="noopener noreferrer"
      className="px-5 py-2 bg-primary text-primary-foreground rounded-lg"
    >
      Radiomics UMAP Projection
    </a>

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

    <a
      href="/g2_results/radiomics_top_redundancy.html"
      target="_blank"
      rel="noopener noreferrer"
      className="px-5 py-2 bg-primary text-primary-foreground rounded-lg"
    >
      Top Redundant Features
    </a>
  </div>
</section>

        {/* 🔹 Navigation */}
        <div className="flex gap-4">
          <Link
            to="/preprocessing"
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg"
          >
            Back to Preprocessing
          </Link>

          <Link
            to="/group-3"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Go to Group 3
          </Link>
        </div>

      </div>
    </div>
  );
}
