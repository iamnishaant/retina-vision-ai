import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Html } from '@react-three/drei';
import { useRef, useState } from 'react';
import * as THREE from 'three';

interface EyePartProps {
  position: [number, number, number];
  color: string;
  size: number;
  name: string;
  description: string;
  onHover: (part: { name: string; description: string } | null) => void;
}

const EyePart = ({ position, color, size, name, description, onHover }: EyePartProps) => {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <Sphere
      ref={meshRef}
      position={position}
      args={[size, 32, 32]}
      onPointerOver={() => {
        setHovered(true);
        onHover({ name, description });
      }}
      onPointerOut={() => {
        setHovered(false);
        onHover(null);
      }}
    >
      <meshStandardMaterial
        color={hovered ? '#4fd1c5' : color}
        emissive={hovered ? '#4fd1c5' : '#000000'}
        emissiveIntensity={hovered ? 0.5 : 0}
        transparent
        opacity={0.9}
      />
    </Sphere>
  );
};

const EyeModel = ({ onHover }: { onHover: (part: { name: string; description: string } | null) => void }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    }
  });

  const eyeParts = [
    { position: [0, 0, 0] as [number, number, number], color: '#ffffff', size: 1.5, name: 'Sclera', description: 'The white outer layer of the eyeball that protects the internal structures.' },
    { position: [0, 0, 0.8] as [number, number, number], color: '#8B4513', size: 0.7, name: 'Iris', description: 'The colored part of the eye that controls the size of the pupil and amount of light entering.' },
    { position: [0, 0, 1.1] as [number, number, number], color: '#000000', size: 0.35, name: 'Pupil', description: 'The black circular opening in the center of the iris that allows light to enter the retina.' },
    { position: [0, 0, 1.3] as [number, number, number], color: '#87CEEB', size: 0.8, name: 'Cornea', description: 'The transparent front layer that covers the iris and pupil, helping to focus light.' },
    { position: [0, 0, -1.2] as [number, number, number], color: '#FF6B6B', size: 0.4, name: 'Optic Nerve', description: 'Transmits visual information from the retina to the brain.' },
    { position: [0.8, 0.8, -0.5] as [number, number, number], color: '#FFD700', size: 0.15, name: 'Macula', description: 'The central area of the retina responsible for sharp, detailed central vision. Key area affected in diabetic retinopathy.' },
  ];

  return (
    <group ref={groupRef}>
      {/* Outer glow effect */}
      <Sphere args={[1.7, 32, 32]} position={[0, 0, 0]}>
        <meshBasicMaterial color="#4fd1c5" transparent opacity={0.05} />
      </Sphere>
      
      {eyeParts.map((part, index) => (
        <EyePart
          key={index}
          position={part.position}
          color={part.color}
          size={part.size}
          name={part.name}
          description={part.description}
          onHover={onHover}
        />
      ))}
      
      {/* Blood vessels on retina */}
      <mesh position={[0, 0, -0.8]}>
        <torusGeometry args={[0.8, 0.02, 8, 32]} />
        <meshStandardMaterial color="#8B0000" />
      </mesh>
    </group>
  );
};

const Eye3D = () => {
  const [hoveredPart, setHoveredPart] = useState<{ name: string; description: string } | null>(null);

  return (
    <div className="relative w-full h-[500px] rounded-2xl overflow-hidden glass-card">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} color="#4fd1c5" intensity={0.5} />
        <EyeModel onHover={setHoveredPart} />
        <OrbitControls 
          enableZoom={true}
          enablePan={false}
          minDistance={3}
          maxDistance={8}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
      
      {/* Info Panel */}
      <div className="absolute bottom-4 left-4 right-4">
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
      <div className="absolute top-4 right-4 glass-card px-3 py-2">
        <p className="text-xs text-muted-foreground">Click & drag to rotate • Scroll to zoom • Hover for details</p>
      </div>
    </div>
  );
};

export default Eye3D;
