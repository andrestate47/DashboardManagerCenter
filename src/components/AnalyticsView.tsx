import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
  PieChart, Pie, Cell,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { Download, Filter, TrendingUp, Users, Target, Zap, Shield, Cpu } from 'lucide-react';
import type { BusinessSummary } from '../useUniHub';

interface AnalyticsProps {
  summaries: Record<string, BusinessSummary>;
}

const COLORS = ['#f43f5e', '#6366f1', '#a855f7', '#10b981', '#f59e0b'];

export const AnalyticsView: React.FC<AnalyticsProps> = ({ summaries }) => {
  const [timeRange, setTimeRange] = useState('30D');
  const robotina = summaries['Robotina'] || { name: 'Robotina', revenue: 0, eventsCount: 0, activeUsers: 0, color: '#f43f5e' };

  // Generate realistic historical data based on current revenue
  const revenueData = useMemo(() => {
    const baseRev = robotina.revenue / 30;
    return Array.from({ length: 30 }, (_, i) => ({
      name: `Day ${i + 1}`,
      Robotina: robotina.revenue > 0 
        ? Math.floor(baseRev * (0.8 + Math.random() * 0.4)) 
        : 0,
    }));
  }, [robotina.revenue]);

  const trafficData = [
    { name: 'Mon', organic: 1200, bot: 400, api: 800 },
    { name: 'Tue', organic: 1500, bot: 300, api: 900 },
    { name: 'Wed', organic: 1100, bot: 500, api: 1200 },
    { name: 'Thu', organic: 1800, bot: 200, api: 1100 },
    { name: 'Fri', organic: 2100, bot: 400, api: 1500 },
    { name: 'Sat', organic: 1600, bot: 100, api: 800 },
    { name: 'Sun', organic: 1400, bot: 150, api: 700 },
  ];

  const performanceData = [
    { subject: 'Win Rate', A: robotina.winRate || 0, fullMark: 100 },
    { subject: 'Analyses', A: Math.min(100, (robotina.totalAnalyses || 0) / 10), fullMark: 100 },
    { subject: 'Uptime', A: 99.9, fullMark: 100 },
    { subject: 'Conversion', A: 88, fullMark: 100 },
    { subject: 'API Speed', A: 95, fullMark: 100 },
    { subject: 'Data Integrity', A: 100, fullMark: 100 },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-4 !bg-[#050505]/80 !border-[#333] shadow-2xl">
          <p className="font-bold text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-sm text-slate-300">{entry.name}:</span>
              <span className="font-bold text-white text-sm">
                {entry.name === 'Win Rate' ? `${entry.value}%` : entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-8 space-y-8"
    >
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-rose-400 via-indigo-400 to-purple-400">
            Robotina Intel Dashboard
          </h2>
          <p className="text-sm text-slate-400 mt-1">Advanced AI analytics and performance metrics for Robotina Ecosystem.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white/5 p-1 rounded-xl">
            {['7D', '30D', '3M', '1Y'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  timeRange === range 
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-all border border-white/5">
            <Filter size={16} /> Filters
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 text-white text-sm font-medium transition-all hover:bg-rose-600 shadow-lg shadow-rose-500/25">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* Primary Chart: Massive Area Chart */}
      <div className="glass-card p-6 border-rose-500/10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="text-rose-400" size={24} />
              Robotina Revenue Growth
            </h3>
            <p className="text-xs text-slate-400">Projected revenue based on current active subscriptions</p>
          </div>
          <div className="text-right">
             <div className="text-3xl font-black tracking-tight">${robotina.revenue.toLocaleString()}.00</div>
             <p className="text-emerald-400 text-sm font-bold">Real-time Performance</p>
          </div>
        </div>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRobotina" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Robotina" stroke="#f43f5e" strokeWidth={4} fillOpacity={1} fill="url(#colorRobotina)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Secondary Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Radar Performance */}
        <div className="glass-card p-6 flex flex-col items-center justify-center">
          <div className="w-full mb-2">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Cpu className="text-amber-400" size={20} />
              Neural Health
            </h3>
            <p className="text-xs text-slate-400">AI model and infrastructure performance</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={performanceData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Robotina IA" dataKey="A" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.4} />
                <Tooltip wrapperStyle={{ background: '#050505', border: 'none', borderRadius: '8px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Traffic Sources Bar Chart */}
        <div className="glass-card p-6 lg:col-span-2">
          <div className="mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Users className="text-sky-400" size={20} />
              User Interaction Hub
            </h3>
            <p className="text-xs text-slate-400">Traffic types over the last week</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trafficData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: 'rgba(18,18,18,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', opacity: 0.8 }} />
                <Bar dataKey="organic" stackId="a" fill="#f43f5e" radius={[0, 0, 4, 4]} />
                <Bar dataKey="api" stackId="a" fill="#6366f1" />
                <Bar dataKey="bot" stackId="a" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Tertiary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Dynamic Pie */}
        <div className="glass-card p-6 flex flex-col">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
            <Target className="text-rose-400" size={20} />
            Subscription Share
          </h3>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'PRO', value: 70 },
                    { name: 'Elite', value: 20 },
                    { name: 'Free', value: 10 }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill="#f43f5e" />
                  <Cell fill="#6366f1" />
                  <Cell fill="#a855f7" />
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'rgba(18,18,18,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
               <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Health</span>
               <span className="text-xl font-bold">Stable</span>
            </div>
          </div>
        </div>

        {/* Top Plans */}
        <div className="glass-card p-6 lg:col-span-2">
           <h3 className="text-lg font-bold mb-6">Robotina Active Plans</h3>
           <div className="space-y-4">
              {[
                { name: 'Robotina PRO (Monthly)', users: robotina.proUsers || 0, revenue: (robotina.proUsers || 0) * 49, trend: '+15%', color: '#f43f5e' },
                { name: 'Robotina ELITE (Annual)', users: robotina.eliteUsers || 0, revenue: (robotina.eliteUsers || 0) * 99, trend: '+5%', color: '#6366f1' },
                { name: 'Free Users', users: robotina.activeUsers - (robotina.proUsers || 0) - (robotina.eliteUsers || 0), revenue: 0, trend: 'Stable', color: '#a855f7' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg" style={{ backgroundColor: `${item.color}20`, color: item.color }}>
                        <Shield size={18} />
                      </div>
                      <div>
                         <h4 className="font-bold text-sm text-white">{item.name}</h4>
                         <p className="text-xs text-slate-400">{item.users} active members</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <div className="font-bold text-white">${item.revenue.toLocaleString()}</div>
                      <div className="text-xs text-emerald-400 font-medium">{item.trend}</div>
                   </div>
                </div>
              ))}
           </div>
        </div>

      </div>

    </motion.div>
  );
};
