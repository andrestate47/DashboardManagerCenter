import { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Howl } from 'howler';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;


export type EventType = 'SALE' | 'USER_JOIN' | 'COMMENT' | 'ALERT' | 'MILESTONE';

export type BusinessEvent = {
  id: string;
  businessName: string;
  type: EventType;
  message: string;
  amount?: number;
  timestamp: Date;
  metadata?: any;
  userIdentifier?: string;
  count?: number;
};

export type BusinessSummary = {
  name: string;
  revenue: number;
  eventsCount: number;
  activeUsers: number;
  status: 'online' | 'offline';
  color: string;
  totalAnalyses?: number;
  winRate?: number;
  proUsers?: number;
  eliteUsers?: number;
  bullVotes: number;
  bearVotes: number;
};

export type DailySnapshot = {
  events: BusinessEvent[];
  summaries: Record<string, BusinessSummary>;
};

const CHACHING_PATH = 'https://assets.mixkit.co/active_storage/sfx/2012/2012-preview.mp3';
const NOTIFICATION_PATH = 'https://assets.mixkit.co/active_storage/sfx/600/600-preview.mp3';

const getTodayKey = () => new Date().toISOString().split('T')[0];

const INITIAL_SUMMARIES: Record<string, BusinessSummary> = {
  'Robotina': { 
    name: 'Robotina', 
    revenue: 0, 
    eventsCount: 0, 
    activeUsers: 0, 
    status: 'online', 
    color: '#f43f5e',
    bullVotes: 0,
    bearVotes: 0
  },
};

export const useUniHub = () => {
  const [selectedDate, setSelectedDate] = useState(getTodayKey());
  const [history, setHistory] = useState<Record<string, DailySnapshot>>(() => {
    try {
      const saved = localStorage.getItem('unihub_history_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Convertir strings de fechas de vuelta a objetos Date
        Object.keys(parsed).forEach(date => {
          parsed[date].events = parsed[date].events.map((e: any) => ({
            ...e,
            timestamp: new Date(e.timestamp)
          }));
        });
        return parsed;
      }
    } catch (e) {
      console.warn("Error leyendo historial", e);
    }
    return {
      [getTodayKey()]: { events: [], summaries: INITIAL_SUMMARIES }
    };
  });

  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('unihub_sound');
      return saved === 'true';
    } catch (e) {
      return false;
    }
  });

  // Datos actuales derivados de la fecha seleccionada
  const currentSnapshot = history[selectedDate] || { events: [], summaries: INITIAL_SUMMARIES };
  const events = currentSnapshot.events;
  const summaries = currentSnapshot.summaries;

  // Persistencia del historial
  useEffect(() => {
    localStorage.setItem('unihub_history_v3', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('unihub_sound', soundEnabled.toString());
  }, [soundEnabled]);

  const saleSound = new Howl({ src: [CHACHING_PATH] });
  const notifySound = new Howl({ src: [NOTIFICATION_PATH] });

  const addEvent = useCallback((event: BusinessEvent) => {
    const today = getTodayKey();
    
    setHistory(prev => {
      const dayData = prev[today] || { events: [], summaries: INITIAL_SUMMARIES };
      const dayEvents = [...dayData.events];
      const daySummaries = { ...dayData.summaries };

      // 1. Agrupación de eventos
      const existingIndex = dayEvents.findIndex(e => 
        e.type === event.type && 
        e.userIdentifier === event.userIdentifier && 
        e.businessName === event.businessName &&
        event.type === 'ALERT'
      );

      if (existingIndex !== -1) {
        const lastEvent = dayEvents[existingIndex];
        dayEvents[existingIndex] = {
          ...lastEvent,
          count: (lastEvent.count || 1) + 1,
          timestamp: event.timestamp,
          message: event.message,
          metadata: {
            ...event.metadata,
            groupedIds: [...(lastEvent.metadata?.groupedIds || []), event.id]
          }
        };
      } else {
        dayEvents.unshift({ ...event, count: 1 });
      }

      // 2. Actualizar resumen del día
      const bizSummary = daySummaries[event.businessName] || INITIAL_SUMMARIES[event.businessName];
      daySummaries[event.businessName] = {
        ...bizSummary,
        revenue: event.type === 'SALE' ? bizSummary.revenue + (event.amount || 0) : bizSummary.revenue,
        eventsCount: bizSummary.eventsCount + 1,
      };

      return {
        ...prev,
        [today]: {
          events: dayEvents.slice(0, 100),
          summaries: daySummaries
        }
      };
    });

    if (soundEnabled && today === getTodayKey()) {
      if (event.type === 'SALE') {
        saleSound.play();
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#6366f1', '#a855f7', '#ffffff'] });
      } else {
        notifySound.play();
      }
    }
  }, [soundEnabled]);

  const userMapRef = useRef<Record<string, { email: string, plan: string }>>({});
  const hasFetchedHistoryRef = useRef(false);

  // Polling de Robotina (Solo actualiza "Hoy")
  useEffect(() => {
    const fetchRobotinaMetrics = async () => {
      try {
        const response = await fetch("https://robotina-ia.com/api/admin/metrics", {
          method: "GET",
          headers: { "x-api-key": import.meta.env.VITE_ROBOTINA_API_KEY || "ROBOTINA_MASTER_KEY_2026" }
        });

        if (!response.ok) throw new Error("API Error");
        const data = await response.json();
        const today = getTodayKey();

        if (data.userMap) userMapRef.current = data.userMap;

        // 1. Cargar el historial de Supabase una sola vez al iniciar
        if (supabase && !hasFetchedHistoryRef.current && data.userMap) {
          hasFetchedHistoryRef.current = true;
          
          const dateLimit = new Date();
          dateLimit.setDate(dateLimit.getDate() - 14);
          
          const { data: analyses, error: analError } = await supabase
            .from('analyses')
            .select('id, status, created_at, user_id, symbol')
            .gte('created_at', dateLimit.toISOString())
            .order('created_at', { ascending: false });

          if (!analError && analyses) {
            const tempHistory: Record<string, DailySnapshot> = {};
            
            analyses.forEach(anal => {
              const analDate = new Date(anal.created_at);
              const dateKey = analDate.toISOString().split('T')[0];
              
              if (!tempHistory[dateKey]) {
                tempHistory[dateKey] = {
                  events: [],
                  summaries: {
                    'Robotina': {
                      name: 'Robotina',
                      revenue: 0,
                      eventsCount: 0,
                      activeUsers: 0,
                      status: 'online',
                      color: '#f43f5e',
                      bullVotes: 0,
                      bearVotes: 0,
                      totalAnalyses: 0,
                      winRate: 0
                    }
                  }
                };
              }
              
              const userData = data.userMap[anal.user_id] || { email: 'Usuario', plan: 'gratis' };
              const event: BusinessEvent = {
                id: anal.id,
                businessName: 'Robotina',
                type: 'ALERT',
                userIdentifier: userData.email || 'Usuario',
                message: `Análisis de IA para ${anal.symbol}`,
                timestamp: analDate,
                metadata: { plan: userData.plan || 'gratis', symbol: anal.symbol, status: anal.status || 'pending' }
              };
              
              const dayEvents = tempHistory[dateKey].events;
              const existingIndex = dayEvents.findIndex(e => 
                e.type === event.type && 
                e.userIdentifier === event.userIdentifier && 
                e.businessName === event.businessName &&
                event.type === 'ALERT'
              );
              
              if (existingIndex !== -1) {
                const lastEvent = dayEvents[existingIndex];
                dayEvents[existingIndex] = {
                  ...lastEvent,
                  count: (lastEvent.count || 1) + 1,
                  metadata: {
                    ...event.metadata,
                    groupedIds: [...(lastEvent.metadata?.groupedIds || []), event.id]
                  }
                };
              } else {
                dayEvents.push({ ...event, count: 1 });
              }
              
              const summary = tempHistory[dateKey].summaries['Robotina'];
              summary.eventsCount++;
              if (anal.status === 'bullish') summary.bullVotes++;
              if (anal.status === 'bearish') summary.bearVotes++;
            });
            
            // Calcular métricas adicionales por día
            Object.keys(tempHistory).forEach(dateKey => {
              const dayAnalyses = analyses.filter(a => new Date(a.created_at).toISOString().split('T')[0] === dateKey);
              const uniqueUsers = new Set(dayAnalyses.map(a => a.user_id).filter(Boolean));
              const dayWins = dayAnalyses.filter(a => a.status === 'win').length;
              const dayLosses = dayAnalyses.filter(a => a.status === 'loss').length;
              
              const summary = tempHistory[dateKey].summaries['Robotina'];
              summary.activeUsers = uniqueUsers.size;
              summary.totalAnalyses = dayAnalyses.length;
              summary.winRate = dayWins + dayLosses > 0 
                ? Math.round((dayWins / (dayWins + dayLosses)) * 100)
                : 0;
            });
            
            // Guardar en el historial
            setHistory(prev => {
              const merged = { ...prev };
              Object.keys(tempHistory).forEach(dateKey => {
                if (dateKey === today) {
                  // Para el día de hoy, fusionamos con los eventos ya capturados en memoria
                  const existingEvents = merged[dateKey]?.events || [];
                  const existingIds = new Set(existingEvents.map(e => e.id));
                  const newEvents = tempHistory[dateKey].events.filter(e => !existingIds.has(e.id));
                  
                  merged[dateKey] = {
                    events: [...existingEvents, ...newEvents].slice(0, 100),
                    summaries: {
                      ...merged[dateKey]?.summaries,
                      'Robotina': {
                        ...merged[dateKey]?.summaries?.['Robotina'],
                        ...tempHistory[dateKey].summaries['Robotina'],
                        // Conservar métricas generales de hoy
                        activeUsers: data.users?.total || tempHistory[dateKey].summaries['Robotina'].activeUsers,
                        bullVotes: data.performance?.bull_votes || tempHistory[dateKey].summaries['Robotina'].bullVotes,
                        bearVotes: data.performance?.bear_votes || tempHistory[dateKey].summaries['Robotina'].bearVotes,
                      }
                    }
                  };
                } else {
                  merged[dateKey] = tempHistory[dateKey];
                }
              });
              return merged;
            });
          }
        }

        // 2. Actualizar el resumen general de hoy
        setHistory(prev => {
          const currentDay = prev[today] || { events: [], summaries: INITIAL_SUMMARIES };
          return {
            ...prev,
            [today]: {
              ...currentDay,
              summaries: {
                ...currentDay.summaries,
                'Robotina': {
                  ...currentDay.summaries['Robotina'],
                  status: 'online',
                  activeUsers: data.users?.total || currentDay.summaries['Robotina'].activeUsers,
                  totalAnalyses: data.performance?.total_analyses || 0,
                  winRate: data.performance?.win_rate || 0,
                  proUsers: data.users?.subscriptions?.pro || 0,
                  eliteUsers: data.users?.subscriptions?.elite || 0,
                  bullVotes: data.performance?.bull_votes || 0,
                  bearVotes: data.performance?.bear_votes || 0,
                }
              }
            }
          };
        });

      } catch (error) {
        setHistory(prev => ({
          ...prev,
          [getTodayKey()]: { 
            ...prev[getTodayKey()], 
            summaries: { ...prev[getTodayKey()].summaries, 'Robotina': { ...prev[getTodayKey()].summaries['Robotina'], status: 'offline' } } 
          }
        }));
      }
    };

    fetchRobotinaMetrics();
    const interval = setInterval(fetchRobotinaMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  // Realtime Subscriptions (Siempre apuntan a "Hoy")
  useEffect(() => {
    if (!supabase) return;
    let isCancelled = false;
    let subs: any[] = [];

    const pSub = supabase.channel('usuarios').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'perfiles' }, (payload: any) => {
      addEvent({
        id: payload.new.id,
        businessName: 'Robotina',
        type: 'USER_JOIN',
        message: `Nuevo registro en Robotina`,
        timestamp: new Date()
      });
    }).subscribe();

    const pgSub = supabase.channel('ventas').on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'perfiles', filter: 'plan=eq.pro' }, (payload: any) => {
      addEvent({
        id: 'sale-' + payload.new.id + Date.now(),
        businessName: 'Robotina',
        type: 'SALE',
        message: `¡Suscripción PRO adquirida!`,
        amount: 49,
        timestamp: new Date(),
      });
    }).subscribe();

    const aSub = supabase.channel('analisis').on('postgres_changes', { event: '*', schema: 'public', table: 'analyses' }, (payload: any) => {
      const today = getTodayKey();
      if (payload.eventType === 'INSERT') {
        const userData = userMapRef.current[payload.new.user_id];
        addEvent({
          id: payload.new.id,
          businessName: 'Robotina',
          type: 'ALERT',
          userIdentifier: userData?.email || 'Usuario',
          message: `Análisis de IA para ${payload.new.symbol}`,
          timestamp: new Date(),
          metadata: { plan: userData?.plan || 'gratis', symbol: payload.new.symbol, status: payload.new.status || 'pending' }
        });
      } else if (payload.eventType === 'UPDATE') {
        setHistory(prev => {
          if (!prev[today]) return prev;
          
          const newStatus = payload.new.status;
          const oldStatus = payload.old?.status;
          
          // Solo actualizamos si el status realmente cambió a algo relevante
          const summaries = { ...prev[today].summaries };
          const biz = { ...summaries['Robotina'] };
          
          if (newStatus !== oldStatus) {
             // Si antes era algo y ahora es bullish, sumamos
             if (newStatus === 'bullish') biz.bullVotes++;
             if (newStatus === 'bearish') biz.bearVotes++;
             
             // Si cambiamos de uno a otro, restamos el anterior (opcional pero más exacto)
             if (oldStatus === 'bullish' && biz.bullVotes > 0) biz.bullVotes--;
             if (oldStatus === 'bearish' && biz.bearVotes > 0) biz.bearVotes--;
          }

          return {
            ...prev,
            [today]: {
              ...prev[today],
              summaries: { ...summaries, 'Robotina': biz },
              events: prev[today].events.map(ev => (ev.id === payload.new.id || ev.metadata?.groupedIds?.includes(payload.new.id)) ? { ...ev, metadata: { ...ev.metadata, status: payload.new.status } } : ev)
            }
          };
        });
      }
    }).subscribe();

    subs = [pSub, pgSub, aSub];

    return () => {
      isCancelled = true;
      subs.forEach(s => supabase.removeChannel(s));
    };
  }, [addEvent]);

  const resetBusinessData = useCallback((businessName: string) => {
    const today = getTodayKey();
    setHistory(prev => ({
      ...prev,
      [today]: {
        events: prev[today].events.filter(e => e.businessName !== businessName),
        summaries: {
          ...prev[today].summaries,
          [businessName]: { ...INITIAL_SUMMARIES[businessName], name: businessName }
        }
      }
    }));
  }, []);

  return {
    events,
    summaries,
    soundEnabled,
    setSoundEnabled,
    lastEvent: events[0] || null,
    resetBusinessData,
    selectedDate,
    setSelectedDate,
    historyDates: Object.keys(history).sort().reverse()
  };
};
