import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Hash, Users, MessageSquare } from 'lucide-react';
import { ChatMessage } from '../types';
import { cn } from '../lib/utils';

export default function PeerSupport() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [room, setRoom] = useState('general');
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${window.location.host}`);
    socketRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
      socket.send(JSON.stringify({ type: 'join', room }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'history') {
        setMessages(data.messages);
      } else if (data.type === 'chat') {
        setMessages(prev => [...prev, data.message]);
      }
    };

    socket.onclose = () => setIsConnected(false);

    return () => socket.close();
  }, [room]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !socketRef.current) return;

    socketRef.current.send(JSON.stringify({
      type: 'chat',
      text: inputText,
      user: 'Student ' + Math.floor(Math.random() * 1000)
    }));
    setInputText('');
  };

  const rooms = [
    { id: 'general', name: 'General Support', icon: Hash },
    { id: 'study-tips', name: 'Study Tips', icon: MessageSquare },
    { id: 'venting', name: 'Stress Venting', icon: Users },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
        {rooms.map(r => (
          <button
            key={r.id}
            onClick={() => {
              setRoom(r.id);
              setMessages([]);
            }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all",
              room === r.id ? "bg-brand-500 text-white shadow-md" : "bg-white text-slate-500 border border-slate-100"
            )}
          >
            <r.icon className="w-3.5 h-3.5" />
            {r.name}
          </button>
        ))}
      </div>

      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-50 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {rooms.find(r => r.id === room)?.name}
          </span>
          <div className="flex items-center gap-1.5">
            <div className={cn("w-2 h-2 rounded-full", isConnected ? "bg-green-500" : "bg-red-500")} />
            <span className="text-[10px] font-bold text-slate-400">{isConnected ? 'Live' : 'Offline'}</span>
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="p-4 bg-slate-50 rounded-full">
                <MessageSquare className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-sm text-slate-400 font-medium">No messages yet. Be the first to share some support!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                key={msg.id} 
                className="flex flex-col gap-1"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400">{msg.user}</span>
                  <span className="text-[8px] text-slate-300">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl rounded-tl-none border border-slate-100 max-w-[85%]">
                  <p className="text-sm text-slate-700 leading-relaxed">{msg.text}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <form onSubmit={sendMessage} className="p-4 bg-slate-50/50 border-t border-slate-100 flex gap-2">
          <input 
            type="text" 
            placeholder="Type your message..."
            className="flex-1 bg-white border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 shadow-sm"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button 
            type="submit"
            disabled={!inputText.trim()}
            className="bg-brand-500 text-white p-3 rounded-2xl shadow-md hover:bg-brand-600 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
