import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  X, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  Download,
  BookOpen,
  Sparkles,
  Upload,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Task } from '../types';
import { cn } from '../lib/utils';
import { GoogleGenAI, Type } from "@google/genai";

interface TaskPlannerProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  onComplete: () => void;
}

const CTU_SCHEDULE = [
  // Introduction to Cloud Computing (ICC411)
  { title: "ICC411: Formative 1", deadline: "2026-03-02", complexity: "medium" },
  { title: "ICC411: Formative 2", deadline: "2026-03-05", complexity: "medium" },
  { title: "ICC411: Summative Assessment", deadline: "2026-03-12", complexity: "high" },
  { title: "ICC411: Practical-PM", deadline: "2026-03-16", complexity: "high" },
  
  // Industry 4.0 (FIR411)
  { title: "FIR411: Formative 1", deadline: "2026-03-23", complexity: "medium" },
  { title: "FIR411: Formative 2", deadline: "2026-04-02", complexity: "medium" },
  { title: "FIR411: Summative Assessment", deadline: "2026-04-16", complexity: "high" },
  { title: "FIR411: Practical-PM", deadline: "2026-04-20", complexity: "high" },
  
  // Cloud Fundamentals (CF411)
  { title: "CF411: Formative 1", deadline: "2026-05-05", complexity: "medium" },
  { title: "CF411: Formative 2", deadline: "2026-05-11", complexity: "medium" },
  { title: "CF411: Summative Assessment", deadline: "2026-05-21", complexity: "high" },
  { title: "CF411: Practical-PM", deadline: "2026-05-25", complexity: "high" },
];

export default function TaskPlanner({ tasks, setTasks, onComplete }: TaskPlannerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newComplexity, setNewComplexity] = useState<'low' | 'medium' | 'high'>('medium');
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateDailyGoals = (title: string, deadline: string, complexity: 'low' | 'medium' | 'high') => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffDays = Math.max(1, Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    
    const dailyGoalsCount = complexity === 'high' ? 5 : complexity === 'medium' ? 3 : 1;
    return Array.from({ length: Math.min(diffDays > 0 ? diffDays : 5, dailyGoalsCount) }, (_, i) => {
      return `Phase ${i + 1}: ${title} preparation`;
    });
  };

  const addTask = () => {
    if (!newTitle || !newDeadline) return;

    const newTask: Task = {
      id: Date.now().toString() + Math.random(),
      title: newTitle,
      deadline: newDeadline,
      complexity: newComplexity,
      completed: false,
      dailyGoals: generateDailyGoals(newTitle, newDeadline, newComplexity)
    };

    setTasks(prev => [newTask, ...prev]);
    setNewTitle('');
    setNewDeadline('');
    setIsAdding(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    setUploadError(null);

    try {
      const base64Data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.readAsDataURL(file);
      });

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            inlineData: {
              data: base64Data,
              mimeType: file.type
            }
          },
          {
            text: "Extract all assessments, assignments, or deadlines from this schedule. Return a JSON array of objects with 'title', 'deadline' (in YYYY-MM-DD format), and 'complexity' ('low', 'medium', or 'high' based on the assessment type)."
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                deadline: { type: Type.STRING },
                complexity: { type: Type.STRING, enum: ['low', 'medium', 'high'] }
              },
              required: ['title', 'deadline', 'complexity']
            }
          }
        }
      });

      const extractedTasks = JSON.parse(response.text);
      
      const newTasks: Task[] = extractedTasks.map((item: any, idx: number) => ({
        id: `extracted-${idx}-${Date.now()}`,
        title: item.title,
        deadline: item.deadline,
        complexity: item.complexity,
        completed: false,
        dailyGoals: generateDailyGoals(item.title, item.deadline, item.complexity)
      }));

      setTasks(prev => {
        const existingIds = new Set(prev.map(t => `${t.title}-${t.deadline}`));
        const uniqueNewTasks = newTasks.filter(t => !existingIds.has(`${t.title}-${t.deadline}`));
        return [...uniqueNewTasks, ...prev];
      });

    } catch (err) {
      console.error("Extraction error:", err);
      setUploadError("Failed to extract schedule. Please ensure the image is clear.");
    } finally {
      setIsExtracting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const importCtuSchedule = () => {
    const newTasks: Task[] = CTU_SCHEDULE.map((item, idx) => ({
      id: `ctu-${idx}-${Date.now()}`,
      title: item.title,
      deadline: item.deadline,
      complexity: item.complexity as any,
      completed: false,
      dailyGoals: generateDailyGoals(item.title, item.deadline, item.complexity as any)
    }));
    
    setTasks(prev => {
      // Filter out duplicates based on title and deadline
      const existingIds = new Set(prev.map(t => `${t.title}-${t.deadline}`));
      const uniqueNewTasks = newTasks.filter(t => !existingIds.has(`${t.title}-${t.deadline}`));
      return [...uniqueNewTasks, ...prev];
    });
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        if (!t.completed) onComplete();
        return { ...t, completed: !t.completed };
      }
      return t;
    }));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const hasImportedSchedule = tasks.some(t => t.title.includes('ICC411') || t.title.includes('FIR411') || t.title.includes('CF411'));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-display font-bold text-slate-800">Study Planner</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isExtracting}
            className="bg-white text-slate-600 p-2 rounded-xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors disabled:opacity-50"
            title="Upload Schedule"
          >
            {isExtracting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept="image/*"
          />
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-brand-500 text-white p-2 rounded-xl shadow-md hover:bg-brand-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {uploadError && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 text-red-600 p-3 rounded-2xl flex items-start gap-3 border border-red-100 text-xs font-medium"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {uploadError}
        </motion.div>
      )}

      {isExtracting && (
        <div className="bg-brand-50/50 p-6 rounded-3xl border-2 border-dashed border-brand-200 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          <p className="text-sm font-bold text-brand-800">Gemini is analyzing your schedule...</p>
          <p className="text-[10px] text-brand-600 text-center px-4">Extracting assignments, deadlines and smart goals</p>
        </div>
      )}

      {!hasImportedSchedule && !isExtracting && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-brand-50 border border-brand-100 p-5 rounded-3xl space-y-3"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm">
              <Download className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-brand-900">CTU Schedule Detected</h3>
              <p className="text-[10px] text-brand-700 font-medium">Auto-generate your assignment deadlines</p>
            </div>
          </div>
          <button 
            onClick={importCtuSchedule}
            className="w-full bg-white text-brand-600 border border-brand-200 font-bold py-2.5 rounded-2xl text-xs flex items-center justify-center gap-2 hover:bg-brand-100 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Import CTU Assessment Schedule
          </button>
        </motion.div>
      )}

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4 overflow-hidden"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-700">New Assignment</h3>
              <button onClick={() => setIsAdding(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            
            <input 
              type="text" 
              placeholder="Task Title (e.g. History Essay)" 
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-brand-500 text-sm"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Deadline</label>
                <input 
                  type="date" 
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-brand-500 text-sm"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Complexity</label>
                <select 
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-brand-500 text-sm appearance-none"
                  value={newComplexity}
                  onChange={(e) => setNewComplexity(e.target.value as any)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <button 
              onClick={addTask}
              className="w-full bg-brand-500 text-white font-bold py-3 rounded-2xl shadow-lg hover:bg-brand-600 transition-all active:scale-95"
            >
              Add to Planner
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4 pb-12">
        {tasks.length === 0 && !isExtracting ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
              <CalendarIcon className="w-10 h-10 text-slate-300" />
            </div>
            <p className="text-slate-400 font-medium">No tasks yet. Start planning!</p>
          </div>
        ) : (
          tasks
            .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
            .map(task => (
              <div 
                key={task.id} 
                className={cn(
                  "bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden transition-all",
                  task.completed ? "opacity-60" : ""
                )}
              >
                <div className="p-4 flex items-center gap-4">
                  <button 
                    onClick={() => toggleTask(task.id)}
                    className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                      task.completed ? "bg-brand-500 border-brand-500" : "border-slate-200"
                    )}
                  >
                    {task.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </button>
                  
                  <div className="flex-1" onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}>
                    <h4 className={cn("text-xs font-bold text-slate-800", task.completed ? "line-through opacity-50" : "")}>
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      {task.title.match(/ICC|FIR|CF/) && (
                        <span className="bg-brand-100 text-brand-700 text-[8px] px-1.5 py-0.5 rounded-md font-bold flex items-center gap-1">
                          <BookOpen className="w-2 h-2" /> CTU
                        </span>
                      )}
                      {task.id.startsWith('extracted') && (
                        <span className="bg-indigo-100 text-indigo-700 text-[8px] px-1.5 py-0.5 rounded-md font-bold flex items-center gap-1">
                          <Sparkles className="w-2 h-2" /> AI
                        </span>
                      )}
                      <span className={cn(
                        "text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase",
                        task.complexity === 'high' ? "bg-red-50 text-red-500" : task.complexity === 'medium' ? "bg-orange-50 text-orange-500" : "bg-green-50 text-green-500"
                      )}>
                        {task.complexity}
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium tracking-tight">
                        {new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                      className="p-1 text-slate-400"
                    >
                      {expandedTask === task.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    <button onClick={() => deleteTask(task.id)} className="p-1 text-slate-300 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedTask === task.id && (
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="bg-slate-50 px-4 pb-4 overflow-hidden"
                    >
                      <div className="pt-2 space-y-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Smart Daily Goals</p>
                        {task.dailyGoals.map((goal, i) => (
                          <div key={i} className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-100">
                            <div className="w-1.5 h-1.5 bg-brand-400 rounded-full" />
                            <span className="text-xs text-slate-600 font-medium">{goal}</span>
                          </div>
                        ))}
                        {task.dailyGoals.length === 0 && (
                          <p className="text-xs text-slate-400 italic">No milestone breakdown for this task.</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
        )}
      </div>
    </div>
  );
}


