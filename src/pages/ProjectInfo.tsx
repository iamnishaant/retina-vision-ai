import React from "react";

const datasets = [
  {
    name: "APTOS 2019 Blindness Detection",
    source: "Kaggle",
    samples: 3662,
    classes: 5,
    description: "Retinal images labeled for diabetic retinopathy severity."
  },
  {
    name: "EyePACS",
    source: "Kaggle",
    samples: 88702,
    classes: 5,
    description: "Large-scale dataset for DR detection, used in many competitions."
  },
  {
    name: "Messidor",
    source: "Public",
    samples: 1200,
    classes: 4,
    description: "Classic DR dataset, widely used for benchmarking."
  }
];

const trends = [
  {
    year: 2021,
    model: "EfficientNet",
    accuracy: "92.1%",
    notes: "Transfer learning, data augmentation, ensemble."
  },
  {
    year: 2022,
    model: "Vision Transformer",
    accuracy: "93.5%",
    notes: "Attention-based, robust to image noise."
  },
  {
    year: 2023,
    model: "ConvNeXt",
    accuracy: "94.2%",
    notes: "Modern CNN, outperforms ResNet/EfficientNet."
  },
  {
    year: 2024,
    model: "SAM + ViT",
    accuracy: "95.0%",
    notes: "Segment Anything Model with transformer backbone."
  }
];

export default function ProjectInfo() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2 text-primary">Retina Vision AI: Diabetic Retinopathy Detection</h1>
      <p className="mb-6 text-muted-foreground">
        This project leverages state-of-the-art deep learning models to detect diabetic retinopathy (DR) from retinal fundus images. It uses modern datasets and follows the latest trends in medical image analysis.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">Datasets Used</h2>
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

      <h2 className="text-xl font-semibold mt-8 mb-2">Recent Trends in DR Detection</h2>
      <table className="w-full border rounded-lg mb-6">
        <thead className="bg-muted">
          <tr>
            <th className="p-2 text-left">Year</th>
            <th className="p-2 text-left">Model</th>
            <th className="p-2 text-left">Accuracy</th>
            <th className="p-2 text-left">Notes</th>
          </tr>
        </thead>
        <tbody>
          {trends.map((trend) => (
            <tr key={trend.year} className="border-t">
              <td className="p-2 font-medium">{trend.year}</td>
              <td className="p-2">{trend.model}</td>
              <td className="p-2">{trend.accuracy}</td>
              <td className="p-2 text-sm">{trend.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-xl font-semibold mt-8 mb-2">Project Highlights</h2>
      <ul className="list-disc ml-6 text-muted-foreground">
        <li>Uses large, diverse datasets for robust training</li>
        <li>Employs latest deep learning architectures (CNNs, Transformers)</li>
        <li>Focuses on explainability and clinical relevance</li>
        <li>Modern UI for easy image upload and result visualization</li>
      </ul>
    </div>
  );
}
