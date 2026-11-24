import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Coffee, Brain, Trophy } from 'lucide-react';
import { cn } from '../lib/utils';

interface FocusTimerProps {
  onSessionComplete: () => void;
}

export default function FocusTimer({ onSessionComplete }: FocusTimerProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [sessions, setSessions] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleModeSwitch();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const handleModeSwitch = () => {
    if (mode === 'focus') {
      setMode('break');
      setTimeLeft(5 * 60);
      setSessions(prev => prev + 1);
      onSessionComplete();
    } else {
      setMode('focus');
      setTimeLeft(25 * 60);
    }
    setIsActive(false);
  };

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = mode === 'focus' ? (1 - timeLeft / (25 * 60)) * 100 : (1 - timeLeft / (5 * 60)) * 100;

  return (
    <div className="flex flex-col items-center justify-center space-y-10 py-10">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-display font-bold text-slate-800">
          {mode === 'focus' ? 'Focus Time' : 'Short Break'}
        </h2>
        <p className="text-slate-500 text-sm font-medium">
          {mode === 'focus' ? 'Stay focused for 25 minutes' : 'Take a deep breath and relax'}
        </p>
      </div>

      {/* Timer Circle */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Background Circle */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="128"
            cy="128"
            r="120"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-slate-100"
          />
          <motion.circle
            cx="128"
            cy="128"
            r="120"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray="754"
            initial={{ strokeDashoffset: 754 }}
            animate={{ strokeDashoffset: 754 - (754 * progress) / 100 }}
            transition={{ duration: 0.5, ease: "linear" }}
            className={cn(
              "transition-colors duration-500",
              mode === 'focus' ? "text-brand-500" : "text-blue-500"
            )}
          />
        </svg>

        <div className="text-center z-10">
          <span className="text-6xl font-display font-bold text-slate-800 tabular-nums">
            {formatTime(timeLeft)}
          </span>
          <div className="flex items-center justify-center gap-2 mt-2 text-slate-400">
            {mode === 'focus' ? <Brain className="w-4 h-4" /> : <Coffee className="w-4 h-4" />}
            <span className="text-xs font-bold uppercase tracking-widest">{mode}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-8">
        <button 
          onClick={resetTimer}
          className="p-4 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
        >
          <RotateCcw className="w-6 h-6" />
        </button>

        <button 
          onClick={toggleTimer}
          className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-90",
            isActive 
              ? "bg-slate-800 text-white" 
              : mode === 'focus' ? "bg-brand-500 text-white" : "bg-blue-500 text-white"
          )}
        >
          {isActive ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
        </button>

        <div className="p-4 rounded-full bg-slate-100 text-slate-500">
          <Trophy className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 bg-brand-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
            {sessions}
          </span>
        </div>
      </div>

      {/* Session Progress */}
      <div className="flex gap-2">
        {[1, 2, 3, 4].map(i => (
          <div 
            key={i} 
            className={cn(
              "w-3 h-3 rounded-full transition-colors",
              i <= sessions ? "bg-brand-500" : "bg-slate-200"
            )}
          />
        ))}
      </div>
    </div>
  );
}
