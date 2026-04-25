import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, FileText, Search, Copy, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
}

interface ChatWindowProps {
  activeTab: 'chat' | 'knowledge';
  agentMode: 'agent' | 'direct';
}

interface Document {
  name: string;
  size: string;
  timestamp: string;
  status: 'Active' | 'Processing';
}


const ChatWindow: React.FC<ChatWindowProps> = ({ activeTab, agentMode }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your Agentic AI assistant. I can now accept any PDF document you upload. How can I help you today?",
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([
    { name: 'Unit-3 - ER Model.pdf', size: '1.2 MB', timestamp: '2h ago', status: 'Active' }
  ]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/api/rag/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(prev => [
          ...prev,
          {
            name: file.name,
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            timestamp: 'Just now',
            status: 'Active'
          }
        ]);
        alert(`Successfully uploaded ${file.name}`);
      } else {
        alert('Failed to upload document');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading document');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Call actual RAG endpoint
      const response = await fetch('http://localhost:8000/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: inputValue }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.result || "I couldn't find relevant information in the uploaded documents.",
          timestamp: new Date(),
          sources: data.sources || ['Knowledge Base']
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Failed to query RAG');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I encountered an error while processing your request.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  if (activeTab === 'knowledge') {
    return (
      <div className="flex-1 flex flex-col p-8 overflow-y-auto">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          accept=".pdf" 
          className="hidden" 
        />
        <div className="max-w-4xl mx-auto w-full">
          <h1 className="text-3xl font-bold font-outfit mb-2">Knowledge Base</h1>
          <p className="text-white/50 mb-8">Manage and search your uploaded documentation.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {documents.map((doc, idx) => (
              <div key={idx} className="card glass flex items-center gap-4 cursor-pointer hover:border-blue-500/50 transition-all">
                <div className="p-3 bg-red-500/10 text-red-500 rounded-lg">
                  <FileText size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold truncate max-w-[150px]">{doc.name}</h3>
                  <p className="text-xs text-white/40">{doc.size} • Indexed {doc.timestamp}</p>
                </div>
                <div className={`px-2 py-1 ${doc.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'} text-[10px] rounded uppercase font-bold`}>
                  {doc.status}
                </div>
              </div>
            ))}
            
            <div 
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`card border-dashed border-white/10 bg-transparent flex flex-col items-center justify-center py-8 gap-2 cursor-pointer hover:bg-white/5 transition-all ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
            >
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40">
                {isUploading ? <RefreshCw size={20} className="animate-spin" /> : <Search size={20} />}
              </div>
              <p className="text-sm font-medium text-white/40">
                {isUploading ? 'Processing...' : 'Add New Document'}
              </p>
            </div>
          </div>


          <div className="card glass">
            <h3 className="font-semibold mb-4">Direct Document Query</h3>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Search across all documents..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500/50 transition-all"
              />
              <button className="btn btn-primary">Search</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full relative min-w-0">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 max-w-3xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-lg ${
                msg.role === 'assistant' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white/10 text-white/70'
              }`}>
                {msg.role === 'assistant' ? <Bot size={18} /> : <User size={18} />}
              </div>
              
              <div className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : ''}`}>
                <div className={`px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                  msg.role === 'assistant' 
                    ? 'bg-white/5 border border-white/5 text-white/90 rounded-tl-none' 
                    : 'bg-blue-600 text-white rounded-tr-none'
                }`}>
                  {msg.content}
                </div>
                
                {msg.sources && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {msg.sources.map((source, i) => (
                      <div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-md text-[10px] text-white/40 border border-white/5 hover:border-white/10 cursor-help transition-all">
                        <FileText size={10} />
                        {source}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-3 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1 hover:text-white text-white/30 transition-colors"><Copy size={12} /></button>
                  {msg.role === 'assistant' && (
                    <button className="p-1 hover:text-white text-white/30 transition-colors"><RefreshCw size={12} /></button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <div className="flex gap-4 max-w-3xl">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0">
              <Bot size={18} />
            </div>
            <div className="bg-white/5 border border-white/5 px-5 py-3.5 rounded-2xl rounded-tl-none flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c] to-transparent">
        <div className="max-w-3xl mx-auto relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition-opacity"></div>
          <div className="relative flex items-center glass rounded-2xl overflow-hidden border border-white/10 group-focus-within:border-white/20 transition-all">
            <div className="pl-5 text-white/30">
              {agentMode === 'agent' ? <Sparkles size={20} /> : <Search size={20} />}
            </div>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={agentMode === 'agent' ? "Ask the AI Agent anything..." : "Direct search in Knowledge Base..."}
              className="flex-1 bg-transparent border-none px-4 py-5 text-[15px] text-white placeholder-white/20 focus:outline-none"
            />
            <button 
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className={`mr-3 p-2.5 rounded-xl transition-all ${
                inputValue.trim() 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                  : 'text-white/20'
              }`}
            >
              <Send size={18} />
            </button>
          </div>
          <div className="flex justify-between px-2 mt-2">
            <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
              {agentMode === 'agent' ? 'LangGraph Agent Enabled' : 'Direct FAISS Search'}
            </p>
            <p className="text-[10px] text-white/30">Press Enter to send</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
