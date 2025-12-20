import { useState } from 'react';

interface EyePartInfo {
  name: string;
  description: string;
}

const Eye3D = () => {
  const [hoveredPart, setHoveredPart] = useState<EyePartInfo | null>(null);

  const eyeParts: Record<string, EyePartInfo> = {
    sclera: { name: 'Sclera', description: 'The white, tough outer layer of the eye. It protects the internal structures and provides attachment for eye muscles.' },
    cornea: { name: 'Cornea', description: 'The clear, dome-shaped front surface that covers the iris and pupil. It provides most of the eye\'s optical power.' },
    iris: { name: 'Iris', description: 'The colored ring-shaped membrane that controls the size of the pupil and regulates the amount of light entering the eye.' },
    pupil: { name: 'Pupil', description: 'The black circular opening in the center of the iris. It dilates and contracts to control light entry.' },
    lens: { name: 'Lens', description: 'A transparent, biconvex structure that focuses light rays onto the retina. It can change shape for near and far vision.' },
    vitreous: { name: 'Vitreous Humor', description: 'The clear, gel-like substance that fills the space between the lens and the retina, maintaining eye shape.' },
    retina: { name: 'Retina', description: 'The light-sensitive inner layer containing photoreceptors. Diabetic retinopathy causes damage to blood vessels here.' },
    opticNerve: { name: 'Optic Nerve', description: 'Transmits visual information from the retina to the brain. The optic disc is where it connects to the retina.' },
    choroid: { name: 'Choroid', description: 'The vascular layer between the retina and sclera. It provides oxygen and nutrients to the outer retina.' },
    macula: { name: 'Macula', description: 'The central area of the retina responsible for sharp central vision. Key area affected by diabetic macular edema.' },
    muscles: { name: 'Extraocular Muscles', description: 'Six muscles that control eye movement, allowing the eyes to move in all directions.' },
    bloodVessels: { name: 'Retinal Blood Vessels', description: 'Arteries and veins supplying the retina. Damage to these vessels causes diabetic retinopathy.' },
  };

  const handleHover = (partName: string | null) => {
    if (partName && eyeParts[partName]) {
      setHoveredPart(eyeParts[partName]);
    } else {
      setHoveredPart(null);
    }
  };

  return (
    <div className="relative w-full h-[600px] rounded-2xl overflow-hidden glass-card">
      {/* Sketchfab Embedded Model */}
      <div className="w-full h-full">
        <iframe
          title="Eye Anatomy"
          frameBorder="0"
          allowFullScreen
          mozAllowFullScreen={true}
          webkitAllowFullScreen={true}
          allow="autoplay; fullscreen; xr-spatial-tracking"
          src="https://sketchfab.com/models/5dac474887174eb78cb7ffce6bd9ce3a/embed"
          className="w-full h-full rounded-2xl"
          style={{ border: 'none' }}
        />
      </div>
      
      {/* Info Panel */}
      <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
        <div className={`glass-card p-4 transition-all duration-300 ${hoveredPart ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {hoveredPart && (
            <>
              <h4 className="text-primary font-display font-semibold text-lg">{hoveredPart.name}</h4>
              <p className="text-muted-foreground text-sm mt-1">{hoveredPart.description}</p>
            </>
          )}
        </div>
      </div>
      
      {/* Instructions */}
      <div className="absolute top-4 right-4 glass-card px-4 py-2 pointer-events-none">
        <p className="text-xs text-muted-foreground">🖱️ Drag to rotate • Scroll to zoom</p>
      </div>

      {/* Legend */}
      <div className="absolute top-4 left-4 glass-card px-4 py-3 pointer-events-none">
        <p className="text-xs font-semibold text-primary mb-2">Eye Anatomy Model</p>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#FFDAB9]"></span> Retina
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#8B0000]"></span> Blood Vessels
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#DAA520]"></span> Macula
          </span>
        </div>
      </div>
    </div>
  );
};

export default Eye3D;
