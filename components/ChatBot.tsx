import React, { useState, useRef, useEffect } from 'react';
import { chatWithGemini } from '../services/geminiService';
import { MessageSquare, Send, Bot, Loader2, BrainCircuit } from 'lucide-react';
import { ChatMessage } from '../types';

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hi! I can help you compare products or find the best deals. Ask me anything!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useThinking, setUseThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Prepare history for API
    const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
    }));

    const response = await chatWithGemini(history, userMsg.text, useThinking);
    
    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setIsLoading(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all z-50"
      >
        <MessageSquare size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-[#0f172a] border border-white/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 backdrop-blur-xl">
      {/* Header */}
      <div className="p-4 bg-white/5 border-b border-white/10 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bot className="text-blue-400" size={20} />
          <h3 className="font-semibold text-white">Gemini Advisor</h3>
        </div>
        <div className="flex items-center gap-2">
            <button 
                onClick={() => setUseThinking(!useThinking)}
                className={`p-1.5 rounded-lg transition-colors ${useThinking ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400 hover:bg-white/5'}`}
                title="Toggle Thinking Mode"
            >
                <BrainCircuit size={18} />
            </button>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
            <span className="text-2xl leading-none">&times;</span>
            </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-white/10 text-gray-200 rounded-bl-none border border-white/5'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/10 p-3 rounded-2xl rounded-bl-none">
              <Loader2 className="animate-spin text-blue-400" size={20} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white/5 border-t border-white/10 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about products..."
          className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
        />
        <button
          onClick={handleSend}
          disabled={isLoading}
          className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl disabled:opacity-50 transition-colors"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatBot;