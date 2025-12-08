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

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    // Eye particles
    const particles: Array<{
      x: number;
      y: number;
      radius: number;
      speedX: number;
      speedY: number;
      opacity: number;
    }> = [];

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.1,
      });
    }

    const drawEye = (x: number, y: number, size: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      
      // Outer glow
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 1.5);
      gradient.addColorStop(0, 'rgba(79, 209, 197, 0.15)');
      gradient.addColorStop(1, 'rgba(79, 209, 197, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, size * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Sclera (white of eye)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.ellipse(0, 0, size, size * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Iris
      const irisGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.4);
      irisGradient.addColorStop(0, 'rgba(79, 209, 197, 0.4)');
      irisGradient.addColorStop(0.7, 'rgba(56, 178, 172, 0.3)');
      irisGradient.addColorStop(1, 'rgba(49, 151, 149, 0.2)');
      ctx.fillStyle = irisGradient;
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Pupil
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.15, 0, Math.PI * 2);
      ctx.fill();

      // Highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(size * 0.1, -size * 0.1, size * 0.08, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const animate = () => {
      time += 0.01;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw particles
      particles.forEach((particle) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(79, 209, 197, ${particle.opacity})`;
        ctx.fill();
      });

      // Draw floating eyes
      const eyePositions = [
        { x: canvas.width * 0.15, y: canvas.height * 0.3, size: 80 },
        { x: canvas.width * 0.85, y: canvas.height * 0.2, size: 60 },
        { x: canvas.width * 0.75, y: canvas.height * 0.7, size: 100 },
        { x: canvas.width * 0.25, y: canvas.height * 0.8, size: 50 },
        { x: canvas.width * 0.5, y: canvas.height * 0.15, size: 40 },
      ];

      eyePositions.forEach((eye, index) => {
        const offsetX = Math.sin(time + index) * 20;
        const offsetY = Math.cos(time + index * 0.5) * 15;
        const rotation = Math.sin(time * 0.5 + index) * 0.1;
        drawEye(eye.x + offsetX, eye.y + offsetY, eye.size, rotation);
      });

      // Draw connecting lines between particles
      ctx.strokeStyle = 'rgba(79, 209, 197, 0.05)';
      ctx.lineWidth = 1;
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach((p2) => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ opacity: 0.7 }}
      />
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(79, 209, 197, 0.1), transparent)',
        }}
      />
    </>
  );
};

export default AnimatedBackground;
