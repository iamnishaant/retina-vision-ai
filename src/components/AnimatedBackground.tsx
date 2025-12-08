import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;
    let mouseX = 0;
    let mouseY = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    // Track mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Neural network nodes
    const nodes: Array<{
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      radius: number;
      phase: number;
      speed: number;
    }> = [];

    // Create neural network grid
    const gridSize = 8;
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        nodes.push({
          x: (canvas.width / (gridSize - 1)) * i,
          y: (canvas.height / (gridSize - 1)) * j,
          baseX: (canvas.width / (gridSize - 1)) * i,
          baseY: (canvas.height / (gridSize - 1)) * j,
          radius: Math.random() * 2 + 1,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.5 + 0.5,
        });
      }
    }

    // Floating eye data
    const floatingEyes = [
      { x: 0.12, y: 0.25, size: 120, speed: 0.3, phase: 0 },
      { x: 0.88, y: 0.15, size: 80, speed: 0.4, phase: 1 },
      { x: 0.78, y: 0.75, size: 150, speed: 0.25, phase: 2 },
      { x: 0.18, y: 0.82, size: 70, speed: 0.45, phase: 3 },
      { x: 0.5, y: 0.08, size: 60, speed: 0.35, phase: 4 },
    ];

    const drawRealisticEye = (x: number, y: number, size: number, lookAtX: number, lookAtY: number, pulsePhase: number) => {
      ctx.save();
      
      // Calculate look direction
      const dx = lookAtX - x;
      const dy = lookAtY - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const maxOffset = size * 0.08;
      const offsetX = (dx / distance) * Math.min(maxOffset, distance * 0.01);
      const offsetY = (dy / distance) * Math.min(maxOffset, distance * 0.01);

      // Pulsing effect
      const pulse = 1 + Math.sin(pulsePhase) * 0.02;
      const currentSize = size * pulse;

      // Outer glow - multiple layers
      for (let i = 3; i > 0; i--) {
        const glowGradient = ctx.createRadialGradient(x, y, currentSize * 0.3, x, y, currentSize * (0.8 + i * 0.3));
        glowGradient.addColorStop(0, 'rgba(79, 209, 197, 0)');
        glowGradient.addColorStop(0.5, `rgba(79, 209, 197, ${0.03 / i})`);
        glowGradient.addColorStop(1, 'rgba(79, 209, 197, 0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(x, y, currentSize * (0.8 + i * 0.3), 0, Math.PI * 2);
        ctx.fill();
      }

      // Eye socket shadow
      const shadowGradient = ctx.createRadialGradient(x, y + currentSize * 0.1, 0, x, y, currentSize * 0.75);
      shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
      shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = shadowGradient;
      ctx.beginPath();
      ctx.ellipse(x, y + currentSize * 0.05, currentSize * 0.72, currentSize * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();

      // Sclera (white of eye) with realistic shape
      const scleraGradient = ctx.createRadialGradient(x - currentSize * 0.1, y - currentSize * 0.1, 0, x, y, currentSize * 0.5);
      scleraGradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
      scleraGradient.addColorStop(0.7, 'rgba(245, 240, 235, 0.12)');
      scleraGradient.addColorStop(1, 'rgba(220, 215, 210, 0.08)');
      ctx.fillStyle = scleraGradient;
      ctx.beginPath();
      ctx.ellipse(x, y, currentSize * 0.5, currentSize * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();

      // Sclera edge/limbus
      ctx.strokeStyle = 'rgba(200, 195, 190, 0.1)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(x, y, currentSize * 0.5, currentSize * 0.35, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Blood vessels on sclera
      ctx.strokeStyle = 'rgba(180, 80, 80, 0.06)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const startX = x + Math.cos(angle) * currentSize * 0.25;
        const startY = y + Math.sin(angle) * currentSize * 0.18;
        const endX = x + Math.cos(angle) * currentSize * 0.48;
        const endY = y + Math.sin(angle) * currentSize * 0.33;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(
          x + Math.cos(angle + 0.2) * currentSize * 0.4,
          y + Math.sin(angle + 0.2) * currentSize * 0.28,
          endX, endY
        );
        ctx.stroke();
      }

      // Iris with depth and texture
      const irisX = x + offsetX;
      const irisY = y + offsetY;
      const irisRadius = currentSize * 0.22;

      // Iris outer ring
      const irisOuterGradient = ctx.createRadialGradient(irisX, irisY, irisRadius * 0.3, irisX, irisY, irisRadius);
      irisOuterGradient.addColorStop(0, 'rgba(79, 170, 180, 0.5)');
      irisOuterGradient.addColorStop(0.5, 'rgba(56, 130, 140, 0.45)');
      irisOuterGradient.addColorStop(0.8, 'rgba(40, 100, 110, 0.4)');
      irisOuterGradient.addColorStop(1, 'rgba(30, 70, 80, 0.35)');
      ctx.fillStyle = irisOuterGradient;
      ctx.beginPath();
      ctx.arc(irisX, irisY, irisRadius, 0, Math.PI * 2);
      ctx.fill();

      // Iris fibrous texture
      ctx.strokeStyle = 'rgba(100, 180, 190, 0.15)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < 24; i++) {
        const angle = (i / 24) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(irisX + Math.cos(angle) * irisRadius * 0.35, irisY + Math.sin(angle) * irisRadius * 0.35);
        ctx.lineTo(irisX + Math.cos(angle) * irisRadius * 0.95, irisY + Math.sin(angle) * irisRadius * 0.95);
        ctx.stroke();
      }

      // Collarette ring
      ctx.strokeStyle = 'rgba(140, 200, 200, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(irisX, irisY, irisRadius * 0.5, 0, Math.PI * 2);
      ctx.stroke();

      // Pupil
      const pupilRadius = currentSize * 0.08;
      const pupilGradient = ctx.createRadialGradient(irisX, irisY, 0, irisX, irisY, pupilRadius);
      pupilGradient.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
      pupilGradient.addColorStop(1, 'rgba(10, 10, 10, 0.85)');
      ctx.fillStyle = pupilGradient;
      ctx.beginPath();
      ctx.arc(irisX, irisY, pupilRadius, 0, Math.PI * 2);
      ctx.fill();

      // Corneal reflection (main highlight)
      const highlightGradient = ctx.createRadialGradient(
        irisX - irisRadius * 0.3, 
        irisY - irisRadius * 0.3, 
        0, 
        irisX - irisRadius * 0.3, 
        irisY - irisRadius * 0.3, 
        irisRadius * 0.25
      );
      highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
      highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
      highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = highlightGradient;
      ctx.beginPath();
      ctx.arc(irisX - irisRadius * 0.3, irisY - irisRadius * 0.3, irisRadius * 0.25, 0, Math.PI * 2);
      ctx.fill();

      // Secondary highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.arc(irisX + irisRadius * 0.2, irisY + irisRadius * 0.25, irisRadius * 0.08, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const animate = () => {
      time += 0.008;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Gradient background overlay
      const bgGradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width * 0.8
      );
      bgGradient.addColorStop(0, 'rgba(15, 25, 35, 0)');
      bgGradient.addColorStop(1, 'rgba(5, 10, 15, 0.3)');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw neural network nodes
      nodes.forEach((node) => {
        node.x = node.baseX + Math.sin(time * node.speed + node.phase) * 30;
        node.y = node.baseY + Math.cos(time * node.speed + node.phase) * 30;
      });

      // Draw connections between nearby nodes
      ctx.strokeStyle = 'rgba(79, 209, 197, 0.04)';
      ctx.lineWidth = 1;
      nodes.forEach((node, i) => {
        nodes.slice(i + 1).forEach((otherNode) => {
          const dx = node.x - otherNode.x;
          const dy = node.y - otherNode.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 200) {
            ctx.globalAlpha = (1 - distance / 200) * 0.3;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(otherNode.x, otherNode.y);
            ctx.stroke();
          }
        });
      });
      ctx.globalAlpha = 1;

      // Draw nodes
      nodes.forEach((node) => {
        const nodeGlow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.radius * 4);
        nodeGlow.addColorStop(0, 'rgba(79, 209, 197, 0.3)');
        nodeGlow.addColorStop(1, 'rgba(79, 209, 197, 0)');
        ctx.fillStyle = nodeGlow;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(79, 209, 197, 0.5)';
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw floating eyes
      floatingEyes.forEach((eye) => {
        const eyeX = canvas.width * eye.x + Math.sin(time * eye.speed + eye.phase) * 40;
        const eyeY = canvas.height * eye.y + Math.cos(time * eye.speed * 0.7 + eye.phase) * 30;
        drawRealisticEye(eyeX, eyeY, eye.size, mouseX, mouseY, time * 2 + eye.phase);
      });

      // Scan line effect
      const scanY = (time * 100) % (canvas.height + 100) - 50;
      const scanGradient = ctx.createLinearGradient(0, scanY - 50, 0, scanY + 50);
      scanGradient.addColorStop(0, 'rgba(79, 209, 197, 0)');
      scanGradient.addColorStop(0.5, 'rgba(79, 209, 197, 0.03)');
      scanGradient.addColorStop(1, 'rgba(79, 209, 197, 0)');
      ctx.fillStyle = scanGradient;
      ctx.fillRect(0, scanY - 50, canvas.width, 100);

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
      />
      {/* Gradient overlays for depth */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 100% 70% at 50% 0%, rgba(79, 209, 197, 0.08), transparent 50%)',
          }}
        />
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 50% at 20% 80%, rgba(56, 178, 172, 0.05), transparent 40%)',
          }}
        />
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 60% 40% at 80% 70%, rgba(79, 209, 197, 0.04), transparent 40%)',
          }}
        />
        {/* Vignette */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 70% 70% at 50% 50%, transparent 30%, rgba(0, 0, 0, 0.4) 100%)',
          }}
        />
      </motion.div>
    </>
  );
};

export default AnimatedBackground;