import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiClient from '../api/apiClient';
import { spawnWaterRipple } from '../effects/waterButtonRipple';

interface AdData {
  id: string;
  title: string;
  videoUrl: string;
  durationSeconds: number;
}

const AdWatchPage = () => {
  const navigate = useNavigate();
  const [ad, setAd] = useState<AdData | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const initSession = async () => {
      try {
        // 1. Fetch active ad
        const adRes = await apiClient.get('/ads/active');
        const activeAd = adRes.data;
        
        setAd(activeAd);
        setTimeLeft(activeAd.durationSeconds);
        setIsMuted(true);

        // 2. Start session lock on backend
        const sessionRes = await apiClient.post('/ads/start-session', { adId: activeAd.id });
        setSessionToken(sessionRes.data.sessionToken);
      } catch (err: any) {
        if (err?.response?.status === 429) {
          navigate('/limit-exceeded', { state: { resetAt: err.response?.data?.resetAt } });
          return;
        }
        setError(err.response?.data?.error || 'Failed to load ad session.');
      }
    };
    initSession();
  }, [navigate]);

  useEffect(() => {
    if (!ad || isVideoLoading || timeLeft <= 0 || !sessionToken) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          completeAdSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ad, isVideoLoading, sessionToken]);

  const completeAdSession = async () => {
    try {
      if (!sessionToken) return;
      await apiClient.post('/ads/complete', { sessionToken });
      
      // Navigate exactly as spec'd: direct to reward screen with session token.
      navigate(`/reward/${sessionToken}`);
    } catch (err) {
      setError('Failed to verify compilation with server. Refresh to try again.');
    }
  };

  const enableSound = async () => {
    try {
      const v = videoRef.current;
      if (!v) return;
      v.muted = false;
      v.volume = 1;
      setIsMuted(false);
      await v.play();
    } catch {
      // If the browser still blocks audio, user can try again.
    }
  };

  if (error) {
    return (
      <div className="h-screen flex flex-col justify-center items-center p-6 text-center">
        <div className="bg-red-500/10 border border-red-500 p-4 rounded-xl">
          <p className="text-red-400 font-bold mb-2">Error starting ad</p>
          <p className="text-sm text-gray-300">{error}</p>
        </div>
        <button onMouseDown={spawnWaterRipple} onClick={() => navigate('/dashboard')} className="water-btn mt-6 text-gray-400 underline px-3 py-2 rounded-lg">Return to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black relative flex justify-center items-center overflow-hidden">
      {/* Loading Overlay */}
      {!ad && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-black">
           <span className="animate-pulse text-primary font-bold">Locking Session...</span>
         </div>
      )}

      {/* Video Player */}
      {ad && (
        <video 
          ref={videoRef}
          src={ad.videoUrl}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          playsInline
          muted={isMuted} // Start muted; user can tap "Enable Sound" to unmute (browser requirement)
          onCanPlayThrough={() => {
            setIsVideoLoading(false);
            videoRef.current?.play();
          }}
        />
      )}

      {/* Enable sound overlay */}
      {ad && !isVideoLoading && isMuted && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute bottom-28 right-6 z-50"
        >
          <button
            onMouseDown={spawnWaterRipple}
            onClick={enableSound}
            className="water-btn glass-panel px-4 py-2 rounded-full text-sm font-bold border border-white/15 hover:bg-white/10 transition-all active:scale-95"
          >
            Tap to enable sound
          </button>
        </motion.div>
      )}

      {/* Countdown Overlay - Anti Skipping */}
      {ad && !isVideoLoading && (
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-12 right-6 glass-panel px-4 py-2 rounded-full z-50"
        >
          <p className="text-white font-mono font-bold tracking-widest text-sm">
            Reward in: {timeLeft}s
          </p>
        </motion.div>
      )}

      {/* Title Overlay */}
      {ad && (
        <div className="absolute bottom-12 left-6 z-50">
          <p className="text-xs text-gray-300 uppercase tracking-widest font-bold drop-shadow-md">Sponsored</p>
          <p className="text-xl font-bold text-white drop-shadow-xl">{ad.title}</p>
        </div>
      )}

      {isVideoLoading && ad && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <span className="animate-pulse text-white">Loading video cluster...</span>
        </div>
      )}
    </div>
  );
};

export default AdWatchPage;
