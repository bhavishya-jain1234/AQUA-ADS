import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { spawnWaterRipple } from '../effects/waterButtonRipple';

const RewardPage = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [time, setTime] = useState(new Date());

  // Real-time clock updating every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-screen p-6 flex flex-col items-center justify-center relative overflow-hidden bg-black">
      
      {/* Background Animated Gradients */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-20%] left-[-20%] w-96 h-96 bg-primary/20 rounded-full blur-3xl z-0"
      />
      <motion.div 
        animate={{ scale: [1, 1.5, 1], rotate: [0, -90, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-20%] right-[-20%] w-96 h-96 bg-accent/20 rounded-full blur-3xl z-0"
      />

      <motion.div 
        initial={{ y: 50, opacity: 0, scale: 0.8 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="z-10 flex flex-col items-center w-full"
      >
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 border border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
          <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>

        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-200 mb-2">Points Credited!</h1>
        <p className="text-gray-300 text-lg mb-10">yay! you get a free water bottle</p>
        
        {/* Anti-fraud live card */}
        <div className="glass-card w-full p-6 text-center mb-10 border-t-white/20 border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

          {/* Movable elements */}
          <motion.div
            className="absolute -top-6 -left-4 opacity-90"
            animate={{ y: [0, 10, 0], rotate: [-6, 6, -6] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden="true"
          >
            <svg width="86" height="120" viewBox="0 0 86 120" fill="none">
              <path
                d="M34 8c0-4 3-7 7-7h4c4 0 7 3 7 7v10c0 2 1 4 3 5 8 5 13 14 13 24v44c0 16-13 28-28 28S12 107 12 91V47c0-10 5-19 13-24 2-1 3-3 3-5V8z"
                fill="rgba(255,255,255,0.10)"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="2"
              />
              <path d="M20 74c8 10 18 14 33 12" stroke="rgba(0,200,255,0.55)" strokeWidth="4" strokeLinecap="round" />
              <path d="M18 58c10 12 22 16 40 13" stroke="rgba(0,200,255,0.35)" strokeWidth="4" strokeLinecap="round" />
              <path d="M34 12h18" stroke="rgba(255,255,255,0.25)" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </motion.div>

          <motion.div
            className="absolute -bottom-6 -right-6 opacity-80"
            animate={{ y: [0, -12, 0], x: [0, -6, 0] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden="true"
          >
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
              <path
                d="M60 10c14 18 30 35 30 55 0 17-13 30-30 30S30 82 30 65c0-20 16-37 30-55z"
                fill="rgba(0,200,255,0.18)"
                stroke="rgba(0,200,255,0.45)"
                strokeWidth="2"
              />
              <circle cx="78" cy="66" r="6" fill="rgba(255,255,255,0.20)" />
              <circle cx="48" cy="74" r="4" fill="rgba(255,255,255,0.16)" />
            </svg>
          </motion.div>
          
          <p className="text-5xl font-mono tracking-tighter text-white font-bold drop-shadow-md">
            {time.toLocaleTimeString('en-US', { hour12: false })}
          </p>
          <p className="text-sm font-medium text-accent mt-2 uppercase tracking-widest">
            {time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          
          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-[10px] text-gray-500 font-mono break-all leading-tight">Session Verification Token:<br />{sessionId}</p>
          </div>
        </div>

        <div className="w-full space-y-4">
          <button 
            onMouseDown={spawnWaterRipple}
            onClick={() => navigate('/wallet')} 
            className="water-btn bg-white text-black px-6 py-4 rounded-xl font-bold w-full shadow-lg hover:bg-gray-200 transition-all active:scale-95"
          >
            Go to Wallet
          </button>
          
          <button 
            onMouseDown={spawnWaterRipple}
            onClick={() => navigate('/dashboard')} 
            className="water-btn bg-transparent border border-white/20 text-white px-6 py-4 rounded-xl font-bold w-full hover:bg-white/5 transition-all active:scale-95"
          >
            Watch Another Ad
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default RewardPage;
