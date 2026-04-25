import React from 'react';
import { 
  Workflow, 
  Brain, 
  Search, 
  CheckCircle2, 
  ArrowRight, 
  Activity,
  Cpu,
  Layers
} from 'lucide-react';
import { motion } from 'framer-motion';

const ReasoningPanel: React.FC = () => {
  const steps = [
    { 
      id: 1, 
      label: 'Agent Node', 
      status: 'complete', 
      detail: 'Analyzing user query and deciding action.',
      icon: <Brain size={16} />
    },
    { 
      id: 2, 
      label: 'Tool: RAG', 
      status: 'complete', 
      detail: 'Searching vector store for ER Model context.',
      icon: <Search size={16} />
    },
    { 
      id: 3, 
      label: 'Router', 
      status: 'active', 
      detail: 'Synthesizing final answer from retrieved docs.',
      icon: <Workflow size={16} />
    }
  ];

  return (
    <aside className="w-80 bg-[#0a0a0c] border-l border-white/5 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-white/5 bg-[#121217]/50">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
          <Activity size={14} className="text-blue-500" />
          Agent Reasoning
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        {/* Graph Visualization Mockup */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-bold text-white/30 uppercase tracking-wider">Graph State</span>
            <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[9px] rounded-full font-bold uppercase">Live</span>
          </div>
          
          <div className="relative p-6 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center gap-6">
            {/* Agent Node */}
            <div className="w-full flex justify-center">
              <div className="relative group">
                <div className="absolute -inset-2 bg-blue-500/20 rounded-xl blur-lg group-hover:bg-blue-500/30 transition-all"></div>
                <div className="relative w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center border border-blue-400/30 shadow-xl">
                  <Cpu size={24} className="text-white" />
                </div>
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase text-blue-400 whitespace-nowrap">Agent</div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-0.5 h-8 bg-gradient-to-b from-blue-500 to-purple-500 opacity-50"></div>
              <ArrowRight size={12} className="rotate-90 text-purple-500" />
            </div>

            {/* Tool Node */}
            <div className="w-full flex justify-center">
              <div className="relative group">
                <div className="absolute -inset-2 bg-purple-500/10 rounded-xl blur-lg"></div>
                <div className="relative w-12 h-12 rounded-xl bg-purple-600/20 flex items-center justify-center border border-purple-500/30">
                  <Layers size={24} className="text-purple-400" />
                </div>
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase text-purple-400 whitespace-nowrap">Tool (RAG)</div>
              </div>
            </div>

            {/* Returning Arrow (Loop) */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center">
               <div className="w-12 h-24 border-r-2 border-t-2 border-b-2 border-white/10 rounded-r-2xl border-dashed"></div>
            </div>
          </div>
        </div>

        {/* Thinking Steps */}
        <div className="space-y-6">
          <span className="text-[11px] font-bold text-white/30 uppercase tracking-wider block mb-4">Execution Trace</span>
          
          <div className="space-y-4">
            {steps.map((step, index) => (
              <motion.div 
                key={step.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative pl-8 pb-4 last:pb-0 ${index !== steps.length - 1 ? 'border-l border-white/10' : ''}`}
              >
                {/* Connector Point */}
                <div className={`absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full border-2 ${
                  step.status === 'complete' 
                    ? 'bg-blue-500 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' 
                    : step.status === 'active'
                    ? 'bg-transparent border-blue-500 animate-pulse'
                    : 'bg-transparent border-white/20'
                }`}></div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className={`text-[13px] font-semibold flex items-center gap-2 ${
                      step.status === 'active' ? 'text-white' : 'text-white/60'
                    }`}>
                      <span className="text-blue-400/50">{step.icon}</span>
                      {step.label}
                    </span>
                    {step.status === 'complete' && <CheckCircle2 size={12} className="text-green-500" />}
                  </div>
                  <p className="text-[11px] text-white/30 leading-relaxed">
                    {step.detail}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Metrics Footer */}
        <div className="mt-12 pt-8 border-t border-white/5 space-y-4">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-white/30 uppercase font-bold tracking-widest">Latency</span>
            <span className="text-blue-400 font-mono">1.2s</span>
          </div>
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-white/30 uppercase font-bold tracking-widest">Tokens</span>
            <span className="text-blue-400 font-mono">432</span>
          </div>
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-white/30 uppercase font-bold tracking-widest">Confidence</span>
            <span className="text-green-500 font-mono">98%</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default ReasoningPanel;
