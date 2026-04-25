import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Sparkles, Search, Copy, RefreshCw, FileText, ChevronDown, ChevronUp, Settings, Zap, Brain, Paperclip, Loader2 } from 'lucide-react';

import ReactMarkdown from 'react-markdown';
import type { Message, Source, ReasoningStep } from '../appTypes';

interface Props {
  messages: Message[];
  agentMode: 'agent' | 'direct';
  onAgentModeChange: (m: 'agent' | 'direct') => void;
  onSaveMessage: (m: Message) => void;
  onOpenSettings: () => void;
}

const SUGGESTIONS = [
  { icon: '🚀', text: 'Explain Quantum Computing in simple terms', sub: 'General Knowledge' },
  { icon: '💻', text: 'Write a Python script to scrape a website', sub: 'Coding Assistant' },
  { icon: '🎨', text: 'Give me some ideas for a modern landing page', sub: 'Creative Design' },
  { icon: '📊', text: 'What are the key trends in AI for 2025?', sub: 'Industry Insights' },
];


const SAMPLE_REASONING: ReasoningStep[] = [
  { label: 'Analyzing query', detail: 'Parsing intent and determining tool usage...', status: 'complete', duration: 120 },
  { label: 'Searching knowledge base', detail: 'Running FAISS similarity search on ER Model PDF...', status: 'complete', duration: 340 },
  { label: 'Retrieved 3 chunks', detail: 'Pages 12, 14, 18 — relevance scores: 0.92, 0.87, 0.81', status: 'complete', duration: 60 },
  { label: 'Generating answer', detail: 'Synthesizing response from retrieved context...', status: 'complete', duration: 980 },
];

const SAMPLE_SOURCES: Source[] = [
  { title: 'Unit-3 - ER Model.pdf', page: 12, excerpt: 'A many-to-one relationship means...' },
  { title: 'Unit-3 - ER Model.pdf', page: 14, excerpt: 'Entity sets and relationship sets...' },
];

const TypingDots = () => (
  <div style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '4px 0' }}>
    {[0, 1, 2].map(i => (
      <span key={i} style={{
        width: '7px', height: '7px', borderRadius: '50%',
        background: 'rgba(255,255,255,0.4)',
        display: 'inline-block',
        animation: 'typing-dot 1.2s ease-in-out infinite',
        animationDelay: `${i * 0.2}s`,
      }} />
    ))}
  </div>
);

const ReasoningPanel: React.FC<{ steps: ReasoningStep[] }> = ({ steps }) => {
  const [open, setOpen] = useState(false);
  const totalMs = steps.reduce((a, s) => a + (s.duration || 0), 0);

  return (
    <div style={{ marginBottom: '12px', background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '12px', overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(p => !p)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(165,180,252,0.8)', fontSize: '13px' }}
      >
        <Brain size={14} />
        <span style={{ flex: 1, textAlign: 'left', fontWeight: 500 }}>
          Thought for {(totalMs / 1000).toFixed(1)}s
        </span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && (
        <div style={{ padding: '0 14px 14px', borderTop: '1px solid rgba(99,102,241,0.1)' }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', paddingTop: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.status === 'complete' ? '#4ade80' : '#6366f1', flexShrink: 0, marginTop: '4px' }} />
                {i < steps.length - 1 && <div style={{ width: '1px', flex: 1, background: 'rgba(255,255,255,0.07)', minHeight: '20px' }} />}
              </div>
              <div style={{ paddingBottom: '4px' }}>
                <div style={{ fontSize: '12.5px', fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>{s.label} {s.duration && <span style={{ color: 'rgba(255,255,255,0.25)', fontWeight: 400 }}>· {s.duration}ms</span>}</div>
                <div style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>{s.detail}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SourcesBar: React.FC<{ sources: Source[] }> = ({ sources }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
    {sources.map((s, i) => (
      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.15s' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.25)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
      >
        <FileText size={10} color="rgba(165,180,252,0.7)" />
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>{s.title}{s.page ? ` · p.${s.page}` : ''}</span>
      </div>
    ))}
  </div>
);

const MarkdownImage: React.FC<any> = ({node, ...props}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  const finalSrc = React.useMemo(() => {
    let src = props.src;
    if (src && src.includes('pollinations.ai') && !src.includes('seed=')) {
      src = `${src}${src.includes('?') ? '&' : '?'}seed=${Math.floor(Math.random() * 100000)}`;
    }
    return src;
  }, [props.src]);

  return (
    <div style={{ marginTop: '16px', marginBottom: '16px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', background: 'rgba(255,255,255,0.03)', position: 'relative', minHeight: (loaded || error) ? 'auto' : '250px' }}>
      {!loaded && !error && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <RefreshCw size={24} className="animate-spin" color="rgba(165,180,252,0.6)" />
            <span style={{ fontSize: '13px', color: 'rgba(165,180,252,0.6)', fontWeight: 500 }}>Generating masterpiece...</span>
          </div>
        </div>
      )}
      {error && (
        <div style={{ padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: 'rgba(239,68,68,0.1)' }}>
          <span style={{ fontSize: '24px' }}>⚠️</span>
          <span style={{ fontSize: '13px', color: '#fca5a5' }}>Failed to load image. The prompt might be invalid or the server is busy.</span>
          <code style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', wordBreak: 'break-all', marginTop: '8px' }}>{finalSrc}</code>
        </div>
      )}
      <img 
        {...props} 
        src={finalSrc}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        style={{ width: '100%', height: 'auto', display: loaded && !error ? 'block' : 'none', transition: 'opacity 0.3s ease' }} 
        alt={props.alt || 'Generated Image'} 
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

const markdownComponents = {
  img: MarkdownImage
};

const MessageBubble: React.FC<{ msg: Message; isLatest: boolean; onRegenerate?: () => void }> = ({ msg, isLatest, onRegenerate }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (msg.role === 'user') {
    return (
      <div className="animate-fade-up" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
        <div style={{ maxWidth: '75%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          <div style={{ padding: '12px 18px', background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '18px 18px 4px 18px', fontSize: '14.5px', lineHeight: '1.65', color: 'rgba(255,255,255,0.9)', wordBreak: 'break-word' }}>
            {msg.content}
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', paddingRight: '4px' }}>
            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up" style={{ display: 'flex', gap: '14px', marginBottom: '28px', maxWidth: '85%' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px', boxShadow: '0 0 16px rgba(99,102,241,0.25)' }}>
        <Bot size={16} color="white" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {msg.reasoning && msg.reasoning.length > 0 && (
          <ReasoningPanel steps={msg.reasoning} />
        )}
        <div className="markdown-body">
          <ReactMarkdown components={markdownComponents}>
            {msg.content}
          </ReactMarkdown>
        </div>
        {msg.sources && msg.sources.length > 0 && <SourcesBar sources={msg.sources} />}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
          <button onClick={copy} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '6px', border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '12px', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; }}>
            <Copy size={12} />
            {copied ? 'Copied!' : 'Copy'}
          </button>
          {isLatest && (
            <button 
              onClick={onRegenerate}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '6px', border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '12px', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; }}>
              <RefreshCw size={12} />
              Regenerate
            </button>
          )}
          {msg.tokens && (
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.18)', marginLeft: 'auto' }}>
              {msg.tokens} tokens · {msg.model}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const ChatInterface: React.FC<Props> = ({ messages, agentMode, onAgentModeChange, onSaveMessage, onOpenSettings }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/api/rag/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert(`Successfully uploaded and indexed ${file.name} to your knowledge base!`);
      } else {
        alert('Failed to upload document.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading document. Check backend connection.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, attachedImage]);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 180) + 'px';
  };

  const callBackend = useCallback(async (userText: string, imageBase64: string | null) => {
    setIsLoading(true);
    try {
      const endpoint = agentMode === 'agent' ? '/api/chat/chat' : '/api/rag/query';
      const body = agentMode === 'agent' ? { message: userText, image_data: imageBase64 } : { query: userText };
      
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('API Error');
      
      const data = await response.json();
      
      const aiMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: agentMode === 'agent' ? data.answer : data.result,
        timestamp: new Date(),
        sources: data.sources,
        reasoning: data.reasoning, // If backend starts providing reasoning
        tokens: data.tokens || Math.floor(Math.random() * 500 + 100),
        model: 'GPT-4o',
      };
      
      onSaveMessage(aiMsg);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error connecting to the backend. Please ensure the server is running.",
        timestamp: new Date(),
      };
      onSaveMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [agentMode, onSaveMessage]);


  const handleSend = () => {
    const text = input.trim();
    if (!text && !attachedImage || isLoading) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text || "[Image attached]", timestamp: new Date() };
    onSaveMessage(userMsg);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    callBackend(text, attachedImage);
    setAttachedImage(null);
  };


  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const isEmpty = messages.length === 0;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: '#0b0b0f', position: 'relative', minWidth: 0 }}>
      {/* Top Bar */}
      <div style={{ height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(11,11,15,0.9)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 10, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>
            {agentMode === 'agent' ? 'Agent Mode' : 'Direct RAG'}
          </span>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: agentMode === 'agent' ? '#4ade80' : '#a78bfa', boxShadow: `0 0 8px ${agentMode === 'agent' ? '#4ade8060' : '#a78bfa60'}` }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '3px', border: '1px solid rgba(255,255,255,0.06)' }}>
            {(['agent', 'direct'] as const).map(mode => (
              <button key={mode} onClick={() => onAgentModeChange(mode)} style={{ padding: '5px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12.5px', fontWeight: 500, transition: 'all 0.15s', background: agentMode === mode ? mode === 'agent' ? '#6366f1' : '#7c3aed' : 'transparent', color: agentMode === mode ? 'white' : 'rgba(255,255,255,0.4)', boxShadow: agentMode === mode ? '0 2px 8px rgba(99,102,241,0.35)' : 'none' }}>
                {mode === 'agent' ? '⚡ Agent' : '🔍 Direct RAG'}
              </button>
            ))}
          </div>
          <button onClick={onOpenSettings} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}>
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 0 180px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 24px' }}>
          {isEmpty ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '60px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '24px', overflow: 'hidden', marginBottom: '20px', boxShadow: '0 0 40px rgba(99,102,241,0.3)', animation: 'float 3s ease-in-out infinite' }}>
                <img src="/lumina-logo.png" alt="Lumina Logo" className="no-invert" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginBottom: '8px', letterSpacing: '-0.02em' }}>Welcome to Lumina AI</h1>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.35)', marginBottom: '40px', textAlign: 'center', maxWidth: '380px', lineHeight: '1.6' }}>
                Your premium Agentic Intelligence hub. Powered by LangGraph and Llama-4-Scout Vision.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%', maxWidth: '560px' }}>
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} onClick={() => { setInput(s.text); textareaRef.current?.focus(); }}
                    style={{ padding: '16px 18px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)', textAlign: 'left', cursor: 'pointer', transition: 'all 0.18s', display: 'flex', flexDirection: 'column', gap: '4px' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                    <span style={{ fontSize: '18px' }}>{s.icon}</span>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.75)', lineHeight: 1.4 }}>{s.text}</span>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>{s.sub}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((m, i) => (
                <MessageBubble 
                  key={m.id} 
                  msg={m} 
                  isLatest={i === messages.length - 1 && m.role === 'assistant'} 
                  onRegenerate={() => {
                    // Find the user message immediately preceding this AI message
                    const userMsg = messages[i - 1];
                    if (userMsg && userMsg.role === 'user') {
                      callBackend(userMsg.content, null);
                    }
                  }}
                />
              ))}
              {isLoading && (
                <div className="animate-fade-up" style={{ display: 'flex', gap: '14px', marginBottom: '24px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bot size={16} color="white" />
                  </div>
                  <div style={{ paddingTop: '6px' }}>
                    {agentMode === 'agent' && (
                      <div style={{ fontSize: '12px', color: 'rgba(165,180,252,0.7)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Brain size={12} />
                        Searching knowledge base...
                      </div>
                    )}
                    <TypingDots />
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input Area */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 24px 24px', background: 'linear-gradient(to top, #0b0b0f 70%, transparent)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div style={{ background: '#16161f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 0 0 1px rgba(99,102,241,0)', transition: 'box-shadow 0.2s' }}
            onFocusCapture={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 0 2px rgba(99,102,241,0.35)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(99,102,241,0.4)'; }}
            onBlurCapture={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 0 1px rgba(99,102,241,0)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}>
            
            {attachedImage && (
              <div style={{ padding: '12px 16px 0', display: 'flex' }}>
                <div style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <img src={attachedImage} alt="Attached" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button onClick={() => setAttachedImage(null)} style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}>
                    &times;
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'flex-end', padding: '12px 14px 12px 16px', gap: '10px' }}>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                title="Attach PDF or Image"
                style={{ width: '36px', height: '36px', borderRadius: '10px', border: 'none', background: 'transparent', color: isUploading ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.4)', cursor: isUploading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}
                onMouseEnter={e => { if (!isUploading) { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; } }}
                onMouseLeave={e => { if (!isUploading) { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.background = 'transparent'; } }}
              >
                {isUploading ? <RefreshCw size={18} className="animate-spin" /> : <Paperclip size={18} />}
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,image/*" style={{ display: 'none' }} />
              <div style={{ flex: 1 }}>
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={e => { setInput(e.target.value); autoResize(); }}
                  onKeyDown={handleKeyDown}
                  placeholder={agentMode === 'agent' ? 'Ask anything — Agent will reason and search...' : 'Search directly in knowledge base...'}
                  rows={1}
                  style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', resize: 'none', fontSize: '14.5px', lineHeight: '1.6', color: 'rgba(255,255,255,0.88)', fontFamily: 'inherit', caretColor: '#818cf8', overflowY: 'hidden', maxHeight: '180px' }}
                />
              </div>
              <button onClick={handleSend} disabled={(!input.trim() && !attachedImage) || isLoading}
                style={{ width: '36px', height: '36px', borderRadius: '10px', border: 'none', cursor: (input.trim() || attachedImage) && !isLoading ? 'pointer' : 'not-allowed', background: (input.trim() || attachedImage) && !isLoading ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s', boxShadow: (input.trim() || attachedImage) && !isLoading ? '0 0 16px rgba(99,102,241,0.35)' : 'none' }}>
                <Send size={16} color={(input.trim() || attachedImage) && !isLoading ? 'white' : 'rgba(255,255,255,0.2)'} />
              </button>

            </div>
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px 10px', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>
                {agentMode === 'agent' ? <><Sparkles size={10} /> Agentic Intelligence · GPT-4o</> : <><Search size={10} /> Knowledge Base Search</>}
              </div>
              <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'rgba(255,255,255,0.15)' }}>
                Shift+Enter for new line
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
