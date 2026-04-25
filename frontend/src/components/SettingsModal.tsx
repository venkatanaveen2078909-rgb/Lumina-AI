import React from 'react';
import { X, Key, Cpu, Sliders, Shield, Save, Moon, Sun, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsModalProps {
  onClose: () => void;
  theme: string;
  setTheme: (t: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, theme, setTheme }) => {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyCenter: 'center', padding: '16px' }}>
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      />
      
      {/* Modal */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        style={{ 
          position: 'relative', 
          width: '100%', 
          maxWidth: '520px', 
          background: '#121217', 
          border: '1px solid rgba(255,255,255,0.1)', 
          borderRadius: '24px', 
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px', background: 'rgba(99,102,241,0.1)', text: '#818cf8', borderRadius: '12px' }}>
              <Shield size={22} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#f3f4f6' }}>Settings</h2>
          </div>
          <button 
            onClick={onClose}
            style={{ padding: '8px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', borderRadius: '10px', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <X size={22} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Appearance */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.15em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sun size={14} />
                Appearance
              </h3>
              
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '4px' }}>
                {[
                  { id: 'dark', icon: <Moon size={16} />, label: 'Dark' },
                  { id: 'light', icon: <Sun size={16} />, label: 'Light' },
                  { id: 'system', icon: <Monitor size={16} />, label: 'System' },
                ].map(t => (
                  <button 
                    key={t.id} 
                    onClick={() => setTheme(t.id)}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 500, transition: 'all 0.2s', background: theme === t.id ? 'rgba(255,255,255,0.08)' : 'transparent', color: theme === t.id ? 'white' : 'rgba(255,255,255,0.4)' }}
                  >
                    {t.icon}
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button 
            onClick={onClose}
            style={{ padding: '12px 24px', borderRadius: '14px', border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'white'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
          >
            Cancel
          </button>
          <button 
            onClick={onClose}
            style={{ padding: '12px 32px', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 20px -5px rgba(99,102,241,0.4)' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsModal;
