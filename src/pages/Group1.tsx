// import React from 'react';
// import { Link } from 'react-router-dom';
// import Navbar from '@/components/Navbar';
// import AnimatedBackground from '@/components/AnimatedBackground';

// export default function Group1() {
//   return (
//     <div className="min-h-screen animated-bg relative pt-20">
//       <AnimatedBackground />
//       <Navbar />
//       <div className="max-w-4xl mx-auto p-6 pt-8">
//         <h1 className="text-3xl font-bold mb-4">Group 1 — Backbone Training</h1>
//         <p className="text-muted-foreground mb-4">Uses <code className="font-mono">images_final/</code> (CLAHE + resize) for CNN backbone training (e.g., EfficientNet, ConvNeXt).</p>
//         <p className="text-muted-foreground mb-6">This page can include training config, model recipe, and links to checkpoints or experiments.</p>
//         <Link to="/preprocessing" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">Back to Preprocessing</Link>
//       </div>
//     </div>
//   );
// }

// // // import React from 'react';
// // // import { Link } from 'react-router-dom';
// // // import Navbar from '@/components/Navbar';
// // // import AnimatedBackground from '@/components/AnimatedBackground';

// // // export default function Groups() {
// // //   return (
// // //     <div className="min-h-screen animated-bg relative pt-20">
// // //       <AnimatedBackground />
// // //       <Navbar />

// // //       <div className="max-w-4xl mx-auto p-6 pt-8 space-y-10">
// // //         {/* Group 1 */}
// // //         <section>
// // //           <h1 className="text-3xl font-bold mb-4">
// // //             Group 1 — Backbone Training
// // //           </h1>
// // //           <p className="text-muted-foreground mb-4">
// // //             Uses <code className="font-mono">images_final/</code> (CLAHE + resize)
// // //             for CNN backbone training (e.g., EfficientNet, ConvNeXt).
// // //           </p>
// // //           <p className="text-muted-foreground">
// // //             This section can include training config, model recipes, and links to
// // //             checkpoints or experiments.
// // //           </p>
// // //         </section>

// // //         {/* Group 2 */}
// // //         <section>
// // //           <h1 className="text-3xl font-bold mb-4">
// // //             Group 2 — Radiomics
// // //           </h1>
// // //           <p className="text-muted-foreground mb-4">
// // //             Operates on lesion patches or original images to extract handcrafted
// // //             radiomics descriptors (GLCM, GLRLM, GLSZM).
// // //           </p>
// // //           <p className="text-muted-foreground">
// // //             This section can link to radiomics scripts, feature definitions, and
// // //             extraction parameters.
// // //           </p>
// // //         </section>

// // //         <Link
// // //           to="/preprocessing"
// // //           className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg"
// // //         >
// // //           Back to Preprocessing
// // //         </Link>
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // import * as React from 'react';
// // import { Link } from 'react-router-dom';
// // import Navbar from '@/components/Navbar';
// // import AnimatedBackground from '@/components/AnimatedBackground';

// // export default function Groups() {
// //   return (
// //     <div className="min-h-screen animated-bg relative pt-20">
// //       <AnimatedBackground />
// //       <Navbar />

// //       <div className="max-w-4xl mx-auto p-6 pt-8 space-y-10">

// //         <div className="max-w-4xl mx-auto my-6">
// //           <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-xl bg-black">
// //             <video
// //               controls
// //               className="absolute inset-0 w-full h-full object-contain"
// //             >
// //               <source src="D:\sem5\dl\dr website\retina-vision-ai\public\videos\vid1_2.mp4" type="video/mp4" />
// //             </video>
// //           </div>
// //         </div>

// //         <section>
// //           <h1 className="text-3xl font-bold mb-4">
// //             Group 1 — Backbone Training
// //           </h1>
// //           <p className="text-muted-foreground mb-4">
// //             Uses <code className="font-mono">images_final/</code> (CLAHE + resize)
// //             for CNN backbone training.
// //           </p>
// //         </section>

// //         <section>
// //           <h1 className="text-3xl font-bold mb-4">
// //             Group 2 — Radiomics
// //           </h1>
// //           <p className="text-muted-foreground mb-4">
// //             Operates on lesion patches or original images.
// //           </p>
// //         </section>

// //         <Link
// //           to="/preprocessing"
// //           className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg"
// //         >
// //           Back to Preprocessing
// //         </Link>
// //       </div>
// //     </div>
// //   );
// // }

import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import AnimatedBackground from '@/components/AnimatedBackground';

export default function Group1() {
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
          GROUP 1 — Backbone Pretraining & Visual Representation Learning
        </h1>

        {/* 🔹 Objective */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Objective</h2>
          <p className="text-muted-foreground">
            Group 1 focuses on learning strong retinal visual representations by
            pretraining multiple CNN backbones on large-scale fundus image datasets.
            The objective is to extract robust, transferable feature embeddings that
            capture both global retinal structure and fine-grained pathological
            patterns before downstream multimodal fusion.
          </p>
        </section>

        {/* 🔹 Datasets */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Datasets Used</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>
              <strong>EyePACS:</strong> Used for large-scale backbone pretraining due
              to its diversity in image quality, illumination, and disease severity.
            </li>
            <li>
              <strong>DDR:</strong> Used for fine-tuning and evaluation to ensure
              domain consistency with clinical diabetic retinopathy grading.
            </li>
          </ul>
          <p className="text-muted-foreground mt-2">
            All images undergo deterministic preprocessing and validation-based
            filtering to ensure file integrity and full reproducibility.
          </p>
        </section>

        {/* 🔹 Architectures */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Backbone Architectures</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>
              <strong>EfficientNet-B3:</strong> Parameter-efficient architecture
              optimized for strong global feature learning.  
              <br />Embedding dimension: <code className="font-mono">1536</code>
            </li>
            <li>
              <strong>ConvNeXt-Small:</strong> Modernized CNN with transformer-inspired
              design principles.  
              <br />Embedding dimension: <code className="font-mono">768</code>
            </li>
            <li>
              <strong>Swin Transformer-Tiny:</strong> Hierarchical vision transformer
              capturing long-range spatial dependencies.  
              <br />Embedding dimension: <code className="font-mono">768</code>
            </li>
          </ul>
          <p className="text-muted-foreground mt-2">
            Architectural diversity improves robustness and generalization in later
            fusion stages.
          </p>
        </section>

        {/* 🔹 Training */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Training Strategy</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Backbone-specific input resolutions are used.</li>
            <li>AdamW optimizer with cosine learning rate scheduling and warm-up.</li>
            <li>Mixed-precision (AMP) training enabled when CUDA is available.</li>
            <li>
              Focal Loss with label smoothing to address class imbalance and ordinal
              ambiguity.
            </li>
            <li>Fixed random seeds ensure fully reproducible training.</li>
          </ul>
        </section>

        {/* 🔹 Metrics */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Evaluation Metrics</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Accuracy</li>
            <li>
              <strong>Quadratic Weighted Kappa (QWK):</strong> Primary metric aligned
              with clinical DR grading standards.
            </li>
          </ul>
          <p className="text-muted-foreground mt-2">
            Best checkpoints are selected based on maximum validation QWK.
          </p>
        </section>

        {/* 🔹 Outputs */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Outputs Generated</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Pretrained backbone checkpoints (<code>.pth</code>)</li>
            <li>Image-level feature embeddings (<code>.npz</code>)</li>
            <li>Backbone-specific Grad-CAM heatmaps</li>
            <li>Training logs with loss, accuracy, and QWK per epoch</li>
          </ul>
        </section>

        {/* 🔹 Role */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Role in Overall Pipeline</h2>
          <p className="text-muted-foreground">
            Group 1 establishes the visual foundation of the system by learning
            pathology-aware retinal representations, enabling explainable attention
            via Grad-CAM, and providing reliable embeddings for downstream
            multimodal fusion, lesion-level analysis, and knowledge graph
            construction. All subsequent groups build directly on this stage.
          </p>
        </section>

        {/* 🔹 Detailed Experiments */}
<section className="mb-10">
  <h2 className="text-xl font-semibold mb-4">Detailed Experiments</h2>

  <div className="flex flex-wrap gap-4">
    <a
      href="/g1_results/convnext_umap_vessel_density.html"
      target="_blank"
      rel="noopener noreferrer"
      className="px-5 py-2 bg-primary text-primary-foreground rounded-lg"
    >
      UMAP 3D Vessel Density
    </a>

    <a
      href="/g1_results/convnext_umap_3d.html"
      target="_blank"
      rel="noopener noreferrer"
      className="px-5 py-2 bg-primary text-primary-foreground rounded-lg"
    >
      UMAP 3D Image Embedding
    </a>

    <a
      href="/g1_results/backbone_disagreement_map.html"
      target="_blank"
      rel="noopener noreferrer"
      className="px-5 py-2 bg-primary text-primary-foreground rounded-lg"
    >
      Backbone Disagreement Map
    </a>
  </div>
</section>



        {/* 🔹 Navigation */}
        <Link
          to="/preprocessing"
          className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          Back to Preprocessing
        </Link>

      </div>
    </div>
  );
}
