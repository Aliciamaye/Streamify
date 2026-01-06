import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sliders, RotateCcw, Save, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

interface EqualizerBand {
  frequency: number;
  gain: number;
  label: string;
}

interface EqualizerPreset {
  name: string;
  gains: number[];
}

const PRESETS: EqualizerPreset[] = [
  { name: 'Flat', gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { name: 'Bass Boost', gains: [8, 6, 4, 2, 0, 0, 0, 0, 0, 0] },
  { name: 'Treble Boost', gains: [0, 0, 0, 0, 0, 2, 4, 6, 8, 10] },
  { name: 'Rock', gains: [6, 4, -2, -3, -1, 2, 4, 5, 5, 5] },
  { name: 'Pop', gains: [-1, 3, 5, 4, 0, -1, -1, 0, 2, 3] },
  { name: 'Classical', gains: [4, 3, 2, 0, -2, -2, 0, 2, 3, 4] },
  { name: 'Jazz', gains: [3, 2, 0, 1, 3, 3, 2, 1, 2, 3] },
  { name: 'Electronic', gains: [5, 4, 2, 0, -2, 2, 1, 2, 4, 5] },
  { name: 'Hip Hop', gains: [7, 5, 1, 2, -1, -1, 1, 0, 2, 3] },
  { name: 'Vocal Boost', gains: [-2, -3, -2, 1, 4, 4, 3, 1, 0, -1] }
];

const BANDS: Omit<EqualizerBand, 'gain'>[] = [
  { frequency: 32, label: '32Hz' },
  { frequency: 64, label: '64Hz' },
  { frequency: 125, label: '125Hz' },
  { frequency: 250, label: '250Hz' },
  { frequency: 500, label: '500Hz' },
  { frequency: 1000, label: '1kHz' },
  { frequency: 2000, label: '2kHz' },
  { frequency: 4000, label: '4kHz' },
  { frequency: 8000, label: '8kHz' },
  { frequency: 16000, label: '16kHz' }
];

interface EqualizerProps {
  audioContext?: AudioContext;
  sourceNode?: AudioNode;
  onEqualizerChange?: (bands: EqualizerBand[]) => void;
}

const Equalizer: React.FC<EqualizerProps> = ({ 
  audioContext,
  sourceNode,
  onEqualizerChange 
}) => {
  const [bands, setBands] = useState<EqualizerBand[]>(
    BANDS.map(band => ({ ...band, gain: 0 }))
  );
  const [activePreset, setActivePreset] = useState<string>('Flat');
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    if (onEqualizerChange) {
      onEqualizerChange(bands);
    }
  }, [bands]);

  const handleBandChange = (index: number, gain: number) => {
    const newBands = [...bands];
    newBands[index] = { ...newBands[index], gain };
    setBands(newBands);
    setActivePreset('Custom');
  };

  const applyPreset = (preset: EqualizerPreset) => {
    const newBands = bands.map((band, i) => ({
      ...band,
      gain: preset.gains[i]
    }));
    setBands(newBands);
    setActivePreset(preset.name);
    toast.success(`Applied ${preset.name} preset`);
  };

  const resetEqualizer = () => {
    applyPreset(PRESETS[0]); // Flat preset
  };

  const saveCustomPreset = () => {
    const presetName = prompt('Enter preset name:');
    if (presetName) {
      const customPreset = {
        name: presetName,
        gains: bands.map(b => b.gain)
      };
      
      // In a real app, save to localStorage or backend
      localStorage.setItem(
        `eq-preset-${presetName}`,
        JSON.stringify(customPreset)
      );
      
      toast.success(`Saved preset: ${presetName}`);
    }
  };

  const getBarColor = (gain: number) => {
    if (gain > 6) return 'from-red-500 to-red-400';
    if (gain > 3) return 'from-orange-500 to-orange-400';
    if (gain > 0) return 'from-yellow-500 to-yellow-400';
    if (gain === 0) return 'from-green-500 to-green-400';
    if (gain > -3) return 'from-blue-500 to-blue-400';
    return 'from-purple-500 to-purple-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-lg rounded-xl border border-white/10 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Sliders className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-white">10-Band Equalizer</h3>
            <p className="text-sm text-white/60">Fine-tune your audio</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEnabled(!isEnabled)}
            className={`
              px-3 py-1.5 rounded-lg font-semibold text-sm transition-all
              ${isEnabled 
                ? 'bg-primary text-white' 
                : 'bg-white/10 text-white/60'
              }
            `}
          >
            {isEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Presets */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-white/80">Presets</label>
          <div className="flex gap-2">
            <button
              onClick={saveCustomPreset}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Save Custom Preset"
            >
              <Save className="w-4 h-4 text-white/60" />
            </button>
            <button
              onClick={resetEqualizer}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Reset to Flat"
            >
              <RotateCcw className="w-4 h-4 text-white/60" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {PRESETS.map(preset => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              className={`
                px-3 py-1.5 rounded-lg font-semibold text-sm transition-all
                ${activePreset === preset.name
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
                }
              `}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Equalizer Bands */}
      <div className={`transition-opacity duration-300 ${isEnabled ? 'opacity-100' : 'opacity-30'}`}>
        <div className="flex items-end justify-between gap-3 h-64 mb-4">
          {bands.map((band, index) => {
            const normalizedHeight = ((band.gain + 12) / 24) * 100; // -12dB to +12dB -> 0% to 100%
            const isNegative = band.gain < 0;

            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                {/* Slider */}
                <div className="relative h-48 w-full flex items-center justify-center">
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    step="0.5"
                    value={band.gain}
                    onChange={(e) => handleBandChange(index, parseFloat(e.target.value))}
                    disabled={!isEnabled}
                    className="slider-vertical"
                    style={{
                      width: '192px', // h-48
                      height: '100%',
                      transform: 'rotate(-90deg)',
                      transformOrigin: 'center'
                    }}
                  />
                  
                  {/* Visual Bar */}
                  <div className="absolute bottom-1/2 left-1/2 -translate-x-1/2 w-8 flex flex-col items-center">
                    {/* Positive gain */}
                    <div 
                      className={`
                        w-full transition-all duration-200 rounded-t-lg
                        bg-gradient-to-t ${getBarColor(band.gain)}
                      `}
                      style={{ 
                        height: isNegative ? '0%' : `${normalizedHeight * 0.5}%`,
                        minHeight: '2px'
                      }}
                    />
                    
                    {/* Center line */}
                    <div className="w-full h-0.5 bg-white/40" />
                    
                    {/* Negative gain */}
                    <div 
                      className={`
                        w-full transition-all duration-200 rounded-b-lg
                        bg-gradient-to-b ${getBarColor(band.gain)}
                      `}
                      style={{ 
                        height: isNegative ? `${(1 - normalizedHeight) * 0.5 * 100}%` : '0%',
                        minHeight: '2px'
                      }}
                    />
                  </div>
                </div>

                {/* Gain Value */}
                <span className="text-xs font-mono text-white/60 min-w-[3rem] text-center">
                  {band.gain > 0 ? '+' : ''}{band.gain.toFixed(1)}dB
                </span>

                {/* Frequency Label */}
                <span className="text-xs font-medium text-white/80">
                  {band.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Scale Reference */}
        <div className="flex justify-between text-xs text-white/40 px-2">
          <span>-12dB</span>
          <span>0dB</span>
          <span>+12dB</span>
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/20 rounded-lg flex-shrink-0">
            <Sliders className="w-4 h-4 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-white/90 font-medium">
              Current Preset: <span className="text-primary">{activePreset}</span>
            </p>
            <p className="text-xs text-white/60">
              Adjust individual bands or select a preset to enhance your listening experience.
              Changes are applied in real-time.
            </p>
          </div>
        </div>
      </div>

      {/* Custom CSS for vertical slider */}
      <style>{`
        .slider-vertical {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          outline: none;
        }

        .slider-vertical::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          background: white;
          cursor: pointer;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          border: 2px solid rgba(var(--primary-rgb), 1);
        }

        .slider-vertical::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: white;
          cursor: pointer;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          border: 2px solid rgba(var(--primary-rgb), 1);
        }

        .slider-vertical:disabled::-webkit-slider-thumb {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .slider-vertical:disabled::-moz-range-thumb {
          cursor: not-allowed;
          opacity: 0.5;
        }
      `}</style>
    </motion.div>
  );
};

export default Equalizer;
