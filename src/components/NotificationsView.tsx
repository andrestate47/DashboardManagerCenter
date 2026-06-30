import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, AlertTriangle, CheckCircle, Info, Trash2, Clock, Zap, User, ArrowRight, Activity, TrendingUp } from 'lucide-react';

interface Notification {
  id: string;
  type: 'SALE' | 'ALERT' | 'INFO' | 'SUCCESS' | 'USER_JOIN';
  title: string;
  message: string;
  timestamp: string;
  businessName: string;
  count?: number;
  userIdentifier?: string;
  metadata?: any;
}

export const NotificationsView: React.FC<{ events: any[] }> = ({ events }) => {
  const notifications: Notification[] = events.map(e => ({
    id: e.id,
    type: e.type === 'SALE' ? 'SUCCESS' : e.type === 'ALERT' ? 'ALERT' : e.type === 'USER_JOIN' ? 'USER_JOIN' : 'INFO',
    title: e.type === 'SALE' ? 'Nueva Venta Detectada' : 
           e.type === 'ALERT' ? 'Análisis de Robotina' : 
           e.type === 'USER_JOIN' ? 'Nuevo Registro' : 'Evento de Sistema',
    message: e.message,
    timestamp: e.timestamp,
    businessName: e.businessName,
    count: e.count,
    userIdentifier: e.userIdentifier,
    metadata: e.metadata
  }));

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'ALERT': return {
        color: 'rose',
        icon: <Activity size={20} />,
        gradient: 'from-rose-500/20 to-rose-600/5',
        border: 'border-rose-500/20',
        text: 'text-rose-400',
        badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        glow: 'shadow-[0_0_15px_rgba(244,63,94,0.2)]'
      };
      case 'SUCCESS': return {
        color: 'emerald',
        icon: <TrendingUp size={20} />,
        gradient: 'from-emerald-500/20 to-emerald-600/5',
        border: 'border-emerald-500/20',
        text: 'text-emerald-400',
        badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        glow: 'shadow-[0_0_15px_rgba(16,185,129,0.2)]'
      };
      case 'USER_JOIN': return {
        color: 'indigo',
        icon: <User size={20} />,
        gradient: 'from-indigo-500/20 to-indigo-600/5',
        border: 'border-indigo-500/20',
        text: 'text-indigo-400',
        badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
        glow: 'shadow-[0_0_15px_rgba(99,102,241,0.2)]'
      };
      default: return {
        color: 'slate',
        icon: <Info size={20} />,
        gradient: 'from-slate-500/20 to-slate-600/5',
        border: 'border-slate-500/20',
        text: 'text-slate-400',
        badge: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
        glow: ''
      };
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 max-w-6xl mx-auto space-y-12"
    >
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-white/5 pb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 shadow-xl border border-indigo-500/20">
                <Bell size={28} />
             </div>
             <div>
               <h2 className="text-4xl font-black tracking-tight text-white">
                 Intelligence <span className="text-indigo-500">Feed</span>
               </h2>
               <p className="text-slate-400 font-medium flex items-center gap-2 mt-1">
                 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 Monitoreo de Nodos Activo • {notifications.length} eventos hoy
               </p>
             </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="px-4 py-2.5 bg-slate-900/50 rounded-2xl border border-white/10 flex items-center gap-2 shadow-inner">
             <Clock size={16} className="text-slate-500" />
             <span className="text-sm font-bold text-slate-300 tracking-tight">Auto-Reseteo Diario</span>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-2xl transition-all font-bold border border-rose-500/20 group">
            <Trash2 size={18} className="group-hover:rotate-12 transition-transform" />
            Limpiar Todo
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence mode="popLayout">
          {notifications.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-32 flex flex-col items-center justify-center text-center space-y-6"
            >
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-slate-800 animate-pulse">
                <Zap size={48} fill="currentColor" />
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-black text-white">Feed Vacío</p>
                <p className="text-slate-500 max-w-sm mx-auto font-medium">No hay alertas activas. El sistema de Robotina está operando en niveles óptimos.</p>
              </div>
            </motion.div>
          ) : (
            notifications.map((n, idx) => {
              const config = getTypeConfig(n.type);
              return (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`group relative rounded-[2rem] bg-slate-900/40 border border-white/5 overflow-hidden hover:border-white/10 transition-all shadow-2xl`}
                >
                  {/* Indicator Bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-2 bg-${config.color}-500 ${config.glow}`} />

                  <div className="p-6 flex flex-col lg:flex-row items-start lg:items-center gap-8">
                    {/* Icon Container */}
                    <div className={`w-16 h-16 rounded-2xl shrink-0 ${config.badge} flex items-center justify-center shadow-inner`}>
                      {config.icon}
                    </div>
                    
                    {/* Content Section */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-4 mb-4">
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-lg bg-white/5 text-slate-400 border border-white/5">
                          {n.businessName}
                        </span>
                        
                        {n.userIdentifier && (
                          <div className="flex items-center gap-3 bg-indigo-500/5 px-4 py-1.5 rounded-full border border-indigo-500/10">
                            <User size={14} className="text-indigo-400/60" />
                            <span className="text-[13px] text-white font-bold tracking-tight">
                              {n.userIdentifier}
                            </span>
                            {n.metadata?.plan && (
                              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-tighter ${
                                n.metadata.plan === 'elite' ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-amber-950' :
                                n.metadata.plan === 'pro' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' :
                                'bg-slate-700 text-slate-200'
                              }`}>
                                {n.metadata.plan}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono ml-auto">
                          <Clock size={14} />
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-4">
                          <h3 className="text-2xl font-black text-white tracking-tight leading-none">{n.title}</h3>
                          {n.count && n.count > 1 && (
                            <div className="px-3 py-1 bg-white text-black text-[13px] font-black rounded-lg shadow-xl shadow-white/10 flex items-center gap-2">
                              <Zap size={12} fill="currentColor" />
                              AGREGADO x{n.count}
                            </div>
                          )}
                        </div>
                        <p className="text-slate-300 text-lg font-medium leading-relaxed max-w-3xl">
                          {n.message}
                          {n.metadata?.symbol && (
                            <span className="ml-3 text-indigo-400 font-black border-b-2 border-indigo-500/30">
                              {n.metadata.symbol}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 shrink-0 self-stretch lg:self-center border-t lg:border-t-0 lg:border-l border-white/5 pt-6 lg:pt-0 lg:pl-8">
                       <button className="flex-1 lg:flex-none px-6 py-3 bg-white/5 hover:bg-indigo-500/20 hover:text-indigo-400 rounded-2xl transition-all text-slate-400 font-bold border border-white/5 flex items-center justify-center gap-2">
                          Detalles
                          <ArrowRight size={16} />
                       </button>
                       <button className="p-3.5 bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 rounded-2xl transition-all text-slate-500 border border-white/5">
                          <Trash2 size={20} />
                       </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      <footer className="pt-16 pb-8 text-center border-t border-white/5">
         <p className="text-[11px] text-slate-600 font-black uppercase tracking-[0.4em]">Intelligence System v2.0</p>
      </footer>
    </motion.div>
  );
};
