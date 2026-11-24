import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wind, 
  Play, 
  Pause, 
  RotateCcw, 
  Heart, 
  Brain, 
  Sparkles, 
  Eye, 
  Droplets,
  Activity,
  Lightbulb,
  Loader2,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Task, StressEntry } from '../types';
import { GoogleGenAI } from "@google/genai";

interface WellnessBreaksProps {
  tasks: Task[];
  stressHistory: StressEntry[];
}

export default function WellnessBreaks({ tasks, stressHistory }: WellnessBreaksProps) {
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [aiTip, setAiTip] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
        
        if (activeExercise === 'breathing') {
          const cycle = timeLeft % 12;
          if (cycle > 8) setPhase('inhale');
          else if (cycle > 4) setPhase('hold');
          else setPhase('exhale');
        }
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setActiveExercise(null);
    }
    return () => clearInterval(timer);
  }, [isActive, timeLeft, activeExercise]);

  const startExercise = (id: string, duration: number) => {
    setActiveExercise(id);
    setTimeLeft(duration);
    setIsActive(true);
    setPhase('inhale');
  };

  const getAiRecommendation = async () => {
    setLoadingAi(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const latestStress = stressHistory[stressHistory.length - 1];
      const pendingTasks = tasks.filter(t => !t.completed);
      
      const prompt = `
        You are a student wellness coach. 
        Current Stress Level: ${latestStress?.level || 'Unknown'}/5.
        Pending Tasks: ${pendingTasks.map(t => t.title).join(', ') || 'None'}.
        
        Provide a 1-sentence, extremely practical wellness tip for a short break. 
        Focus on physical or mental quick-wins. Be supportive but concise.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setAiTip(response.text || "Take a deep breath and look at something green nearby.");
    } catch (error) {
      console.error(error);
      setAiTip("Stretch your arms above your head and hold for 10 seconds.");
    } finally {
      setLoadingAi(false);
    }
  };

  const exercises = [
    { 
      id: 'breathing', 
      title: 'Box Breathing', 
      desc: '4s Inhale • 4s Hold • 4s Exhale', 
      duration: 120, 
      icon: Wind,
      color: 'bg-blue-500',
      action: 'Breathe with the circle'
    },
    { 
      id: 'eye-rest', 
      title: '20-20-20 Rule', 
      desc: 'Look 20ft away for 20s Every 20m', 
      duration: 20, 
      icon: Eye,
      color: 'bg-indigo-500',
      action: 'Look away from screen'
    },
    { 
      id: 'stretch', 
      title: 'Desk Yoga', 
      desc: 'Quick neck and shoulder release', 
      duration: 180, 
      icon: Activity,
      color: 'bg-rose-500',
      action: 'Follow the movements'
    },
    { 
      id: 'hydration', 
      title: 'Micro Hydration', 
      desc: 'Drink water and stand up', 
      duration: 30, 
      icon: Droplets,
      color: 'bg-cyan-500',
      action: 'Refill your glass'
    }
  ];

  const currentEx = exercises.find(e => e.id === activeExercise);

  if (activeExercise) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-250px)] px-4">
        <div className="text-center space-y-2 mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={cn("w-16 h-16 rounded-3xl mx-auto flex items-center justify-center text-white shadow-lg mb-4", currentEx?.color)}
          >
            {currentEx && <currentEx.icon className="w-8 h-8" />}
          </motion.div>
          <h2 className="text-2xl font-display font-bold text-slate-800">
            {currentEx?.title}
          </h2>
          <p className="text-slate-500 font-medium">
            {activeExercise === 'breathing' ? phase.toUpperCase() : currentEx?.action}
          </p>
        </div>

        <div className="relative w-72 h-72 flex items-center justify-center">
          {/* Progress Ring */}
          <svg className="absolute w-full h-full -rotate-90">
            <circle
              cx="144"
              cy="144"
              r="130"
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="8"
            />
            <motion.circle
              cx="144"
              cy="144"
              r="130"
              fill="none"
              stroke={currentEx?.color.replace('bg-', '') === 'blue-500' ? '#3b82f6' : '#10b981'}
              strokeWidth="8"
              strokeDasharray={2 * Math.PI * 130}
              initial={{ strokeDashoffset: 2 * Math.PI * 130 }}
              animate={{ strokeDashoffset: (2 * Math.PI * 130) * (1 - timeLeft / (currentEx?.duration || 1)) }}
              transition={{ duration: 1, ease: "linear" }}
              strokeLinecap="round"
            />
          </svg>

          <AnimatePresence mode="wait">
            {activeExercise === 'breathing' ? (
              <motion.div
                key={phase}
                initial={{ scale: phase === 'inhale' ? 0.6 : 1.1, opacity: 0.3 }}
                animate={{ scale: phase === 'inhale' ? 1.1 : phase === 'hold' ? 1.1 : 0.6, opacity: 1 }}
                transition={{ duration: 4, ease: "easeInOut" }}
                className={cn(
                  "w-48 h-48 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-2xl",
                  phase === 'inhale' ? "bg-blue-400" : phase === 'hold' ? "bg-blue-600" : "bg-blue-300"
                )}
              >
                {timeLeft > 0 ? timeLeft : "✓"}
              </motion.div>
            ) : (
              <div className="text-center">
                <span className="text-5xl font-display font-bold text-slate-700">
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}
          </AnimatePresence>
        </div>

        <button 
          onClick={() => { setIsActive(false); setActiveExercise(null); }}
          className="mt-16 px-10 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors flex items-center gap-2"
        >
          <X className="w-5 h-5" />
          End Session
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-4">
        <h2 className="text-xl font-display font-bold text-slate-800 tracking-tight">Wellness Sanctuary</h2>
        <p className="text-slate-500 text-sm">Science-backed breaks for your busy day</p>
      </div>

      {/* AI Coach Button */}
      <div className="relative group overflow-hidden bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-500 rounded-2xl shadow-lg shadow-brand-200">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">AI Wellness Guide</h3>
              <p className="text-xs text-slate-500">Ask Gemini for a tailor-made break</p>
            </div>
          </div>

          {aiTip ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-brand-50 p-4 rounded-2xl border border-brand-100 flex gap-3 italic text-sm text-brand-800"
            >
              <Lightbulb className="w-5 h-5 text-brand-500 shrink-0" />
              "{aiTip}"
            </motion.div>
          ) : (
            <button
              onClick={getAiRecommendation}
              disabled={loadingAi}
              className="w-full py-3 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50"
            >
              {loadingAi ? <Loader2 className="w-5 h-5 animate-spin" /> : <Brain className="w-5 h-5" />}
              {loadingAi ? "Analyzing stress..." : "Get Personalized Tip"}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {exercises.map((ex) => (
          <motion.div
            key={ex.id}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => startExercise(ex.id, ex.duration)}
            className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-4 cursor-pointer hover:border-brand-200 hover:shadow-md transition-all h-full"
          >
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md self-start", ex.color)}>
              <ex.icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm leading-tight mb-1">{ex.title}</h3>
              <p className="text-[10px] text-slate-500 font-medium line-clamp-2">{ex.desc}</p>
            </div>
            <div className="mt-auto pt-2 flex items-center justify-between">
              <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">{ex.duration}s</span>
              <Play className="w-4 h-4 text-brand-500 fill-current" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-5 bg-slate-50 rounded-3xl border border-slate-200 border-dashed text-center">
        <p className="text-[11px] text-slate-400 font-medium italic">
          "The greatest mistake you can make in life is to be continually fearing you will make one." — Elbert Hubbard
        </p>
      </div>
    </div>
  );
}
