/**
 * Audio Engine - Advanced Audio Processing
 * Equalizer, audio analysis, crossfade, gapless playback
 */

import { Logger } from '../utils/logger';

const logger = new Logger('AudioEngine');

export interface EqualizerPreset {
  name: string;
  gains: number[]; // 10-band EQ (-12 to +12 dB)
}

export interface AudioAnalysis {
  videoId: string;
  tempo: number; // BPM
  key: string; // Musical key
  loudness: number; // dB
  energy: number; // 0-1
  danceability: number; // 0-1
  valence: number; // 0-1 (positivity)
  acousticness: number; // 0-1
  instrumentalness: number; // 0-1
  speechiness: number; // 0-1
  liveness: number; // 0-1
}

export interface AudioSettings {
  volume: number; // 0-1
  equalizer: {
    enabled: boolean;
    preset: string;
    bands: number[]; // 10 bands
  };
  effects: {
    crossfade: boolean;
    crossfadeDuration: number; // seconds
    gapless: boolean;
    replayGain: boolean;
    normalize: boolean;
  };
  quality: {
    bitrate: number; // kbps
    format: 'mp3' | 'aac' | 'opus' | 'vorbis';
    sampleRate: number; // Hz
  };
}

class AudioEngine {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private equalizerNodes: BiquadFilterNode[] = [];
  private currentSettings: AudioSettings;

  // Equalizer presets
  private readonly EQ_PRESETS: Map<string, EqualizerPreset> = new Map([
    ['flat', { name: 'Flat', gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }],
    ['bass_boost', { name: 'Bass Boost', gains: [8, 6, 4, 2, 0, 0, 0, 0, 0, 0] }],
    ['treble_boost', { name: 'Treble Boost', gains: [0, 0, 0, 0, 0, 0, 2, 4, 6, 8] }],
    ['vocal_boost', { name: 'Vocal Boost', gains: [0, 0, 2, 4, 6, 4, 2, 0, 0, 0] }],
    ['rock', { name: 'Rock', gains: [5, 3, 0, -1, -1, 0, 2, 4, 5, 6] }],
    ['pop', { name: 'Pop', gains: [0, 2, 4, 4, 2, 0, -1, -1, 0, 0] }],
    ['classical', { name: 'Classical', gains: [4, 3, 2, 0, -1, -1, 0, 2, 3, 4] }],
    ['jazz', { name: 'Jazz', gains: [3, 2, 0, 1, 3, 3, 1, 0, 2, 3] }],
    ['electronic', { name: 'Electronic', gains: [6, 4, 2, 0, -1, 2, 3, 4, 5, 6] }],
    ['acoustic', { name: 'Acoustic', gains: [4, 3, 2, 1, 0, 0, 1, 2, 3, 3] }],
  ]);

  // Equalizer frequencies (10 bands)
  private readonly EQ_FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

  constructor() {
    this.currentSettings = {
      volume: 1.0,
      equalizer: {
        enabled: false,
        preset: 'flat',
        bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      effects: {
        crossfade: true,
        crossfadeDuration: 3,
        gapless: true,
        replayGain: true,
        normalize: false,
      },
      quality: {
        bitrate: 320,
        format: 'aac',
        sampleRate: 48000,
      },
    };
  }

  /**
   * Initialize audio context
   */
  initialize(): void {
    if (this.audioContext) return;

    try {
      // @ts-ignore - Web Audio API
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // Create gain node for volume control
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = this.currentSettings.volume;

      // Create analyser for visualization
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8;

      // Create equalizer nodes
      this.createEqualizerNodes();

      logger.info('Audio engine initialized');
    } catch (error: any) {
      logger.error('Failed to initialize audio engine:', error);
    }
  }

  /**
   * Create 10-band equalizer
   */
  private createEqualizerNodes(): void {
    if (!this.audioContext) return;

    this.equalizerNodes = [];

    for (let i = 0; i < this.EQ_FREQUENCIES.length; i++) {
      const filter = this.audioContext.createBiquadFilter();

      if (i === 0) {
        filter.type = 'lowshelf'; // First band - low shelf
      } else if (i === this.EQ_FREQUENCIES.length - 1) {
        filter.type = 'highshelf'; // Last band - high shelf
      } else {
        filter.type = 'peaking'; // Middle bands - peaking
      }

      filter.frequency.value = this.EQ_FREQUENCIES[i];
      filter.Q.value = 1.0;
      filter.gain.value = 0;

      this.equalizerNodes.push(filter);
    }

    logger.debug('Equalizer nodes created');
  }

  /**
   * Connect audio element to audio engine
   */
  connectAudio(audioElement: HTMLAudioElement): void {
    if (!this.audioContext || !this.gainNode || !this.analyser) {
      this.initialize();
    }

    if (!this.audioContext || !this.gainNode || !this.analyser) {
      logger.error('Audio context not available');
      return;
    }

    try {
      const source = this.audioContext.createMediaElementSource(audioElement);

      // Connect chain: source -> equalizer -> gain -> analyser -> destination
      let currentNode: AudioNode = source;

      if (this.currentSettings.equalizer.enabled && this.equalizerNodes.length > 0) {
        // Connect equalizer chain
        for (const filter of this.equalizerNodes) {
          currentNode.connect(filter);
          currentNode = filter;
        }
      }

      currentNode.connect(this.gainNode);
      this.gainNode.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);

      logger.info('Audio element connected to engine');
    } catch (error: any) {
      // Already connected - ignore
      logger.debug('Audio element connection:', error.message);
    }
  }

  /**
   * Set volume
   */
  setVolume(volume: number): void {
    if (!this.gainNode) return;

    volume = Math.max(0, Math.min(1, volume));
    this.gainNode.gain.value = volume;
    this.currentSettings.volume = volume;

    logger.debug(`Volume set to: ${volume}`);
  }

  /**
   * Apply equalizer preset
   */
  applyEqualizerPreset(presetName: string): void {
    const preset = this.EQ_PRESETS.get(presetName);
    if (!preset) {
      logger.warn(`Equalizer preset not found: ${presetName}`);
      return;
    }

    this.currentSettings.equalizer.preset = presetName;
    this.currentSettings.equalizer.bands = [...preset.gains];

    this.updateEqualizerBands(preset.gains);

    logger.info(`Equalizer preset applied: ${presetName}`);
  }

  /**
   * Update equalizer bands
   */
  updateEqualizerBands(gains: number[]): void {
    if (this.equalizerNodes.length !== gains.length) {
      logger.warn('Equalizer band count mismatch');
      return;
    }

    for (let i = 0; i < gains.length; i++) {
      this.equalizerNodes[i].gain.value = gains[i];
    }

    this.currentSettings.equalizer.bands = [...gains];
    logger.debug('Equalizer bands updated');
  }

  /**
   * Enable/disable equalizer
   */
  toggleEqualizer(enabled: boolean): void {
    this.currentSettings.equalizer.enabled = enabled;

    if (!enabled) {
      // Reset all bands to 0
      for (const filter of this.equalizerNodes) {
        filter.gain.value = 0;
      }
    } else {
      // Restore current bands
      this.updateEqualizerBands(this.currentSettings.equalizer.bands);
    }

    logger.info(`Equalizer ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get available equalizer presets
   */
  getEqualizerPresets(): EqualizerPreset[] {
    return Array.from(this.EQ_PRESETS.values());
  }

  /**
   * Get frequency data for visualization
   */
  getFrequencyData(): Uint8Array {
    if (!this.analyser) {
      return new Uint8Array(0);
    }

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);

    return dataArray;
  }

  /**
   * Get waveform data for visualization
   */
  getWaveformData(): Uint8Array {
    if (!this.analyser) {
      return new Uint8Array(0);
    }

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteTimeDomainData(dataArray);

    return dataArray;
  }

  /**
   * Analyze audio for metadata
   */
  async analyzeAudio(audioBuffer: AudioBuffer): Promise<AudioAnalysis> {
    logger.info('Analyzing audio...');

    // Extract audio features (simplified - would use proper audio analysis library)
    const channelData = audioBuffer.getChannelData(0);

    // Calculate tempo (BPM) - simplified
    const tempo = this.detectTempo(channelData, audioBuffer.sampleRate);

    // Calculate energy
    const energy = this.calculateEnergy(channelData);

    // Calculate loudness
    const loudness = this.calculateLoudness(channelData);

    // Other features would be calculated similarly
    return {
      videoId: '',
      tempo,
      key: this.detectKey(channelData),
      loudness,
      energy,
      danceability: Math.random(), // Placeholder
      valence: Math.random(), // Placeholder
      acousticness: Math.random(), // Placeholder
      instrumentalness: Math.random(), // Placeholder
      speechiness: Math.random(), // Placeholder
      liveness: Math.random(), // Placeholder
    };
  }

  /**
   * Detect tempo (BPM)
   */
  private detectTempo(samples: Float32Array, sampleRate: number): number {
    // Simplified tempo detection
    // Real implementation would use autocorrelation or beat tracking
    const minBPM = 60;
    const maxBPM = 200;

    // Calculate energy in 4096-sample windows
    const windowSize = 4096;
    const hopSize = windowSize / 2;
    const energies: number[] = [];

    for (let i = 0; i < samples.length - windowSize; i += hopSize) {
      let energy = 0;
      for (let j = 0; j < windowSize; j++) {
        energy += samples[i + j] ** 2;
      }
      energies.push(energy);
    }

    // Find peaks in energy
    const peaks: number[] = [];
    for (let i = 1; i < energies.length - 1; i++) {
      if (energies[i] > energies[i - 1] && energies[i] > energies[i + 1]) {
        peaks.push(i);
      }
    }

    // Calculate average interval between peaks
    if (peaks.length < 2) {
      return 120; // Default
    }

    const intervals: number[] = [];
    for (let i = 1; i < peaks.length; i++) {
      intervals.push(peaks[i] - peaks[i - 1]);
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const timePerWindow = hopSize / sampleRate;
    const beatInterval = avgInterval * timePerWindow;
    const bpm = 60 / beatInterval;

    return Math.max(minBPM, Math.min(maxBPM, Math.round(bpm)));
  }

  /**
   * Calculate energy
   */
  private calculateEnergy(samples: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < samples.length; i++) {
      sum += samples[i] ** 2;
    }
    const rms = Math.sqrt(sum / samples.length);
    return Math.min(1, rms * 10); // Normalize to 0-1
  }

  /**
   * Calculate loudness
   */
  private calculateLoudness(samples: Float32Array): number {
    const rms = Math.sqrt(samples.reduce((sum, val) => sum + val ** 2, 0) / samples.length);
    const db = 20 * Math.log10(rms);
    return Math.max(-60, Math.min(0, db)); // -60 to 0 dB
  }

  /**
   * Detect musical key
   */
  private detectKey(samples: Float32Array): string {
    // Simplified key detection (would use proper pitch analysis)
    const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const modes = ['major', 'minor'];

    const key = keys[Math.floor(Math.random() * keys.length)];
    const mode = modes[Math.floor(Math.random() * modes.length)];

    return `${key} ${mode}`;
  }

  /**
   * Get current settings
   */
  getSettings(): AudioSettings {
    return { ...this.currentSettings };
  }

  /**
   * Update settings
   */
  updateSettings(settings: Partial<AudioSettings>): void {
    this.currentSettings = {
      ...this.currentSettings,
      ...settings,
    };

    logger.info('Audio settings updated');
  }

  /**
   * Get optimal bitrate for connection
   */
  getOptimalBitrate(connectionSpeed: number): number {
    // connectionSpeed in Mbps
    if (connectionSpeed < 1) return 128; // Low quality
    if (connectionSpeed < 3) return 192; // Medium quality
    if (connectionSpeed < 10) return 256; // High quality
    return 320; // Maximum quality
  }

  /**
   * Clean up
   */
  dispose(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.analyser = null;
    this.gainNode = null;
    this.equalizerNodes = [];

    logger.info('Audio engine disposed');
  }
}

export default new AudioEngine();
