import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { spawnWaterRipple } from '../effects/waterButtonRipple';

function formatResetTime(resetAt?: string) {
  if (!resetAt) return '';
  const d = new Date(resetAt);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString();
}

const LimitExceededPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const resetAt = (location.state as any)?.resetAt as string | undefined;

  const subtitle = useMemo(() => {
    const t = formatResetTime(resetAt);
    return t ? `Try again after: ${t}` : 'Try again after 24 hours.';
  }, [resetAt]);

  return (
    <div className="h-screen flex items-center justify-center p-6 text-center relative overflow-hidden">
      {/* animated background blobs */}
      <motion.div
        className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-red-500/15 blur-3xl"
        animate={{ x: [0, 30, -10, 0], y: [0, 10, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-primary/15 blur-3xl"
        animate={{ x: [0, -20, 15, 0], y: [0, -25, -5, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* slide card */}
      <motion.div
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 16 }}
        className="glass-panel p-6 w-full max-w-sm z-10 border border-red-500/25"
      >
        <motion.p
          className="text-red-300 font-extrabold text-2xl tracking-tight"
          animate={{ x: [0, -6, 6, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          your limit is Exceeded now you can watch ads after 24 hours
        </motion.p>

        <p className="text-sm text-gray-300 mt-3">{subtitle}</p>

        <div className="mt-6 space-y-2">
          <button
            onMouseDown={spawnWaterRipple}
            onClick={() => navigate('/dashboard', { replace: true })}
            className="water-btn w-full bg-white text-black py-3 rounded-xl font-bold shadow-lg hover:bg-gray-200 transition-all active:scale-95"
          >
            Back to Dashboard
          </button>
          <button
            onMouseDown={spawnWaterRipple}
            onClick={() => window.location.reload()}
            className="water-btn w-full bg-white/10 text-white py-3 rounded-xl font-bold border border-white/10 hover:bg-white/15 transition-all active:scale-95"
          >
            Refresh
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default LimitExceededPage;

