import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import SettingsModal from './components/SettingsModal';
import type { Source, ReasoningStep, Message, Conversation } from './appTypes';

const INITIAL_CONVERSATIONS: Conversation[] = [
  { id: '1', title: 'Modern Web Architecture', messages: [], createdAt: new Date(Date.now() - 3600000), model: 'gpt-4o' },
  { id: '2', title: 'React Hooks Deep Dive', messages: [], createdAt: new Date(Date.now() - 7200000), model: 'gpt-4o' },
  { id: '3', title: 'System Design Interview', messages: [], createdAt: new Date(Date.now() - 86400000), model: 'gpt-4o' },
];


const App: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [agentMode, setAgentMode] = useState<'agent' | 'direct'>('agent');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  React.useEffect(() => {
    if (theme === 'system') {
      const isLight = window.matchMedia('(prefers-color-scheme: light)').matches;
      document.documentElement.setAttribute('data-theme', isLight ? 'light' : 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleNewChat = () => {
    setActiveConvId(null);
  };

  const handleSelectConv = (id: string) => {
    setActiveConvId(id);
  };

  const handleDeleteConv = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConvId === id) handleNewChat();
  };

  const handleSaveMessage = (msg: Message) => {
    if (!activeConvId && msg.role === 'user') {
      const newId = Date.now().toString();
      const newConv: Conversation = {
        id: newId,
        title: msg.content.slice(0, 40) + (msg.content.length > 40 ? '...' : ''),
        messages: [msg],
        createdAt: new Date(),
        model: 'Agentic Intelligence',
      };
      setConversations(prev => [newConv, ...prev]);
      setActiveConvId(newId);
    } else if (activeConvId) {
      setConversations(prev => prev.map(c => 
        c.id === activeConvId ? { ...c, messages: [...c.messages, msg] } : c
      ));
    }
  };

  const currentMessages = activeConvId 
    ? conversations.find(c => c.id === activeConvId)?.messages || [] 
    : [];

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: '#0b0b0f' }}>
      <Sidebar
        conversations={conversations}
        activeConvId={activeConvId}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(p => !p)}
        onNewChat={handleNewChat}
        onSelectConv={handleSelectConv}
        onDeleteConv={handleDeleteConv}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <ChatInterface
        messages={currentMessages}
        agentMode={agentMode}
        onAgentModeChange={setAgentMode}
        onSaveMessage={handleSaveMessage}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {isSettingsOpen && (
        <SettingsModal 
          onClose={() => setIsSettingsOpen(false)} 
          theme={theme}
          setTheme={setTheme}
        />
      )}
    </div>
  );
};

export default App;
