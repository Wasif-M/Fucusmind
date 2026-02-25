import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  Moon, Wind, CloudRain, Waves, TreePine, Flame, Bird, 
  Music, Headphones, BookOpen, Loader2, Heart, Timer,
  Sparkles, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Ambient sound definitions
const AMBIENT_SOUNDS = [
  {
    id: "rain",
    name: "Gentle Rain",
    icon: CloudRain,
    color: "#60a5fa",
    description: "Calming rainfall for relaxation",
    type: "rain" as const,
  },
  {
    id: "ocean",
    name: "Ocean Waves",
    icon: Waves,
    color: "#22d3ee",
    description: "Peaceful ocean sounds",
    type: "ocean" as const,
  },
  {
    id: "forest",
    name: "Forest Birds",
    icon: Bird,
    color: "#4ade80",
    description: "Morning forest ambience",
    type: "birds" as const,
  },
  {
    id: "wind",
    name: "Soft Wind",
    icon: Wind,
    color: "#a78bfa",
    description: "Gentle breeze through trees",
    type: "wind" as const,
  },
  {
    id: "fire",
    name: "Crackling Fire",
    icon: Flame,
    color: "#f97316",
    description: "Cozy fireplace sounds",
    type: "fire" as const,
  },
  {
    id: "night",
    name: "Night Sounds",
    icon: Moon,
    color: "#818cf8",
    description: "Peaceful nighttime crickets",
    type: "crickets" as const,
  },
];

// Web Audio API sound generator class
class AmbientSoundGenerator {
  private audioContext: AudioContext | null = null;
  private nodes: Map<string, { gain: GainNode; sources: AudioNode[]; intervals: number[] }> = new Map();
  private volume: number = 0.5;
  
  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    return this.audioContext;
  }
  
  setVolume(vol: number) {
    this.volume = vol;
    this.nodes.forEach(({ gain }) => {
      if (this.audioContext) {
        gain.gain.setTargetAtTime(this.volume, this.audioContext.currentTime, 0.1);
      }
    });
  }
  
  isPlaying(soundType: string): boolean {
    return this.nodes.has(soundType);
  }
  
  play(soundType: string) {
    if (this.isPlaying(soundType)) return;
    
    const ctx = this.getContext();
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.volume, ctx.currentTime + 0.5);
    gainNode.connect(ctx.destination);
    
    const sources: AudioNode[] = [];
    const intervals: number[] = [];
    
    switch (soundType) {
      case 'rain': this.createRain(ctx, gainNode, sources); break;
      case 'ocean': this.createOcean(ctx, gainNode, sources, intervals); break;
      case 'birds': this.createBirds(ctx, gainNode, sources, intervals); break;
      case 'wind': this.createWind(ctx, gainNode, sources); break;
      case 'fire': this.createFire(ctx, gainNode, sources); break;
      case 'crickets': this.createCrickets(ctx, gainNode, sources, intervals); break;
    }
    
    this.nodes.set(soundType, { gain: gainNode, sources, intervals });
  }
  
  stop(soundType: string) {
    const node = this.nodes.get(soundType);
    if (node && this.audioContext) {
      node.gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.3);
      setTimeout(() => {
        node.sources.forEach(s => {
          try { if ('stop' in s) (s as OscillatorNode).stop(); } catch {}
        });
        node.intervals.forEach(id => clearInterval(id));
        node.gain.disconnect();
      }, 400);
      this.nodes.delete(soundType);
    }
  }
  
  stopAll() {
    Array.from(this.nodes.keys()).forEach(key => this.stop(key));
  }
  
  private createNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }
  
  private createRain(ctx: AudioContext, output: GainNode, sources: AudioNode[]) {
    const buffer = this.createNoiseBuffer(ctx);
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    
    // Light rain: softer frequencies
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(2500, ctx.currentTime); // Lower for softer sound
    lowpass.Q.setValueAtTime(0.5, ctx.currentTime);
    
    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(200, ctx.currentTime); // Lower for gentler bass
    
    // Additional soft filter for light drizzle effect
    const softFilter = ctx.createBiquadFilter();
    softFilter.type = 'lowpass';
    softFilter.frequency.setValueAtTime(1800, ctx.currentTime);
    softFilter.Q.setValueAtTime(0.3, ctx.currentTime);
    
    // Reduce overall intensity for light rain
    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.6, ctx.currentTime);
    
    noise.connect(lowpass);
    lowpass.connect(highpass);
    highpass.connect(softFilter);
    softFilter.connect(rainGain);
    rainGain.connect(output);
    noise.start();
    sources.push(noise);
  }
  
  private createOcean(ctx: AudioContext, output: GainNode, sources: AudioNode[], intervals: number[]) {
    const buffer = this.createNoiseBuffer(ctx);
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, ctx.currentTime);
    
    const waveGain = ctx.createGain();
    waveGain.gain.setValueAtTime(0.5, ctx.currentTime);
    
    // Simulate wave motion with gain modulation
    let phase = 0;
    const waveInterval = setInterval(() => {
      if (!this.nodes.has('ocean')) return;
      phase += 0.02;
      const waveValue = 0.3 + Math.sin(phase) * 0.2 + Math.sin(phase * 0.3) * 0.15;
      waveGain.gain.setTargetAtTime(waveValue, ctx.currentTime, 0.5);
    }, 100) as unknown as number;
    intervals.push(waveInterval);
    
    noise.connect(filter);
    filter.connect(waveGain);
    waveGain.connect(output);
    noise.start();
    sources.push(noise);
  }
  
  private createBirds(ctx: AudioContext, output: GainNode, sources: AudioNode[], intervals: number[]) {
    const birdGain = ctx.createGain();
    birdGain.gain.setValueAtTime(0.4, ctx.currentTime);
    birdGain.connect(output);
    
    const createChirp = () => {
      if (!this.nodes.has('birds')) return;
      
      const osc = ctx.createOscillator();
      const chirpGain = ctx.createGain();
      
      const baseFreq = 2500 + Math.random() * 2000;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(baseFreq + 800, ctx.currentTime + 0.08);
      osc.frequency.linearRampToValueAtTime(baseFreq + 200, ctx.currentTime + 0.15);
      
      chirpGain.gain.setValueAtTime(0, ctx.currentTime);
      chirpGain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.02);
      chirpGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
      
      osc.connect(chirpGain);
      chirpGain.connect(birdGain);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    };
    
    // Random chirps
    const chirpInterval = setInterval(() => {
      if (Math.random() > 0.3) createChirp();
    }, 600) as unknown as number;
    intervals.push(chirpInterval);
    
    // Initial chirps
    createChirp();
    setTimeout(createChirp, 200);
  }
  
  private createWind(ctx: AudioContext, output: GainNode, sources: AudioNode[]) {
    const buffer = this.createNoiseBuffer(ctx);
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(400, ctx.currentTime);
    bandpass.Q.setValueAtTime(0.3, ctx.currentTime);
    
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.08, ctx.currentTime);
    
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(200, ctx.currentTime);
    
    lfo.connect(lfoGain);
    lfoGain.connect(bandpass.frequency);
    
    const windGain = ctx.createGain();
    windGain.gain.setValueAtTime(0.4, ctx.currentTime);
    
    noise.connect(bandpass);
    bandpass.connect(windGain);
    windGain.connect(output);
    noise.start();
    lfo.start();
    sources.push(noise, lfo);
  }
  
  private createFire(ctx: AudioContext, output: GainNode, sources: AudioNode[]) {
    const buffer = this.createNoiseBuffer(ctx);
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(2500, ctx.currentTime);
    
    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(150, ctx.currentTime);
    
    const crackleGain = ctx.createGain();
    crackleGain.gain.setValueAtTime(0.35, ctx.currentTime);
    
    noise.connect(lowpass);
    lowpass.connect(highpass);
    highpass.connect(crackleGain);
    crackleGain.connect(output);
    noise.start();
    sources.push(noise);
  }
  
  private createCrickets(ctx: AudioContext, output: GainNode, sources: AudioNode[], intervals: number[]) {
    const cricketGain = ctx.createGain();
    cricketGain.gain.setValueAtTime(0.25, ctx.currentTime);
    cricketGain.connect(output);
    
    const createCricketChirp = (freq: number) => {
      if (!this.nodes.has('crickets')) return;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      
      // Rapid on-off pattern
      for (let i = 0; i < 6; i++) {
        const t = ctx.currentTime + i * 0.04;
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.setValueAtTime(0, t + 0.02);
      }
      
      osc.connect(gain);
      gain.connect(cricketGain);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    };
    
    const cricketInterval = setInterval(() => {
      const freq = 3800 + Math.random() * 800;
      createCricketChirp(freq);
    }, 350 + Math.random() * 200) as unknown as number;
    intervals.push(cricketInterval);
  }
}

// Global sound generator instance
const soundGenerator = new AmbientSoundGenerator();

// Guided meditation scripts (will be read via TTS)
const GUIDED_MEDITATIONS = [
  {
    id: "breathing-calm",
    name: "Calming Breath",
    duration: "5 min",
    icon: Wind,
    color: "#9b6dff",
    description: "A simple breathing exercise to calm your mind",
    steps: [
      { text: "Find a comfortable position and close your eyes.", duration: 5000 },
      { text: "Take a deep breath in through your nose for 4 counts.", duration: 5000 },
      { text: "Hold your breath gently for 4 counts.", duration: 5000 },
      { text: "Slowly exhale through your mouth for 6 counts.", duration: 7000 },
      { text: "Feel the tension leaving your body with each exhale.", duration: 5000 },
      { text: "Continue breathing deeply. In through the nose.", duration: 5000 },
      { text: "Hold gently.", duration: 5000 },
      { text: "And release slowly through the mouth.", duration: 7000 },
      { text: "Let your breathing return to its natural rhythm.", duration: 5000 },
      { text: "Notice how calm and centered you feel.", duration: 5000 },
      { text: "When you're ready, slowly open your eyes.", duration: 5000 },
    ],
  },
  {
    id: "body-scan",
    name: "Body Scan Relaxation",
    duration: "8 min",
    icon: Sparkles,
    color: "#22d3ee",
    description: "Progressive relaxation from head to toe",
    steps: [
      { text: "Lie down or sit comfortably. Close your eyes.", duration: 6000 },
      { text: "Take three deep breaths to center yourself.", duration: 8000 },
      { text: "Bring your attention to the top of your head.", duration: 5000 },
      { text: "Feel any tension there and let it melt away.", duration: 6000 },
      { text: "Move your awareness to your forehead and face.", duration: 5000 },
      { text: "Relax your jaw, letting it drop slightly.", duration: 5000 },
      { text: "Feel the relaxation flowing down your neck.", duration: 5000 },
      { text: "Let your shoulders drop away from your ears.", duration: 6000 },
      { text: "Your arms feel heavy and relaxed.", duration: 5000 },
      { text: "Feel the warmth spreading through your chest.", duration: 5000 },
      { text: "Your stomach rises and falls naturally.", duration: 5000 },
      { text: "Your lower back releases all tension.", duration: 5000 },
      { text: "Your legs feel heavy and supported.", duration: 5000 },
      { text: "Your entire body is completely relaxed.", duration: 6000 },
      { text: "Rest in this peaceful state for a moment.", duration: 8000 },
      { text: "Slowly wiggle your fingers and toes.", duration: 5000 },
      { text: "When ready, gently open your eyes.", duration: 5000 },
    ],
  },
  {
    id: "anxiety-relief",
    name: "Anxiety Relief",
    duration: "6 min",
    icon: Heart,
    color: "#f472b6",
    description: "Grounding meditation for anxious moments",
    steps: [
      { text: "You are safe in this moment. Take a slow breath.", duration: 6000 },
      { text: "Place your feet firmly on the ground.", duration: 5000 },
      { text: "Notice five things you can see around you.", duration: 8000 },
      { text: "Now notice four things you can feel touching you.", duration: 8000 },
      { text: "Listen for three sounds in your environment.", duration: 8000 },
      { text: "Identify two things you can smell.", duration: 6000 },
      { text: "Think of one thing you can taste.", duration: 5000 },
      { text: "You are grounded in the present moment.", duration: 5000 },
      { text: "Breathe in calm. Breathe out anxiety.", duration: 6000 },
      { text: "Your worries do not define you.", duration: 5000 },
      { text: "You have the strength to handle whatever comes.", duration: 6000 },
      { text: "Continue breathing slowly and steadily.", duration: 6000 },
      { text: "Notice how much calmer you feel now.", duration: 5000 },
    ],
  },
];

// Sleep stories
const SLEEP_STORIES = [
  {
    id: "peaceful-forest",
    name: "The Peaceful Forest",
    duration: "10 min",
    icon: TreePine,
    color: "#4ade80",
    description: "A gentle walk through a magical forest",
    story: [
      { text: "Close your eyes and imagine yourself at the edge of a beautiful forest.", duration: 8000 },
      { text: "The air is cool and fresh, carrying the scent of pine and earth.", duration: 7000 },
      { text: "Soft sunlight filters through the leaves above, creating patterns of light.", duration: 7000 },
      { text: "You step onto a winding path covered with soft moss.", duration: 6000 },
      { text: "Each step feels cushioned and gentle beneath your feet.", duration: 6000 },
      { text: "Birds sing sweetly in the distance, their melodies peaceful.", duration: 7000 },
      { text: "A gentle breeze rustles the leaves, creating a soft whisper.", duration: 7000 },
      { text: "You notice colorful wildflowers blooming along the path.", duration: 6000 },
      { text: "A small stream appears, its water crystal clear and cool.", duration: 7000 },
      { text: "The sound of flowing water is deeply soothing.", duration: 6000 },
      { text: "You find a comfortable spot by the stream to rest.", duration: 6000 },
      { text: "The forest embraces you with warmth and safety.", duration: 7000 },
      { text: "Your eyelids grow heavy as peace washes over you.", duration: 7000 },
      { text: "Let the sounds of nature carry you into gentle sleep.", duration: 8000 },
      { text: "You are safe. You are calm. You are at peace.", duration: 8000 },
    ],
  },
  {
    id: "ocean-journey",
    name: "Ocean at Twilight",
    duration: "12 min",
    icon: Waves,
    color: "#60a5fa",
    description: "Drift away with gentle ocean waves",
    story: [
      { text: "Imagine yourself on a quiet beach at twilight.", duration: 7000 },
      { text: "The sky is painted in soft pinks and purples.", duration: 6000 },
      { text: "Gentle waves lap at the shore in a steady rhythm.", duration: 7000 },
      { text: "The sand beneath you is warm and soft.", duration: 6000 },
      { text: "You feel completely supported and comfortable.", duration: 6000 },
      { text: "A gentle breeze carries the salt air across your skin.", duration: 7000 },
      { text: "Stars begin to twinkle in the darkening sky.", duration: 6000 },
      { text: "The waves continue their eternal dance with the shore.", duration: 7000 },
      { text: "Each wave brings relaxation, each retreat takes tension away.", duration: 8000 },
      { text: "The moon rises slowly, casting silver light on the water.", duration: 7000 },
      { text: "You are one with this peaceful moment.", duration: 6000 },
      { text: "Let the rhythm of the ocean rock you to sleep.", duration: 7000 },
      { text: "Deeper and deeper into relaxation you drift.", duration: 7000 },
      { text: "The universe holds you gently in its embrace.", duration: 7000 },
      { text: "Sleep comes easily, naturally, peacefully.", duration: 8000 },
    ],
  },
];

// Audio Player Component
function AmbientSoundCard({ 
  sound, 
  isPlaying, 
  onToggle 
}: { 
  sound: typeof AMBIENT_SOUNDS[0]; 
  isPlaying: boolean;
  onToggle: () => void;
}) {
  const Icon = sound.icon;
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onToggle}
      className={cn(
        "cursor-pointer p-4 rounded-2xl border transition-all duration-300",
        isPlaying 
          ? "bg-white/10 border-white/20 shadow-lg" 
          : "bg-white/5 border-white/10 hover:bg-white/8"
      )}
    >
      <div className="flex items-center gap-3">
        <div 
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
            isPlaying ? "animate-pulse" : ""
          )}
          style={{ backgroundColor: `${sound.color}20` }}
        >
          <Icon className="w-6 h-6" style={{ color: sound.color }} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-white">{sound.name}</p>
          <p className="text-xs text-muted-foreground">{sound.description}</p>
        </div>
        <div 
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center transition-all",
            isPlaying ? "bg-primary" : "bg-white/10"
          )}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 text-white" />
          ) : (
            <Play className="w-4 h-4 text-white ml-0.5" />
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Guided Session Card
function SessionCard({
  session,
  type,
  onStart,
  isActive,
}: {
  session: typeof GUIDED_MEDITATIONS[0] | typeof SLEEP_STORIES[0];
  type: "meditation" | "story";
  onStart: () => void;
  isActive: boolean;
}) {
  const Icon = session.icon;
  
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={cn(
        "p-5 rounded-2xl border transition-all",
        isActive 
          ? "bg-white/10 border-white/20" 
          : "bg-white/5 border-white/10"
      )}
    >
      <div className="flex items-start gap-4">
        <div 
          className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${session.color}20` }}
        >
          <Icon className="w-7 h-7" style={{ color: session.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-medium text-white">{session.name}</h4>
          <p className="text-sm text-muted-foreground mt-0.5">{session.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <Timer className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{session.duration}</span>
          </div>
        </div>
        <Button
          size="sm"
          variant={isActive ? "secondary" : "default"}
          onClick={onStart}
          className="rounded-full"
        >
          {isActive ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
          {isActive ? "Stop" : "Start"}
        </Button>
      </div>
    </motion.div>
  );
}

export default function AudioSessions() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  
  // Ambient sounds state
  const [playingSounds, setPlayingSounds] = useState<Set<string>>(new Set());
  const [masterVolume, setMasterVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  
  // Guided session state
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [sessionStepIndex, setSessionStepIndex] = useState(0);
  const [isSessionPlaying, setIsSessionPlaying] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<"ambient" | "meditation" | "stories">("ambient");

  // Update volume when changed
  useEffect(() => {
    const vol = isMuted ? 0 : masterVolume / 100;
    soundGenerator.setVolume(vol);
  }, [masterVolume, isMuted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      soundGenerator.stopAll();
    };
  }, []);

  // Stop audio when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is hidden - stop all audio
        soundGenerator.stopAll();
        setPlayingSounds(new Set());
        window.speechSynthesis.cancel();
        setIsSessionPlaying(false);
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const toggleSound = (soundId: string) => {
    const sound = AMBIENT_SOUNDS.find(s => s.id === soundId);
    if (!sound) return;

    if (playingSounds.has(soundId)) {
      soundGenerator.stop(sound.type);
      setPlayingSounds(prev => {
        const next = new Set(prev);
        next.delete(soundId);
        return next;
      });
    } else {
      soundGenerator.play(sound.type);
      setPlayingSounds(prev => new Set(prev).add(soundId));
      toast({
        title: `Playing ${sound.name}`,
        description: "Click to toggle off",
      });
    }
  };

  const stopAllSounds = () => {
    soundGenerator.stopAll();
    setPlayingSounds(new Set());
  };

  // Start guided session
  const startSession = (sessionId: string, type: "meditation" | "story") => {
    // Stop any playing session
    stopSession();
    
    const sessions = type === "meditation" ? GUIDED_MEDITATIONS : SLEEP_STORIES;
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    const steps = "steps" in session ? session.steps : session.story;
    
    setActiveSession(sessionId);
    setSessionStepIndex(0);
    setIsSessionPlaying(true);
    
    // Start reading the first step
    speakStep(steps[0].text, steps[0].duration, () => {
      advanceStep(sessionId, type, 1);
    });
  };

  const speakStep = (text: string, duration: number, onComplete: () => void) => {
    // Cancel any previous speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    utterance.pitch = 0.95;
    utterance.volume = isMuted ? 0 : masterVolume / 100;
    
    // Find a good voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      v.name.includes("Samantha") || 
      v.name.includes("Google UK English Female") ||
      v.name.includes("Microsoft Zira") ||
      v.lang === "en-US"
    );
    if (preferredVoice) utterance.voice = preferredVoice;
    
    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    
    // Wait for the specified duration before moving to next step
    timerRef.current = setTimeout(onComplete, duration);
  };

  const advanceStep = (sessionId: string, type: "meditation" | "story", nextIndex: number) => {
    const sessions = type === "meditation" ? GUIDED_MEDITATIONS : SLEEP_STORIES;
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    const steps = "steps" in session ? session.steps : session.story;
    
    if (nextIndex >= steps.length) {
      // Session complete
      stopSession();
      return;
    }

    setSessionStepIndex(nextIndex);
    speakStep(steps[nextIndex].text, steps[nextIndex].duration, () => {
      advanceStep(sessionId, type, nextIndex + 1);
    });
  };

  const stopSession = () => {
    window.speechSynthesis.cancel();
    if (timerRef.current) clearTimeout(timerRef.current);
    setActiveSession(null);
    setSessionStepIndex(0);
    setIsSessionPlaying(false);
  };

  // Get current step text for display
  const getCurrentStepText = () => {
    if (!activeSession) return "";
    
    const meditation = GUIDED_MEDITATIONS.find(m => m.id === activeSession);
    if (meditation) return meditation.steps[sessionStepIndex]?.text || "";
    
    const story = SLEEP_STORIES.find(s => s.id === activeSession);
    if (story) return story.story[sessionStepIndex]?.text || "";
    
    return "";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  if (!user) return <Redirect to="/" />;

  return (
    <div className="min-h-full bg-background bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-semibold mb-2 text-white leading-tight">
            Audio{" "}
            <span className="text-[#c9a6ff]" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontWeight: 400 }}>
              Sessions
            </span>
          </h1>
          <p className="text-[#a0a0b4] text-lg">
            Guided meditations, ambient sounds, and sleep stories for relaxation.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8">
          {[
            { id: "ambient", label: "Ambient Sounds", icon: Music },
            { id: "meditation", label: "Meditations", icon: Headphones },
            { id: "stories", label: "Sleep Stories", icon: BookOpen },
          ].map(tab => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              onClick={() => setActiveTab(tab.id as any)}
              className="rounded-full"
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Active Session Banner */}
        <AnimatePresence>
          {activeSession && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <GlassCard className="bg-primary/10 border-primary/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Headphones className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-primary font-medium">Now Playing</p>
                      <p className="text-white font-medium">{getCurrentStepText()}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={stopSession} className="text-white">
                    <Pause className="w-4 h-4 mr-2" />
                    Stop
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content based on active tab */}
        {activeTab === "ambient" && (
          <>
            {/* Volume Control */}
            <GlassCard className="mb-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMuted(!isMuted)}
                  className="shrink-0"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
                <Slider
                  value={[masterVolume]}
                  onValueChange={([v]) => setMasterVolume(v)}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground w-10 text-right">{masterVolume}%</span>
                {playingSounds.size > 0 && (
                  <Button variant="outline" size="sm" onClick={stopAllSounds} className="ml-2">
                    Stop All
                  </Button>
                )}
              </div>
            </GlassCard>

            {/* Ambient Sounds Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {AMBIENT_SOUNDS.map(sound => (
                <AmbientSoundCard
                  key={sound.id}
                  sound={sound}
                  isPlaying={playingSounds.has(sound.id)}
                  onToggle={() => toggleSound(sound.id)}
                />
              ))}
            </div>

            <p className="text-xs text-muted-foreground text-center mt-6">
              Mix multiple sounds together for your perfect ambience
            </p>
          </>
        )}

        {activeTab === "meditation" && (
          <div className="space-y-4">
            {GUIDED_MEDITATIONS.map(meditation => (
              <SessionCard
                key={meditation.id}
                session={meditation}
                type="meditation"
                onStart={() => 
                  activeSession === meditation.id 
                    ? stopSession() 
                    : startSession(meditation.id, "meditation")
                }
                isActive={activeSession === meditation.id}
              />
            ))}
          </div>
        )}

        {activeTab === "stories" && (
          <div className="space-y-4">
            {SLEEP_STORIES.map(story => (
              <SessionCard
                key={story.id}
                session={story}
                type="story"
                onStart={() => 
                  activeSession === story.id 
                    ? stopSession() 
                    : startSession(story.id, "story")
                }
                isActive={activeSession === story.id}
              />
            ))}

            <GlassCard className="mt-8 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
              <div className="flex items-center gap-4">
                <Moon className="w-8 h-8 text-indigo-400" />
                <div>
                  <h4 className="text-white font-medium">Sleep Tip</h4>
                  <p className="text-sm text-muted-foreground">
                    For best results, combine a sleep story with ambient rain or ocean sounds at low volume.
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        )}
      </main>
    </div>
  );
}
