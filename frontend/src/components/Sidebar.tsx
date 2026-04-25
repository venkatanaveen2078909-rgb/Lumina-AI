import React, { useState } from 'react';
import {
  Plus, MessageSquare, Trash2, ChevronLeft, ChevronRight,
  Settings, Cpu, Clock, Sparkles
} from 'lucide-react';
import type { Conversation } from '../appTypes';

interface SidebarProps {
  conversations: Conversation[];
  activeConvId: string | null;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onNewChat: () => void;
  onSelectConv: (id: string) => void;
  onDeleteConv: (id: string) => void;
  onOpenSettings: () => void;
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

const Sidebar: React.FC<SidebarProps> = ({
  conversations, activeConvId, collapsed,
  onToggleCollapse, onNewChat, onSelectConv, onDeleteConv, onOpenSettings
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <aside
      style={{
        width: collapsed ? '72px' : '260px',
        minWidth: collapsed ? '72px' : '260px',
        background: '#111116',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1), min-width 0.25s cubic-bezier(0.4,0,0.2,1)',
        position: 'relative',
        zIndex: 20,
      }}
    >
      {/* Header */}
      <div style={{ padding: collapsed ? '16px 12px' : '16px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, boxShadow: '0 0 20px rgba(99,102,241,0.35)' }}>
              <img src="/lumina-logo.png" alt="Lumina Logo" className="no-invert" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: '15px', color: '#f3f4f6', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>Lumina AI</span>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', flexShrink: 0 }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)', e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent', e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* New Chat Button */}
      <div style={{ padding: collapsed ? '12px 10px' : '12px 10px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <button
          onClick={onNewChat}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: collapsed ? '10px' : '10px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: 'rgba(255,255,255,0.75)', cursor: 'pointer', transition: 'all 0.15s', justifyContent: collapsed ? 'center' : 'flex-start', fontSize: '13.5px', fontWeight: 500 }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
        >
          <Plus size={16} style={{ flexShrink: 0 }} />
          {!collapsed && <span>New Chat</span>}
        </button>
      </div>

      {/* Conversations */}
      <div style={{ flex: 1, overflowY: 'auto', padding: collapsed ? '8px 8px' : '8px 8px' }}>
        {!collapsed && (
          <div style={{ padding: '4px 6px 8px', fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Recent
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {conversations.map(conv => (
            <div
              key={conv.id}
              onMouseEnter={() => setHoveredId(conv.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onSelectConv(conv.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: collapsed ? '10px' : '8px 10px',
                borderRadius: '8px', cursor: 'pointer', position: 'relative',
                background: activeConvId === conv.id ? 'rgba(99,102,241,0.12)' : hoveredId === conv.id ? 'rgba(255,255,255,0.04)' : 'transparent',
                transition: 'background 0.15s',
                justifyContent: collapsed ? 'center' : 'flex-start',
                border: activeConvId === conv.id ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
              }}
            >
              <MessageSquare
                size={16}
                style={{ color: activeConvId === conv.id ? '#818cf8' : 'rgba(255,255,255,0.35)', flexShrink: 0 }}
              />
              {!collapsed && (
                <>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: activeConvId === conv.id ? 500 : 400, color: activeConvId === conv.id ? '#e0e0ff' : 'rgba(255,255,255,0.65)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {conv.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                      <Clock size={9} />
                      {timeAgo(conv.createdAt)}
                    </div>
                  </div>
                  {hoveredId === conv.id && (
                    <button
                      onClick={e => { e.stopPropagation(); onDeleteConv(conv.id); }}
                      style={{ padding: '4px', borderRadius: '5px', border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', display: 'flex', flexShrink: 0 }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(248,113,113,0.08)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; e.currentTarget.style.background = 'transparent'; }}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: collapsed ? '12px 10px' : '12px 10px', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <button
          onClick={onOpenSettings}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: collapsed ? '10px' : '10px 12px', borderRadius: '10px', border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.45)', cursor: 'pointer', transition: 'all 0.15s', justifyContent: collapsed ? 'center' : 'flex-start', fontSize: '13.5px', fontWeight: 400 }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
        >
          <Settings size={16} style={{ flexShrink: 0 }} />
          {!collapsed && <span>Settings</span>}
        </button>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: 'white', flexShrink: 0 }}>UT</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.85)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Tumma Naveen</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
                <Cpu size={9} />
                GPT-4o

              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
