"use client";

import { useEffect, useRef } from "react";

export default function WaveVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let phase = 0;

    // Handle resizing
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Draw loops
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;
      const centerY = height / 2;

      // Draw 3 layers of overlapping sine waves for a 3D fluid mesh effect
      const waves = [
        { amplitude: 25, frequency: 0.015, speed: 0.04, color: "rgba(208, 240, 37, 0.25)" }, // Yellow-Lime
        { amplitude: 18, frequency: 0.025, speed: 0.06, color: "rgba(180, 220, 30, 0.35)" }, // Soft Lime
        { amplitude: 10, frequency: 0.035, speed: 0.08, color: "rgba(220, 255, 50, 0.45)" }, // Mint-Yellow
      ];

      waves.forEach((wave) => {
        ctx.beginPath();
        ctx.strokeStyle = wave.color;
        ctx.lineWidth = 2.5;

        for (let x = 0; x < width; x += 2) {
          const y = centerY + Math.sin(x * wave.frequency + phase * wave.speed) * wave.amplitude * Math.sin(x / width * Math.PI);
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });

      phase += 0.5;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative w-full h-44 flex items-center justify-center overflow-hidden rounded-3xl bg-secondary/5 border border-border/40">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <span className="absolute bottom-3 text-[10px] uppercase font-bold tracking-widest text-emerald-500/80 animate-pulse bg-emerald-500/10 px-2 py-0.5 rounded-full">
        AI Signal Active
      </span>
    </div>
  );
}
