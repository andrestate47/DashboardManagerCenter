import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Bell } from 'lucide-react';
import type { BusinessEvent } from '../useUniHub';

interface Props {
  lastEvent: BusinessEvent | null;
}

export const NotificationToast: React.FC<Props> = ({ lastEvent }) => {
  const [show, setShow] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<BusinessEvent | null>(null);

  useEffect(() => {
    if (lastEvent) {
      setCurrentEvent(lastEvent);
      setShow(true);
      const timer = setTimeout(() => setShow(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [lastEvent]);

  if (!currentEvent) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] w-full max-w-md px-4"
        >
          <div className="glass-card p-4 flex items-center gap-4 border-2 border-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.2)]">
            <div className={`p-3 rounded-2xl ${currentEvent.type === 'SALE' ? 'bg-emerald-500 text-white animate-bounce' : 'bg-indigo-500 text-white'}`}>
              {currentEvent.type === 'SALE' ? <DollarSign size={24} /> : <Bell size={24} />}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                  {currentEvent.businessName} Signal
                </span>
                <span className="text-[10px] text-slate-500">Just now</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-white mt-0.5">{currentEvent.message}</p>
                {currentEvent.count && currentEvent.count > 1 && (
                  <div className="px-2 py-0.5 bg-indigo-500 text-white text-[10px] font-black rounded-lg shadow-lg shrink-0">
                    x{currentEvent.count}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
