import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import { useRef, useState, useMemo } from 'react';
import * as THREE from 'three';

interface EyePartInfo {
  name: string;
  description: string;
}

const AnatomicalEye = ({ onHover }: { onHover: (part: EyePartInfo | null) => void }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.15;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.05;
    }
  });

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
    setHoveredPart(partName);
    onHover(partName ? eyeParts[partName] : null);
  };

  const getColor = (partName: string, baseColor: string, hoverColor: string = '#4fd1c5') => {
    return hoveredPart === partName ? hoverColor : baseColor;
  };

  // Create blood vessel geometry
  const createVesselCurve = (points: THREE.Vector3[]) => {
    return new THREE.CatmullRomCurve3(points);
  };

  const vesselPaths = useMemo(() => [
    createVesselCurve([
      new THREE.Vector3(0, 0, -1.4),
      new THREE.Vector3(0.3, 0.2, -1.3),
      new THREE.Vector3(0.6, 0.5, -1.1),
      new THREE.Vector3(0.9, 0.7, -0.8),
    ]),
    createVesselCurve([
      new THREE.Vector3(0, 0, -1.4),
      new THREE.Vector3(-0.25, 0.3, -1.3),
      new THREE.Vector3(-0.5, 0.6, -1.1),
      new THREE.Vector3(-0.8, 0.8, -0.8),
    ]),
    createVesselCurve([
      new THREE.Vector3(0, 0, -1.4),
      new THREE.Vector3(0.2, -0.3, -1.3),
      new THREE.Vector3(0.5, -0.5, -1.1),
      new THREE.Vector3(0.7, -0.7, -0.9),
    ]),
    createVesselCurve([
      new THREE.Vector3(0, 0, -1.4),
      new THREE.Vector3(-0.3, -0.2, -1.3),
      new THREE.Vector3(-0.6, -0.4, -1.1),
      new THREE.Vector3(-0.85, -0.6, -0.85),
    ]),
  ], []);

  return (
    <group ref={groupRef}>
      {/* Sclera - White outer layer (cutaway view) */}
      <mesh
        onPointerOver={() => handleHover('sclera')}
        onPointerOut={() => handleHover(null)}
      >
        <sphereGeometry args={[1.5, 64, 64, 0, Math.PI * 1.7, 0, Math.PI]} />
        <meshStandardMaterial 
          color={getColor('sclera', '#f5f0e8')}
          roughness={0.4}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Choroid layer */}
      <mesh
        position={[0, 0, 0]}
        onPointerOver={() => handleHover('choroid')}
        onPointerOut={() => handleHover(null)}
      >
        <sphereGeometry args={[1.42, 64, 64, 0, Math.PI * 1.7, 0, Math.PI]} />
        <meshStandardMaterial 
          color={getColor('choroid', '#8B3A3A')}
          roughness={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Retina - Inner light-sensitive layer */}
      <mesh
        onPointerOver={() => handleHover('retina')}
        onPointerOut={() => handleHover(null)}
      >
        <sphereGeometry args={[1.35, 64, 64, 0, Math.PI * 1.6, 0.1, Math.PI - 0.2]} />
        <meshStandardMaterial 
          color={getColor('retina', '#FFDAB9')}
          roughness={0.5}
          side={THREE.DoubleSide}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* Vitreous Humor - Gel interior */}
      <mesh
        onPointerOver={() => handleHover('vitreous')}
        onPointerOut={() => handleHover(null)}
      >
        <sphereGeometry args={[1.3, 32, 32]} />
        <meshStandardMaterial 
          color={getColor('vitreous', '#87CEEB')}
          transparent
          opacity={0.15}
          roughness={0.1}
        />
      </mesh>

      {/* Cornea - Clear front dome */}
      <mesh
        position={[0, 0, 0.3]}
        onPointerOver={() => handleHover('cornea')}
        onPointerOut={() => handleHover(null)}
      >
        <sphereGeometry args={[0.85, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.35]} />
        <meshPhysicalMaterial 
          color={getColor('cornea', '#E8F4F8')}
          transparent
          opacity={0.4}
          roughness={0.05}
          metalness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* Iris - Colored part */}
      <mesh
        position={[0, 0, 0.65]}
        rotation={[0, 0, 0]}
        onPointerOver={() => handleHover('iris')}
        onPointerOut={() => handleHover(null)}
      >
        <ringGeometry args={[0.22, 0.55, 64]} />
        <meshStandardMaterial 
          color={getColor('iris', '#2E5A7C')}
          roughness={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Iris detail rings */}
      <mesh position={[0, 0, 0.66]}>
        <ringGeometry args={[0.25, 0.35, 64]} />
        <meshStandardMaterial 
          color="#1E3D5A"
          roughness={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Pupil */}
      <mesh
        position={[0, 0, 0.67]}
        onPointerOver={() => handleHover('pupil')}
        onPointerOut={() => handleHover(null)}
      >
        <circleGeometry args={[0.22, 64]} />
        <meshStandardMaterial 
          color={getColor('pupil', '#0a0a0a')}
          roughness={0.1}
        />
      </mesh>

      {/* Lens */}
      <mesh
        position={[0, 0, 0.2]}
        scale={[1, 1, 0.5]}
        onPointerOver={() => handleHover('lens')}
        onPointerOut={() => handleHover(null)}
      >
        <sphereGeometry args={[0.45, 32, 32]} />
        <meshPhysicalMaterial 
          color={getColor('lens', '#FFF8DC')}
          transparent
          opacity={0.5}
          roughness={0.05}
          metalness={0}
          clearcoat={0.5}
        />
      </mesh>

      {/* Zonular fibers (lens suspension) */}
      {[...Array(12)].map((_, i) => (
        <mesh 
          key={i} 
          position={[
            Math.cos((i / 12) * Math.PI * 2) * 0.5,
            Math.sin((i / 12) * Math.PI * 2) * 0.5,
            0.1
          ]}
          rotation={[0, 0, (i / 12) * Math.PI * 2]}
        >
          <cylinderGeometry args={[0.008, 0.008, 0.3, 8]} />
          <meshStandardMaterial color="#DCDCDC" />
        </mesh>
      ))}

      {/* Ciliary body */}
      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[0.65, 0.08, 16, 32]} />
        <meshStandardMaterial color="#CD5C5C" roughness={0.6} />
      </mesh>

      {/* Macula */}
      <mesh
        position={[0, 0, -1.32]}
        onPointerOver={() => handleHover('macula')}
        onPointerOut={() => handleHover(null)}
      >
        <circleGeometry args={[0.15, 32]} />
        <meshStandardMaterial 
          color={getColor('macula', '#DAA520')}
          roughness={0.5}
        />
      </mesh>

      {/* Optic Nerve/Disc */}
      <group
        onPointerOver={() => handleHover('opticNerve')}
        onPointerOut={() => handleHover(null)}
      >
        <mesh position={[0.35, 0, -1.35]}>
          <circleGeometry args={[0.12, 32]} />
          <meshStandardMaterial 
            color={getColor('opticNerve', '#FFE4B5')}
            roughness={0.4}
          />
        </mesh>
        {/* Optic nerve extending back */}
        <mesh position={[0.35, 0, -1.7]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.18, 0.6, 16]} />
          <meshStandardMaterial 
            color={getColor('opticNerve', '#FFE4B5')}
            roughness={0.5}
          />
        </mesh>
      </group>

      {/* Blood vessels on retina */}
      <group
        onPointerOver={() => handleHover('bloodVessels')}
        onPointerOut={() => handleHover(null)}
      >
        {vesselPaths.map((curve, index) => (
          <mesh key={index}>
            <tubeGeometry args={[curve, 20, 0.015, 8, false]} />
            <meshStandardMaterial 
              color={getColor('bloodVessels', index % 2 === 0 ? '#8B0000' : '#B22222')}
              roughness={0.5}
            />
          </mesh>
        ))}
      </group>

      {/* Extraocular muscles */}
      <group
        onPointerOver={() => handleHover('muscles')}
        onPointerOut={() => handleHover(null)}
      >
        {/* Superior rectus */}
        <mesh position={[0, 1.2, -0.8]} rotation={[0.3, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.08, 0.8, 12]} />
          <meshStandardMaterial color={getColor('muscles', '#CD5C5C')} roughness={0.6} />
        </mesh>
        {/* Inferior rectus */}
        <mesh position={[0, -1.2, -0.8]} rotation={[-0.3, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.08, 0.8, 12]} />
          <meshStandardMaterial color={getColor('muscles', '#CD5C5C')} roughness={0.6} />
        </mesh>
        {/* Lateral rectus */}
        <mesh position={[1.3, 0, -0.6]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.1, 0.06, 0.7, 12]} />
          <meshStandardMaterial color={getColor('muscles', '#CD5C5C')} roughness={0.6} />
        </mesh>
        {/* Medial rectus */}
        <mesh position={[-1.3, 0, -0.6]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.1, 0.06, 0.7, 12]} />
          <meshStandardMaterial color={getColor('muscles', '#CD5C5C')} roughness={0.6} />
        </mesh>
      </group>

      {/* Outer glow effect */}
      <mesh>
        <sphereGeometry args={[1.8, 32, 32]} />
        <meshBasicMaterial color="#4fd1c5" transparent opacity={0.03} />
      </mesh>
    </group>
  );
};

const Eye3D = () => {
  const [hoveredPart, setHoveredPart] = useState<EyePartInfo | null>(null);

  return (
    <div className="relative w-full h-[600px] rounded-2xl overflow-hidden glass-card">
      <Canvas camera={{ position: [3, 1, 2], fov: 45 }}>
        <color attach="background" args={['#0a0f14']} />
        <fog attach="fog" args={['#0a0f14', 5, 15]} />
        
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <directionalLight position={[-5, 3, -5]} intensity={0.4} color="#4fd1c5" />
        <pointLight position={[0, 0, 3]} intensity={0.5} color="#ffffff" />
        <spotLight position={[0, 5, 0]} angle={0.5} penumbra={1} intensity={0.3} color="#4fd1c5" />
        
        <AnatomicalEye onHover={setHoveredPart} />
        
        <OrbitControls 
          enableZoom={true}
          enablePan={false}
          minDistance={3}
          maxDistance={10}
          autoRotate
          autoRotateSpeed={0.3}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI * 3 / 4}
        />
      </Canvas>
      
      {/* Info Panel */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className={`glass-card p-4 transition-all duration-300 ${hoveredPart ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          {hoveredPart && (
            <>
              <h4 className="text-primary font-display font-semibold text-lg">{hoveredPart.name}</h4>
              <p className="text-muted-foreground text-sm mt-1">{hoveredPart.description}</p>
            </>
          )}
        </div>
      </div>
      
      {/* Instructions */}
      <div className="absolute top-4 right-4 glass-card px-4 py-2">
        <p className="text-xs text-muted-foreground">🖱️ Drag to rotate • Scroll to zoom • Hover parts for details</p>
      </div>

      {/* Legend */}
      <div className="absolute top-4 left-4 glass-card px-4 py-3">
        <p className="text-xs font-semibold text-primary mb-2">Anatomical Cross-Section</p>
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