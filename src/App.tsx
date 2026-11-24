import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Calendar, 
  Timer, 
  MessageSquare, 
  Wind, 
  Plus, 
  CheckCircle2, 
  AlertCircle,
  Trophy,
  Brain,
  Smile,
  Meh,
  Frown,
  ChevronRight,
  Bell
} from 'lucide-react';
import { cn } from './lib/utils';
import { Task, StressEntry, UserStats } from './types';

// Components
import Dashboard from './components/Dashboard';
import TaskPlanner from './components/TaskPlanner';
import FocusTimer from './components/FocusTimer';
import PeerSupport from './components/PeerSupport';
import WellnessBreaks from './components/WellnessBreaks';
import StressTracker from './components/StressTracker';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stressHistory, setStressHistory] = useState<StressEntry[]>([]);
  const [stats, setStats] = useState<UserStats>({
    points: 150,
    streak: 3,
    focusMinutes: 120
  });

  // Load data from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('sb_tasks');
    const savedStress = localStorage.getItem('sb_stress');
    const savedStats = localStorage.getItem('sb_stats');
    
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedStress) setStressHistory(JSON.parse(savedStress));
    if (savedStats) setStats(JSON.parse(savedStats));
  }, []);

  // Save data
  useEffect(() => {
    localStorage.setItem('sb_tasks', JSON.stringify(tasks));
    localStorage.setItem('sb_stress', JSON.stringify(stressHistory));
    localStorage.setItem('sb_stats', JSON.stringify(stats));
  }, [tasks, stressHistory, stats]);

  const addPoints = (amount: number) => {
    setStats(prev => ({ ...prev, points: prev.points + amount }));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard 
          tasks={tasks} 
          stressHistory={stressHistory} 
          stats={stats} 
          onNavigate={setActiveTab}
        />;
      case 'planner':
        return <TaskPlanner tasks={tasks} setTasks={setTasks} onComplete={() => addPoints(50)} />;
      case 'timer':
        return <FocusTimer onSessionComplete={() => addPoints(100)} />;
      case 'support':
        return <PeerSupport />;
      case 'wellness':
        return <WellnessBreaks tasks={tasks} stressHistory={stressHistory} />;
      case 'stress':
        return <StressTracker stressHistory={stressHistory} setStressHistory={setStressHistory} onNavigate={setActiveTab} />;
      default:
        return <Dashboard tasks={tasks} stressHistory={stressHistory} stats={stats} onNavigate={setActiveTab} />;
    }
  };

  const tabs = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
    { id: 'planner', icon: Calendar, label: 'Planner' },
    { id: 'timer', icon: Timer, label: 'Focus' },
    { id: 'support', icon: MessageSquare, label: 'Support' },
    { id: 'wellness', icon: Wind, label: 'Wellness' },
  ];

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-slate-50 overflow-hidden shadow-2xl relative">
      {/* Header */}
      <header className="px-6 pt-8 pb-4 flex justify-between items-center bg-white/50 backdrop-blur-sm z-10">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-800">StudyBalance</h1>
          <p className="text-xs text-slate-500 font-medium">Balance your mind & work</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-brand-100 px-3 py-1 rounded-full border border-brand-200">
            <Trophy className="w-3.5 h-3.5 text-brand-600" />
            <span className="text-xs font-bold text-brand-700">{stats.points}</span>
          </div>
          <button className="p-2 bg-white rounded-full shadow-sm border border-slate-100 relative">
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-6 pb-24 pt-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 backdrop-blur-lg border-t border-slate-100 px-4 py-3 flex justify-between items-center z-20">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300",
              activeTab === tab.id ? "text-brand-600 scale-110" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <tab.icon className={cn("w-6 h-6", activeTab === tab.id ? "fill-brand-50" : "")} />
            <span className="text-[10px] font-medium">{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeTab"
                className="w-1 h-1 bg-brand-600 rounded-full"
              />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
