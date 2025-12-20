// import React from 'react';
// import { Link } from 'react-router-dom';
// import Navbar from '@/components/Navbar';
// import AnimatedBackground from '@/components/AnimatedBackground';

// const Preprocessing = () => {
//   return (
//     <div className="min-h-screen animated-bg relative pt-20">
//       <AnimatedBackground />
//       <Navbar />

//       <div className="max-w-5xl mx-auto p-6 pt-8">
//         <h1 className="font-display text-4xl font-bold mb-4">DDR Image Preprocessing Pipeline</h1>
//         <p className="text-muted-foreground mb-6">A deterministic, reproducible preprocessing pipeline for DDR (and EyePACS) fundus images. All steps are applied per-image before any CNN processing, Grad-CAM, or lesion-level analysis.</p>

//         <div className="space-y-8">
//           <section>
//             <h2 className="text-2xl font-semibold mb-2">1. Dataset Input and Directory Structure</h2>
//             <p className="text-muted-foreground mb-2">Input: Raw DDR fundus images with DR severity labels (0–4).</p>
//             <ul className="list-disc ml-6 text-muted-foreground mb-2">
//               <li><span className="font-semibold">images_final</span> — preprocessed RGB fundus images</li>
//               {/* <li><span className="font-semibold">vessel_maps/</span> — binary vessel masks (auxiliary)</li> */}
//               <li><span className="font-semibold">manifest_ddr.csv</span> — structured metadata manifest</li>
//             </ul>
//             <p className="text-muted-foreground">Each image is assigned a unique identifier and processed independently. Resume support is provided to skip already processed files.</p>
//           </section>

//           <section>
//             <h2 className="text-2xl font-semibold mb-2">2. Retina Localization and Background Removal</h2>
//             <p className="text-muted-foreground mb-2">Purpose: remove black borders and non-retinal background to avoid biasing CNN activations.</p>
//             <pre className="bg-card p-4 rounded-lg overflow-auto text-sm"><code>{`gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
// mask = gray > 10
// x, y, w, h = cv2.boundingRect(mask.astype(np.uint8))
// cropped = image[y:y+h, x:x+w]`}</code></pre>
//             <p className="text-muted-foreground mt-2">Threshold: <code className="font-mono">gray &gt; 10</code> — this removes near-black pixels while preserving dim retinal regions.</p>
//           </section>

//           <section>
//             <h2 className="text-2xl font-semibold mb-2">3. Illumination Normalization using CLAHE </h2>
//             <p className="text-muted-foreground mb-2">Purpose: correct uneven illumination and enhance lesion visibility without amplifying noise.</p>
//             <pre className="bg-card p-4 rounded-lg overflow-auto text-sm"><code>{`
// lab = cv2.cvtColor(cropped, cv2.COLOR_RGB2LAB)
// L, A, B = cv2.split(lab)
// clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
// L2 = clahe.apply(L)
// lab2 = cv2.merge([L2, A, B])
// image_clahe = cv2.cvtColor(lab2, cv2.COLOR_LAB2RGB)`}</code></pre>
//             <p className="text-muted-foreground">Parameters: <code className="font-mono">clipLimit=2.0</code>, <code className="font-mono">tileGridSize=(8,8)</code>.</p>
//           </section>

//           <section>
//             <h2 className="text-2xl font-semibold mb-2">4. Spatial Normalization (Resize)</h2>
//             <p className="text-muted-foreground mb-2">Purpose: consistent spatial resolution for CNN input stability.</p>
//             <pre className="bg-card p-4 rounded-lg overflow-auto text-sm"><code>{`image_resized = cv2.resize(image_clahe, (384, 384))`}</code></pre>
//             <p className="text-muted-foreground">Target resolution: <code className="font-mono">384 × 384</code>.</p>
//           </section>

//           <section>
//             <h2 className="text-2xl font-semibold mb-2">5. Vessel Structure Extraction </h2>
//             <p className="text-muted-foreground mb-2">Vessel maps are computed and stored for future lesion topology and graph-based reasoning but are not injected into Groups 1–4 training.</p>
//             <pre className="bg-card p-4 rounded-lg overflow-auto text-sm"><code>{`green = image_resized[:,:,1]
// vesselness = frangi(green / 255.0)
// vessel_mask = vesselness > 0.05
// vessel_density = vessel_mask.sum() / vessel_mask.size`}</code></pre>
//             <p className="text-muted-foreground">Frangi threshold: <code className="font-mono">0.05</code>.</p>
//           </section>

//           <section>
//             <h2 className="text-2xl font-semibold mb-2">6. Label Encoding</h2>
//             <p className="text-muted-foreground">Map textual DDR labels to ordinal integers (0–4) and preserve this mapping across training and downstream modules.</p>
//           </section>

//           <section>
//             <h2 className="text-2xl font-semibold mb-2">7. Resume-Safe Processing</h2>
//             <pre className="bg-card p-4 rounded-lg overflow-auto text-sm"><code>{`processed_files = set(os.listdir(images_final))
// if img_name in processed_files:
//     continue`}</code></pre>
//             <p className="text-muted-foreground">Processed images are skipped to avoid duplicated work and ensure deterministic outputs.</p>
//           </section>

//           <section>
//             <h2 className="text-2xl font-semibold mb-2">8. Updating Manifest</h2>
//             <p className="text-muted-foreground">For each image record: <code className="font-mono">image_id, original_index, raw_label, numeric_label, vessel_density</code>. Checkpoint the manifest periodically (every 100 images).</p>
//           </section>

//           <section>
//             <h2 className="text-2xl font-semibold mb-2">9. Relationship to Downstream Groups</h2>
//             <ul className="list-decimal ml-6 text-muted-foreground">
//               <li><strong>Group 1 (Backbone Training):</strong> uses <code className="font-mono">images_final</code>.</li>
//               <li><strong>Group 2 (Radiomics):</strong> operates on original or lesion patches.</li>
//               <li><strong>Group 3 (Fusion Model):</strong> independent of vessel maps; uses CNN + radiomics.</li>
//               <li><strong>Group 4 (Lesion Patch Pipeline):</strong> Grad-CAM computed on CNNs trained with this preprocessing.</li>
//               <li><strong>Group 5+ (Planned):</strong> vessel masks/density may be added as node features or graph edges.</li>
//             </ul>
//           </section>

//           <section>
//             <h2 className="text-2xl font-semibold mb-2">10. Summary</h2>
//             <p className="text-muted-foreground">The same preprocessing code is used for DDR and EyePACS. All thresholds and transformations are fixed and deterministic. Vessel extraction is auxiliary and future-facing.</p>
//           </section>

//           <section>
//             <h2 className="text-2xl font-semibold mb-2">Groups</h2>
//             <p className="text-muted-foreground mb-4">Jump to any group page:</p>
//             <div className="flex flex-wrap gap-3">
//               <Link to="/group-1" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground">Group 1</Link>
//               <Link to="/group-2" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground">Group 2</Link>
//               <Link to="/group-3" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground">Group 3</Link>
//               <Link to="/group-4" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground">Group 4</Link>
//               <Link to="/group-5" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground">Group 5</Link>
//             </div>
//           </section>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Preprocessing;

import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import AnimatedBackground from '@/components/AnimatedBackground';

const Preprocessing = () => {
  return (
    <div className="min-h-screen animated-bg relative pt-20">
      <AnimatedBackground />
      <Navbar />

      <div className="max-w-5xl mx-auto p-6 pt-8">
        <h1 className="font-display text-4xl font-bold mb-4">
          DDR Image Preprocessing Pipeline
        </h1>

        <p className="text-muted-foreground mb-6">
          A deterministic, reproducible preprocessing pipeline for DDR (and EyePACS)
          fundus images. All steps are applied per-image before any CNN processing,
          Grad-CAM, or lesion-level analysis.
        </p>

        {/* 🔹 Embedded preprocessing video */}
        <div className="max-w-4xl mx-auto my-8">
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-xl bg-black">
            <video
              controls
              className="absolute inset-0 w-full h-full object-contain"
              preload="metadata"
              aria-label="DDR preprocessing pipeline video"
            >
              <source src="/videos/preprocessing.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-2">
              1. Dataset Input and Directory Structure
            </h2>
            <p className="text-muted-foreground mb-2">
              Input: Raw DDR fundus images with DR severity labels (0–4).
            </p>
            <ul className="list-disc ml-6 text-muted-foreground mb-2">
              <li>
                <span className="font-semibold">images_final</span> — preprocessed RGB fundus images
              </li>
              {/* <li><span className="font-semibold">vessel_maps/</span> — binary vessel masks (auxiliary)</li> */}
              <li>
                <span className="font-semibold">manifest_ddr.csv</span> — structured metadata manifest
              </li>
            </ul>
            <p className="text-muted-foreground">
              Each image is assigned a unique identifier and processed independently.
              Resume support is provided to skip already processed files.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">
              2. Retina Localization and Background Removal
            </h2>
            <p className="text-muted-foreground mb-2">
              Purpose: remove black borders and non-retinal background to avoid biasing CNN activations.
            </p>
            <pre className="bg-card p-4 rounded-lg overflow-auto text-sm">
              <code>{`gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
mask = gray > 10
x, y, w, h = cv2.boundingRect(mask.astype(np.uint8))
cropped = image[y:y+h, x:x+w]`}</code>
            </pre>
            <p className="text-muted-foreground mt-2">
              Threshold: <code className="font-mono">gray &gt; 10</code> — this removes near-black pixels while preserving dim retinal regions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">
              3. Illumination Normalization using CLAHE
            </h2>
            <p className="text-muted-foreground mb-2">
              Purpose: correct uneven illumination and enhance lesion visibility without amplifying noise.
            </p>
            <pre className="bg-card p-4 rounded-lg overflow-auto text-sm">
              <code>{`
lab = cv2.cvtColor(cropped, cv2.COLOR_RGB2LAB)
L, A, B = cv2.split(lab)
clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
L2 = clahe.apply(L)
lab2 = cv2.merge([L2, A, B])
image_clahe = cv2.cvtColor(lab2, cv2.COLOR_LAB2RGB)`}</code>
            </pre>
            <p className="text-muted-foreground">
              Parameters: <code className="font-mono">clipLimit=2.0</code>, <code className="font-mono">tileGridSize=(8,8)</code>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">
              4. Spatial Normalization (Resize)
            </h2>
            <p className="text-muted-foreground mb-2">
              Purpose: consistent spatial resolution for CNN input stability.
            </p>
            <pre className="bg-card p-4 rounded-lg overflow-auto text-sm">
              <code>{`image_resized = cv2.resize(image_clahe, (384, 384))`}</code>
            </pre>
            <p className="text-muted-foreground">
              Target resolution: <code className="font-mono">384 × 384</code>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">
              5. Vessel Structure Extraction
            </h2>
            <p className="text-muted-foreground mb-2">
              Vessel maps are computed and stored for future lesion topology and graph-based reasoning but are not injected into Groups 1–4 training.
            </p>
            <pre className="bg-card p-4 rounded-lg overflow-auto text-sm">
              <code>{`green = image_resized[:,:,1]
vesselness = frangi(green / 255.0)
vessel_mask = vesselness > 0.05
vessel_density = vessel_mask.sum() / vessel_mask.size`}</code>
            </pre>
            <p className="text-muted-foreground">
              Frangi threshold: <code className="font-mono">0.05</code>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">
              6. Label Encoding
            </h2>
            <p className="text-muted-foreground">
              Map textual DDR labels to ordinal integers (0–4) and preserve this mapping across training and downstream modules.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">
              7. Resume-Safe Processing
            </h2>
            <pre className="bg-card p-4 rounded-lg overflow-auto text-sm">
              <code>{`processed_files = set(os.listdir(images_final))
if img_name in processed_files:
    continue`}</code>
            </pre>
            <p className="text-muted-foreground">
              Processed images are skipped to avoid duplicated work and ensure deterministic outputs.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">
              8. Updating Manifest
            </h2>
            <p className="text-muted-foreground">
              For each image record: <code className="font-mono">image_id, original_index, raw_label, numeric_label, vessel_density</code>.
              Checkpoint the manifest periodically (every 100 images).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">
              9. Relationship to Downstream Groups
            </h2>
            <ul className="list-decimal ml-6 text-muted-foreground">
              <li><strong>Group 1 (Backbone Training):</strong> uses <code className="font-mono">images_final</code>.</li>
              <li><strong>Group 2 (Radiomics):</strong> operates on original or lesion patches.</li>
              <li><strong>Group 3 (Fusion Model):</strong> independent of vessel maps; uses CNN + radiomics.</li>
              <li><strong>Group 4 (Lesion Patch Pipeline):</strong> Grad-CAM computed on CNNs trained with this preprocessing.</li>
              <li><strong>Group 5+ (Planned):</strong> vessel masks/density may be added as node features or graph edges.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">
              10. Summary
            </h2>
            <p className="text-muted-foreground">
              The same preprocessing code is used for DDR and EyePACS. All thresholds and transformations are fixed and deterministic. Vessel extraction is auxiliary and future-facing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">
              Groups
            </h2>
            <p className="text-muted-foreground mb-4">
              Jump to any group page:
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/group-1" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground">Group 1 </Link>
              <Link to="/group-2" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground">Group 2</Link>
              <Link to="/group-3" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground">Group 3</Link>
              <Link to="/group-4" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground">Group 4</Link>
              <Link to="/group-5" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground">Group 5</Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Preprocessing;
