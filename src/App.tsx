import React, { useState } from 'react';
import { useUniHub } from './useUniHub';
import { 
  BarChart3, 
  Bell, 
  ChevronRight, 
  DollarSign, 
  Globe, 
  LayoutDashboard, 
  MessageSquare, 
  Settings, 
  TrendingUp, 
  Users,
  Volume2,
  VolumeX,
  Zap,
  Activity,
  CreditCard,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NotificationToast } from './components/NotificationToast';
import { AnalyticsView } from './components/AnalyticsView';
import { NotificationsView } from './components/NotificationsView';

const App: React.FC = () => {
  const { 
    events, 
    summaries, 
    soundEnabled, 
    setSoundEnabled, 
    lastEvent,
    resetBusinessData,
    selectedDate,
    setSelectedDate,
    historyDates
  } = useUniHub();

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    const nextDate = d.toISOString().split('T')[0];
    if (nextDate <= new Date().toISOString().split('T')[0]) {
      setSelectedDate(nextDate);
    }
  };
  const [activeFilter, setActiveFilter] = useState<string | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'notifications'>('overview');
  const [showSoundHint, setShowSoundHint] = useState(true);

  React.useEffect(() => {
    if (showSoundHint) {
      const timer = setTimeout(() => setShowSoundHint(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [showSoundHint]);

  const filteredEvents = activeFilter === 'all' 
    ? events 
    : events.filter(e => e.businessName === activeFilter);

  const totalRevenue = Object.values(summaries).reduce((acc, curr) => acc + curr.revenue, 0);
  const totalUsers = Object.values(summaries).reduce((acc, curr) => acc + curr.activeUsers, 0);

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="bg-pattern" />
      {/* Sidebar */}
      <aside className="w-64 glass border-r flex flex-col p-6 gap-8">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Zap className="text-white fill-white" size={20} />
          </div>
          <h1 className="font-bold text-xl tracking-tight">UniHub</h1>
        </div>

        <nav className="flex flex-col gap-2">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold px-2 mb-2">Main</p>
          <button 
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-all group ${activeTab === 'overview' ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:bg-white/5'}`}
          >
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-all group ${activeTab === 'analytics' ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:bg-white/5'}`}
          >
            <BarChart3 size={18} />
            <span>Analytics</span>
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-all group ${activeTab === 'notifications' ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:bg-white/5'}`}
          >
            <Bell size={18} />
            <span>Notifications</span>
          </button>
        </nav>

        <div className="flex flex-col gap-2 mt-auto">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold px-2 mb-2">Projects</p>
          <button 
            onClick={() => setActiveFilter('all')}
            className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all ${activeFilter === 'all' ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5'}`}
          >
            <div className="flex items-center gap-3">
              <Globe size={18} />
              <span>All Projects</span>
            </div>
            {activeFilter === 'all' && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
          </button>
          
          {Object.values(summaries).map(biz => (
            <button 
              key={biz.name}
              onClick={() => setActiveFilter(biz.name)}
              className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all ${activeFilter === biz.name ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5'}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: biz.color }} />
                <span>{biz.name}</span>
              </div>
              {activeFilter === biz.name && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 px-2 mt-8 pt-8 border-t border-white/5">
           <div className="w-8 h-8 rounded-full bg-slate-800" />
           <div className="flex flex-col overflow-hidden">
             <span className="text-sm font-medium">CEO Master</span>
             <span className="text-[10px] text-slate-500 truncate">master@unihub.ai</span>
           </div>
           <Settings size={18} className="text-slate-500 ml-auto cursor-pointer" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative overflow-y-auto">
        {/* Top Header */}
        <header className="sticky top-0 z-50 p-6 flex items-center justify-between glass-card rounded-none border-t-0 border-x-0 mx-0 border-b">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold tracking-tight">Business Command Center</h2>
            <p className="text-sm text-slate-400">Viewing real-time operations across {Object.keys(summaries).length} entities</p>
          </div>

          {/* DATE NAVIGATOR - THE TIME MACHINE */}
          <div className="flex items-center gap-2 p-1 bg-slate-900/40 rounded-2xl border border-white/5 shadow-2xl backdrop-blur-xl">
             <button 
               onClick={handlePrevDay}
               className="p-2 hover:bg-white/5 text-slate-400 hover:text-white rounded-xl transition-all"
               title="Día Anterior"
             >
               <ArrowLeft size={20} />
             </button>
             
             <div className="px-6 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex flex-col items-center min-w-[160px] relative overflow-hidden group">
                <div className="flex items-center gap-2">
                   <Calendar size={14} className="text-indigo-400" />
                   <span className="text-sm font-black text-white tracking-tight">
                     {isToday ? 'TODAY' : new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                   </span>
                   {isToday && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                </div>
                <span className="text-[9px] font-bold text-indigo-400/60 uppercase tracking-[0.2em] mt-0.5">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long' })}
                </span>
                
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
             </div>

             <button 
               onClick={handleNextDay}
               disabled={isToday}
               className={`p-2 rounded-xl transition-all ${isToday ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}
               title="Día Siguiente"
             >
               <ArrowRight size={20} />
             </button>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${soundEnabled ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-400' : 'border-slate-800 text-slate-500'}`}
            >
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              <span className="text-xs font-semibold">{soundEnabled ? 'Live Audio ON' : 'Audio Muted'}</span>
            </button>
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-3 py-2 rounded-full border border-emerald-400/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Feed Connected
            </div>
          </div>
        </header>

        {activeTab === 'overview' ? (
          <section className="p-8 space-y-8">
            {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <DollarSign size={80} />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                  <Activity size={20} />
                </div>
                <span className="text-sm font-medium text-slate-400">Total Revenue</span>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold">${totalRevenue.toLocaleString()}</h3>
                <span className="text-xs text-emerald-400 font-medium">+12.5%</span>
              </div>
            </div>

            <div className="glass-card p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Users size={80} />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
                  <Users size={20} />
                </div>
                <span className="text-sm font-medium text-slate-400">Total Users</span>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold">{totalUsers.toLocaleString()}</h3>
                <span className="text-xs text-emerald-400 font-medium">+5.2%</span>
              </div>
            </div>

            <div className="glass-card p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <TrendingUp size={80} />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                  <TrendingUp size={20} />
                </div>
                <span className="text-sm font-medium text-slate-400">Avg. Conversion</span>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold">4.8%</h3>
                <span className="text-xs text-purple-400 font-medium">+1.1%</span>
              </div>
            </div>

            <div className="glass-card p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <CreditCard size={80} />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                  <CreditCard size={20} />
                </div>
                <span className="text-sm font-medium text-slate-400">Active Business</span>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold">{Object.keys(summaries).length}</h3>
                <span className="text-xs text-amber-400 font-medium">Stable</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Timeline Column */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold flex items-center gap-2">
                  <TrendingUp size={20} className="text-indigo-400" />
                  Universal Operation Feed
                </h4>
                <div className="flex gap-2">
                   <span className="px-2 py-1 bg-white/5 rounded text-[10px] text-slate-400">All Nodes Active</span>
                </div>
              </div>

              <div className="glass-card p-4 h-[720px] overflow-hidden flex flex-col bg-slate-900/20 border-white/5">
                <div className="flex flex-col gap-3 overflow-y-auto pr-2 custom-scroll">
                  <AnimatePresence initial={false}>
                    {filteredEvents
                      .map((event) => (
                      <motion.div
                        key={event.id}
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="group relative py-5 px-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.05] transition-all flex items-center gap-4 overflow-hidden"
                      >
                         {/* Status Glow */}
                         <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all ${
                            event.type === 'SALE' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' :
                            event.type === 'ALERT' ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e]' :
                            event.type === 'USER_JOIN' ? 'bg-indigo-500 shadow-[0_0_10px_#6366f1]' :
                            'bg-slate-500'
                         }`} />

                         {/* Icon Box */}
                         <div className="relative shrink-0">
                           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl relative z-10 ${
                             event.type === 'SALE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                             event.type === 'ALERT' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                             event.type === 'USER_JOIN' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                             'bg-slate-800 text-slate-400 border border-white/5'
                           }`}>
                             {event.type === 'SALE' ? <DollarSign size={20} /> :
                              event.type === 'ALERT' ? <Activity size={20} /> :
                              event.type === 'USER_JOIN' ? <Users size={20} /> :
                              <MessageSquare size={20} />}
                           </div>
                         </div>

                         {/* Content Section */}
                         <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-2 mb-0.5">
                               <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-white/5 text-slate-500">
                                 {event.businessName}
                               </span>
                               {event.userIdentifier && (
                                 <span className="text-[11px] text-white/50 font-bold truncate max-w-[200px]">
                                   {event.userIdentifier}
                                 </span>
                               )}
                               {event.metadata?.plan && (
                                 <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${
                                   event.metadata.plan === 'elite' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/20' :
                                   event.metadata.plan === 'pro' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/20' :
                                   'bg-slate-800 text-slate-400 border border-white/5'
                                 }`}>
                                   {event.metadata.plan}
                                 </span>
                               )}
                            </div>
                            <h4 className="text-[15px] font-bold text-white tracking-tight line-clamp-1">
                              {event.message}
                            </h4>
                         </div>

                         {/* Right Side: Badges & Time */}
                         <div className="flex flex-col items-end gap-1.5 shrink-0 ml-2">
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                               <Clock size={11} />
                               {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            
                            {event.count && event.count > 1 && (
                               <div className="px-2 py-0.5 bg-white text-black text-[10px] font-black rounded-lg shadow-lg flex items-center gap-1">
                                 <Zap size={9} fill="currentColor" />
                                 x{event.count}
                               </div>
                            )}
                         </div>
                         
                         <div className="opacity-0 group-hover:opacity-100 transition-all mr-1 shrink-0 scale-90 group-hover:scale-100 ml-4">
                            <ChevronRight size={18} className="text-white/20" />
                         </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {events.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full opacity-20">
                       <Zap size={48} />
                       <p className="mt-4 font-medium">Waiting for signals...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Performance Column */}
            <div className="flex flex-col gap-6">
              <h4 className="text-lg font-bold flex items-center gap-2">
                <Activity size={20} className="text-purple-400" />
                Live Hub Performance
              </h4>

              <div className="space-y-4">
                {Object.values(summaries).map(biz => (
                  <div key={biz.name} className="glass-card p-5 hover:bg-white/[0.05] transition-all cursor-pointer group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg" style={{ backgroundColor: `${biz.color}20`, color: biz.color }}>
                          {biz.name.charAt(0)}
                        </div>
                        <div>
                          <h5 className="font-bold text-sm">{biz.name}</h5>
                          <div className="flex items-center gap-1.5">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                             <span className="text-[10px] text-slate-500 uppercase font-bold">Operational</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                         <div className="flex items-center gap-2">
                           <div className="text-xs font-bold text-white">${biz.revenue.toLocaleString()}</div>
                           <button 
                             onClick={(e) => {
                               e.stopPropagation();
                               if (window.confirm(`¿Seguro que quieres reiniciar los datos de ${biz.name}? Se borrarán las notificaciones y los contadores volverán a cero.`)) {
                                 resetBusinessData(biz.name);
                               }
                             }}
                             className="p-1.5 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                             title="Reiniciar datos de este negocio"
                           >
                             <Trash2 size={14} />
                           </button>
                         </div>
                         <div className="text-[10px] text-slate-500">Revenue</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                       <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center justify-center text-center">
                          <div className="text-sm font-black text-white">{biz.activeUsers}</div>
                          <div className="text-[8px] text-slate-500 uppercase font-black tracking-tighter">Live Users</div>
                       </div>
                       <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center justify-center text-center">
                          <div className="text-sm font-black text-white">{biz.eventsCount}</div>
                          <div className="text-[8px] text-slate-500 uppercase font-black tracking-tighter">Events Today</div>
                       </div>
                       <div className="p-2.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex flex-col items-center justify-center text-center group-hover:bg-indigo-500/10 transition-colors">
                          <div className="flex items-center gap-3">
                             <div className="flex flex-col items-center">
                               <ThumbsUp size={12} className="text-emerald-500 mb-0.5" />
                               <span className="text-[11px] font-black text-emerald-400">{biz.bullVotes || 0}</span>
                             </div>
                             <div className="w-[1px] h-6 bg-white/10" />
                             <div className="flex flex-col items-center">
                               <ThumbsDown size={12} className="text-rose-500 mb-0.5" />
                               <span className="text-[11px] font-black text-rose-400">{biz.bearVotes || 0}</span>
                             </div>
                          </div>
                          <div className="text-[8px] text-indigo-400 uppercase font-black tracking-tighter mt-1">Sentiment</div>
                       </div>
                    </div>
                  </div>
                ))}

                <button className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-800 text-slate-600 font-bold text-sm hover:border-indigo-500/50 hover:text-indigo-400 transition-all flex flex-col items-center justify-center gap-2">
                   <div className="w-8 h-8 rounded-full border-2 border-dashed border-current flex items-center justify-center">
                     +
                   </div>
                   Add New Business Source
                </button>
              </div>
            </div>
          </div>
        </section>
        ) : activeTab === 'analytics' ? (
          <AnalyticsView summaries={summaries} />
        ) : (
          <NotificationsView events={events} />
        )}
      </main>

      {/* Floating Sound Hint if muted */}
      {!soundEnabled && showSoundHint && (
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="fixed bottom-8 right-8 z-[100] px-6 py-4 glass-card border-indigo-500/50 shadow-2xl shadow-indigo-500/20 max-w-xs"
        >
          <div className="flex items-start gap-4">
             <div className="p-3 bg-indigo-500 text-white rounded-2xl animate-glow">
                <Volume2 size={24} />
             </div>
             <div>
                <p className="text-sm font-bold">Sound Experience Ready</p>
                <p className="text-xs text-slate-400 mt-1">Activate audio to hear real-time sales and events.</p>
                <button 
                  onClick={() => setSoundEnabled(true)}
                  className="mt-3 px-4 py-2 bg-white text-black text-xs font-extrabold rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  ACTIVATE AUDIO
                </button>
             </div>
          </div>
        </motion.div>
      )}
      
      <NotificationToast lastEvent={lastEvent} />
    </div>
  );
};

export default App;
