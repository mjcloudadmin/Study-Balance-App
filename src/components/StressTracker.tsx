import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smile, Meh, Frown, Brain, MessageSquare, ChevronRight, History } from 'lucide-react';
import { StressEntry } from '../types';
import { cn } from '../lib/utils';

interface StressTrackerProps {
  stressHistory: StressEntry[];
  setStressHistory: React.Dispatch<React.SetStateAction<StressEntry[]>>;
  onNavigate: (tab: string) => void;
}

export default function StressTracker({ stressHistory, setStressHistory, onNavigate }: StressTrackerProps) {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const levels = [
    { value: 1, label: 'Zen', icon: Smile, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-100' },
    { value: 2, label: 'Steady', icon: Smile, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { value: 3, label: 'Busy', icon: Meh, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
    { value: 4, label: 'Strained', icon: Frown, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
    { value: 5, label: 'Burnout?', icon: Frown, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' },
  ];

  const handleSubmit = () => {
    if (selectedLevel === null) return;

    const newEntry: StressEntry = {
      id: Date.now().toString(),
      level: selectedLevel,
      timestamp: new Date().toISOString(),
      note: note.trim() || undefined
    };

    setStressHistory(prev => [...prev, newEntry]);
    setSubmitted(true);
  };

  const currentLevel = levels.find(l => l.value === selectedLevel);

  const getRecommendation = (level: number) => {
    if (level <= 2) return {
      tip: "You're in the 'Flow Zone'. Perfect for deep work and complex problem solving.",
      action: "Start Focus Session"
    };
    if (level === 3) return {
      tip: "Mental fatigue is creeping in. A 20-20-20 eye rest will sharpen your focus.",
      action: "Take a Break"
    };
    return {
      tip: "High stress detected. Your brain needs an immediate reset with box breathing.",
      action: "Deep Breathing"
    };
  };

  const recommendation = selectedLevel ? getRecommendation(selectedLevel) : null;

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-display font-bold text-slate-800 tracking-tight">Emotional Pulse</h2>
        <p className="text-slate-500 text-sm">Honest check-ins lead to better balance</p>
      </div>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div 
            key="success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={cn(
              "p-8 rounded-[2rem] border-2 border-dashed text-center space-y-6 shadow-xl shadow-brand-100/20",
              currentLevel?.bg,
              currentLevel?.border
            )}
          >
            <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-lg", currentLevel?.bg.replace('bg-', 'bg-white/40 '))}>
              {currentLevel && <currentLevel.icon className={cn("w-10 h-10", currentLevel.color)} />}
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-800">Pulse Captured</h3>
              <p className="text-slate-600 text-sm leading-relaxed max-w-[240px] mx-auto">
                {recommendation?.tip}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button 
                onClick={() => onNavigate(recommendation?.action === 'Start Focus Session' ? 'timer' : 'wellness')}
                className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                {recommendation?.action}
                <ChevronRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => { setSubmitted(false); setSelectedLevel(null); setNote(''); }}
                className="text-slate-400 text-xs font-bold py-2 hover:text-slate-600 transition-colors uppercase tracking-widest"
              >
                Back to Pulse
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-5 gap-2 px-1">
              {levels.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setSelectedLevel(level.value)}
                  className={cn(
                    "flex flex-col items-center gap-3 p-3 rounded-2xl transition-all relative overflow-hidden",
                    selectedLevel === level.value 
                      ? cn(level.bg, "ring-2 ring-brand-500 scale-110 shadow-lg z-10") 
                      : "bg-white hover:bg-slate-50 border border-slate-100"
                  )}
                >
                  <level.icon className={cn("w-6 h-6 transition-colors", selectedLevel === level.value ? level.color : "text-slate-300")} />
                  <span className={cn("text-[9px] font-bold uppercase tracking-tighter", selectedLevel === level.value ? "text-slate-700" : "text-slate-400")}>
                    {level.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 ml-2">
                <MessageSquare className="w-4 h-4 text-slate-400" />
                <label className="text-xs font-bold text-slate-500">Context (What's on your mind?)</label>
              </div>
              <textarea 
                placeholder="Ex. 'Midterm prep is overwhelming' or 'Feeling energetic today!'"
                className="w-full bg-white border border-slate-100 rounded-[1.5rem] p-5 text-sm focus:ring-2 focus:ring-brand-500 shadow-sm min-h-[120px] transition-all"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <button 
              onClick={handleSubmit}
              disabled={selectedLevel === null}
              className="w-full bg-brand-500 text-white font-bold py-5 rounded-2xl shadow-xl shadow-brand-100 hover:bg-brand-600 disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <History className="w-5 h-5 opacity-50" />
              Log Pulse Entry
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Preview */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-display font-bold text-slate-800 flex items-center gap-2">
            <History className="w-4 h-4 text-slate-400" />
            Recent History
          </h3>
        </div>

        <div className="space-y-3">
          {stressHistory.slice(-3).reverse().map((entry) => (
            <div key={entry.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                entry.level <= 2 ? "bg-green-50 text-green-500" : entry.level === 3 ? "bg-amber-50 text-amber-500" : "bg-red-50 text-red-500"
              )}>
                {entry.level <= 2 ? <Smile className="w-5 h-5" /> : entry.level === 3 ? <Meh className="w-5 h-5" /> : <Frown className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="text-xs font-bold text-slate-700">Level {entry.level}/5</span>
                  <span className="text-[10px] text-slate-400">{new Date(entry.timestamp).toLocaleDateString()}</span>
                </div>
                {entry.note && <p className="text-[10px] text-slate-500 mt-1 line-clamp-1 italic">"{entry.note}"</p>}
              </div>
            </div>
          ))}
          {stressHistory.length === 0 && (
            <p className="text-center text-xs text-slate-400 py-4">No history yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
