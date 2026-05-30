import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Compass, Sparkles, MapPin, Heart, ShieldQuestion } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Chatbot() {
  const { API_BASE_URL } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([
    {
      sender: 'ai',
      text: 'Namaste! 🌴 Welcome to Coastal Tourism Kerala\'s AI Companion. I can help you find stunning beaches, plan personalized itineraries, suggest delicious local seafood, or guide you through bookings. What is your dream coastal vacation?'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatLog, isTyping]);

  const sendMessage = async (textToSend) => {
    const text = textToSend || message;
    if (!text.trim()) return;

    // Add user message
    setChatLog(prev => [...prev, { sender: 'user', text }]);
    setMessage('');
    setIsTyping(true);

    try {
      const res = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: chatLog.map(item => ({
            role: item.sender === 'user' ? 'user' : 'model',
            text: item.text
          }))
        })
      });
      const data = await res.json();

      setIsTyping(false);
      if (res.ok && data.reply) {
        setChatLog(prev => [...prev, { sender: 'ai', text: data.reply }]);
      } else {
        setChatLog(prev => [...prev, { sender: 'ai', text: 'Oops! The ocean breezes are strong and my connections are slightly delayed. Let me rest and try again shortly!' }]);
      }
    } catch (err) {
      setIsTyping(false);
      setChatLog(prev => [...prev, { sender: 'ai', text: 'I seem to be offline. Please verify the server connection and try again!' }]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  // Quick preset questions
  const presets = [
    { label: 'Suggest Seafood 🐟', prompt: 'What are the best traditional seafood dishes to try along the Kerala coast and where?' },
    { label: '3-Day Plan 🗓️', prompt: 'Create a detailed 3-day itinerary covering Kerala beaches, houseboat stays, and historic sightseeing.' },
    { label: 'Romantic Beaches 🌅', prompt: 'Which Kerala beaches are best for a romantic couple getaway or honeymoon?' },
    { label: 'How to Book? 🏄‍♂️', prompt: 'How can I book local coastal activities like paragliding or surfing on this website?' }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Pulse button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-5 py-3.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 rounded-full shadow-[0_0_25px_rgba(20,184,166,0.55)] border border-teal-400/40 font-semibold text-white tracking-wide transition-all duration-300 scale-100 hover:scale-105 active:scale-95 cursor-pointer group"
        >
          <MessageSquare className="w-5 h-5 text-white animate-bounce group-hover:scale-110" />
          <span>Ask Coastal AI</span>
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[380px] h-[550px] max-w-[calc(100vw-32px)] glass-card border border-teal-400/30 rounded-2xl flex flex-col shadow-[0_12px_40px_rgba(3,21,37,0.85)] relative overflow-hidden backdrop-blur-xl animate-fade-in transition-all">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-ocean-dark to-ocean-medium border-b border-teal-500/20 px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-teal-500/20 border border-teal-400/40 flex items-center justify-center animate-pulse-glow">
                <Sparkles className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-sm tracking-wide">Coastal AI Concierge</h3>
                <span className="flex items-center gap-1 text-[10px] text-teal-400 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-ping"></span>
                  Online & Ready
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 rounded-full transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            {chatLog.map((chat, idx) => (
              <div
                key={idx}
                className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${chat.sender === 'user'
                      ? 'bg-teal-500 text-white rounded-br-none shadow-md'
                      : 'bg-ocean-medium/70 text-slate-200 border border-teal-500/10 rounded-bl-none shadow-sm font-light'
                    }`}
                  style={{ whiteSpace: 'pre-line' }}
                >
                  {chat.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-ocean-medium/70 border border-teal-500/10 rounded-2xl rounded-bl-none px-4 py-3 flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            <div ref={bottomRef}></div>
          </div>

          {/* Quick presets (If chat log is fresh or on user query) */}
          <div className="px-3 py-1 bg-ocean-dark/40 border-t border-teal-500/10">
            <div className="flex gap-2 overflow-x-auto py-2 no-scrollbar">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(preset.prompt)}
                  className="flex-shrink-0 text-[10px] font-medium bg-ocean-medium hover:bg-teal-900/40 border border-teal-500/20 hover:border-teal-400/40 text-slate-300 hover:text-white py-1.5 px-3 rounded-full transition-all cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message Input bar */}
          <div className="p-3 border-t border-teal-500/20 bg-ocean-medium/95 flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about seafood, hotels, itineraries..."
              className="flex-1 bg-slate-900/60 border border-teal-500/20 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-teal-400/70"
            />
            <button
              onClick={() => sendMessage()}
              className="p-2.5 bg-teal-500 hover:bg-teal-400 text-white rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
