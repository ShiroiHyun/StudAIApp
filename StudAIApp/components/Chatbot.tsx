import React, { useState, useRef, useEffect } from 'react';
import { ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { sendMessageToGemini } from '../services/geminiService';
import { ChatMessage } from '../types';

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hola. Soy StudAI Bot. ¿En qué te ayudo?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const responseText = await sendMessageToGemini(history, userMsg);

    setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    setIsLoading(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-4 z-40 p-4 bg-indigo-600 text-white rounded-full shadow-xl hover:bg-indigo-700 transition-transform transform active:scale-95 flex items-center justify-center"
          aria-label="Abrir asistente IA"
          style={{ width: '60px', height: '60px' }}
        >
          <ChatBubbleLeftRightIcon className="w-8 h-8" />
        </button>
      )}

      {/* Chat Window - Full Screen on Mobile */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col animate-fadeIn sm:rounded-2xl sm:inset-auto sm:right-4 sm:bottom-24 sm:w-96 sm:h-[600px] sm:shadow-2xl sm:border sm:border-slate-200">
          
          {/* Header */}
          <div className="bg-indigo-600 p-4 pt-safe-top flex justify-between items-center text-white shrink-0 shadow-sm">
            <h3 className="font-semibold flex items-center gap-2 text-lg">
              <ChatBubbleLeftRightIcon className="w-6 h-6" />
              Asistente StudAI
            </h3>
            <button onClick={() => setIsOpen(false)} className="bg-white/20 rounded-full p-1 hover:bg-white/30">
              <ChevronDownIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-base ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-200 text-slate-500 text-xs p-3 rounded-xl animate-pulse">
                  Pensando...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex gap-2 pb-safe-bottom">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Mensaje..."
              className="flex-1 px-4 py-3 bg-slate-100 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
              autoFocus
            />
            <button
              type="submit"
              disabled={isLoading}
              className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50"
            >
              <PaperAirplaneIcon className="w-6 h-6" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;