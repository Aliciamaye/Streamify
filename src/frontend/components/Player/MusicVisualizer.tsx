/**
 * Real-time Music Visualizer
 * Beautiful audio visualizations synchronized with playback
 */

import React, { useEffect, useRef, useState } from 'react';
import { Volume2, Waves, Zap, Music, Pause, Play } from 'lucide-react';

interface VisualizerProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  isPlaying: boolean;
  className?: string;
  type?: 'bars' | 'wave' | 'circle' | 'particles';
}

export const MusicVisualizer: React.FC<VisualizerProps> = ({
  audioRef,
  isPlaying,
  className = '',
  type = 'bars'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const analyzerRef = useRef<AnalyserNode>();
  const audioContextRef = useRef<AudioContext>();
  const dataArrayRef = useRef<Uint8Array>();
  
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (audioRef.current && !isInitialized) {
      initializeAudioContext();
    }
  }, [audioRef.current, isInitialized]);

  useEffect(() => {
    if (isPlaying && isInitialized) {
      startVisualization();
    } else {
      stopVisualization();
    }

    return () => stopVisualization();
  }, [isPlaying, isInitialized, type]);

  const initializeAudioContext = async () => {
    if (!audioRef.current) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyzer = audioContext.createAnalyser();
      const source = audioContext.createMediaElementSource(audioRef.current);
      
      analyzer.fftSize = 256;
      const bufferLength = analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      source.connect(analyzer);
      analyzer.connect(audioContext.destination);
      
      audioContextRef.current = audioContext;
      analyzerRef.current = analyzer;
      dataArrayRef.current = dataArray;
      
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  };

  const startVisualization = () => {
    if (!analyzerRef.current || !dataArrayRef.current || !canvasRef.current) return;
    
    const draw = () => {
      if (!analyzerRef.current || !dataArrayRef.current || !canvasRef.current) return;
      
      analyzerRef.current.getByteFrequencyData(dataArrayRef.current);
      
      switch (type) {
        case 'bars':
          drawBars();
          break;
        case 'wave':
          drawWave();
          break;
        case 'circle':
          drawCircle();
          break;
        case 'particles':
          drawParticles();
          break;
      }
      
      animationRef.current = requestAnimationFrame(draw);
    };
    
    draw();
  };

  const stopVisualization = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const drawBars = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const data = dataArrayRef.current!;
    
    const width = canvas.width;
    const height = canvas.height;
    const barWidth = width / data.length * 2.5;
    
    ctx.clearRect(0, 0, width, height);
    
    // Create gradient
    const gradient = ctx.createLinearGradient(0, height, 0, 0);
    gradient.addColorStop(0, '#10B981'); // green-500
    gradient.addColorStop(0.5, '#3B82F6'); // blue-500
    gradient.addColorStop(1, '#8B5CF6'); // violet-500
    
    let x = 0;
    
    for (let i = 0; i < data.length; i++) {
      const barHeight = (data[i] / 255) * height * 0.8;
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, height - barHeight, barWidth, barHeight);
      
      // Add glow effect
      ctx.shadowColor = '#3B82F6';
      ctx.shadowBlur = 10;
      ctx.fillRect(x, height - barHeight, barWidth, barHeight);
      ctx.shadowBlur = 0;
      
      x += barWidth + 1;
    }
  };

  const drawWave = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const data = dataArrayRef.current!;
    
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#3B82F6';
    ctx.shadowColor = '#3B82F6';
    ctx.shadowBlur = 15;
    
    ctx.beginPath();
    
    const sliceWidth = width / data.length;
    let x = 0;
    
    for (let i = 0; i < data.length; i++) {
      const v = data[i] / 255;
      const y = (v * height) / 2 + height / 2;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      
      x += sliceWidth;
    }
    
    ctx.stroke();
  };

  const drawCircle = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const data = dataArrayRef.current!;
    
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 4;
    
    ctx.clearRect(0, 0, width, height);
    
    const bars = 64;
    const step = (Math.PI * 2) / bars;
    
    for (let i = 0; i < bars; i++) {
      const angle = step * i;
      const barHeight = (data[i] || 0) / 255 * radius;
      
      const x1 = centerX + Math.cos(angle) * radius;
      const y1 = centerY + Math.sin(angle) * radius;
      const x2 = centerX + Math.cos(angle) * (radius + barHeight);
      const y2 = centerY + Math.sin(angle) * (radius + barHeight);
      
      const hue = (i / bars) * 360;
      ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
      ctx.lineWidth = 2;
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 10;
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  };

  const drawParticles = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const data = dataArrayRef.current!;
    
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    const particles = 50;
    
    for (let i = 0; i < particles && i < data.length; i++) {
      const intensity = data[i] / 255;
      const x = (i / particles) * width;
      const y = height / 2 + (Math.sin(Date.now() * 0.001 + i) * intensity * 100);
      const size = intensity * 5 + 1;
      
      const hue = (intensity * 300 + Date.now() * 0.1) % 360;
      ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 20;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        width={800}
        height={200}
        className="w-full h-full rounded-lg bg-slate-900/50"
        style={{ maxHeight: '200px' }}
      />
      
      {!isInitialized && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 rounded-lg">
          <div className="text-center">
            <Volume2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">Click play to start visualizer</p>
          </div>
        </div>
      )}
      
      {!isPlaying && isInitialized && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 rounded-lg">
          <Pause className="w-12 h-12 text-white/60" />
        </div>
      )}
    </div>
  );
};

// Preset visualizer types
export const VisualizerPresets = {
  bars: { name: 'Frequency Bars', icon: Zap },
  wave: { name: 'Waveform', icon: Waves },
  circle: { name: 'Radial', icon: Volume2 },
  particles: { name: 'Particles', icon: Music }
};

export default MusicVisualizer;