import React from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Brain, 
  Timer, 
  ChevronRight, 
  AlertCircle,
  Smile,
  Meh,
  Frown,
  Trophy,
  Flame
} from 'lucide-react';
import { Task, StressEntry, UserStats } from '../types';
import { cn } from '../lib/utils';

interface DashboardProps {
  tasks: Task[];
  stressHistory: StressEntry[];
  stats: UserStats;
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ tasks, stressHistory, stats, onNavigate }: DashboardProps) {
  const latestStress = stressHistory[stressHistory.length - 1];
  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);
  
  const progress = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Welcome & Stats */}
      <section className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-orange-50 rounded-xl">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Streak</span>
          </div>
          <div>
            <span className="text-3xl font-display font-bold text-slate-800">{stats.streak}</span>
            <span className="text-sm text-slate-500 ml-1">days</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-blue-50 rounded-xl">
              <Timer className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Focus</span>
          </div>
          <div>
            <span className="text-3xl font-display font-bold text-slate-800">{stats.focusMinutes}</span>
            <span className="text-sm text-slate-500 ml-1">mins</span>
          </div>
        </div>
      </section>

      {/* Stress Check-in Card */}
      <section 
        onClick={() => onNavigate('stress')}
        className="bg-gradient-to-br from-brand-500 to-brand-600 p-5 rounded-3xl shadow-lg text-white cursor-pointer group"
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-display font-bold">How are you feeling?</h3>
            <p className="text-brand-100 text-sm">Track your stress to get study tips</p>
          </div>
          <div className="p-2 bg-white/20 rounded-2xl backdrop-blur-sm group-hover:scale-110 transition-transform">
            <Brain className="w-6 h-6" />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {latestStress ? (
            <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-sm">
              {latestStress.level <= 2 ? <Smile className="w-5 h-5" /> : latestStress.level === 3 ? <Meh className="w-5 h-5" /> : <Frown className="w-5 h-5" />}
              <span className="text-sm font-medium">Last check-in: {latestStress.level}/5</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm font-medium">
              <AlertCircle className="w-4 h-4" />
              <span>No check-in today</span>
            </div>
          )}
          <div className="ml-auto">
            <ChevronRight className="w-5 h-5 opacity-70" />
          </div>
        </div>
      </section>

      {/* Progress Card */}
      <section className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-display font-bold text-slate-800">Today's Progress</h3>
          <span className="text-brand-600 font-bold text-sm">{progress}%</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-brand-500 rounded-full"
          />
        </div>
        <div className="flex justify-between text-xs font-medium text-slate-500">
          <span>{completedTasks.length} tasks done</span>
          <span>{pendingTasks.length} remaining</span>
        </div>
      </section>

      {/* Tasks Preview */}
      <section className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-display font-bold text-slate-800">Upcoming Tasks</h3>
          <button 
            onClick={() => onNavigate('planner')}
            className="text-brand-600 text-xs font-bold hover:underline"
          >
            View All
          </button>
        </div>
        
        {pendingTasks.length > 0 ? (
          <div className="space-y-3">
            {pendingTasks.slice(0, 3).map(task => (
              <div key={task.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className={cn(
                  "w-2 h-10 rounded-full",
                  task.complexity === 'high' ? "bg-red-400" : task.complexity === 'medium' ? "bg-orange-400" : "bg-green-400"
                )} />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-800">{task.title}</h4>
                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Due: {new Date(task.deadline).toLocaleDateString()}</p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-slate-200" />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-100/50 border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center">
            <p className="text-sm text-slate-400 font-medium">No pending tasks. Relax!</p>
          </div>
        )}
      </section>

      {/* Quick Wellness Tip */}
      <section 
        onClick={() => onNavigate('wellness')}
        className="bg-blue-50 p-4 rounded-3xl border border-blue-100 flex items-center gap-4 cursor-pointer"
      >
        <div className="p-3 bg-white rounded-2xl shadow-sm">
          <Brain className="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-blue-900">Need a break?</h4>
          <p className="text-xs text-blue-700">Try a 2-minute breathing exercise</p>
        </div>
        <ChevronRight className="w-5 h-5 text-blue-400 ml-auto" />
      </section>
    </div>
  );
}
