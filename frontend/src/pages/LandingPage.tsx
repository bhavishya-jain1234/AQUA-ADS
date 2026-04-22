import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { spawnWaterRipple } from '../effects/waterButtonRipple';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen items-center justify-center p-6 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-primary/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-accent/30 rounded-full blur-3xl"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 text-center"
      >
        <h1 className="text-5xl font-extrabold mb-2 tracking-tight">
          AQUA_<span className="text-primary">ADS</span>
        </h1>
        <p className="text-gray-400 mb-10 text-lg">Scan. Watch. Drink. Free.</p>
        <div className="wave-divider" aria-hidden="true">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path
              d="M0,72 C180,120 300,14 530,52 C730,85 860,18 1200,68 L1200,120 L0,120 Z"
              fill="url(#landingDividerOne)"
            />
            <defs>
              <linearGradient id="landingDividerOne" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#001F5B" />
                <stop offset="70%" stopColor="#020B18" />
                <stop offset="100%" stopColor="#000000" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Explainers */}
        <div className="space-y-6 mb-12 text-left">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">1</div>
            <p className="text-sm font-medium">Scan QR Code on Bottle</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">2</div>
            <p className="text-sm font-medium">Watch short 15s ads</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">3</div>
            <p className="text-sm font-medium">Get Free Water & Rewards</p>
          </div>
        </div>
        <div className="wave-divider" aria-hidden="true">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path
              d="M0,46 C250,5 320,94 620,68 C870,42 980,112 1200,52 L1200,120 L0,120 Z"
              fill="url(#landingDividerTwo)"
            />
            <defs>
              <linearGradient id="landingDividerTwo" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#000000" />
                <stop offset="45%" stopColor="#001F5B" />
                <stop offset="100%" stopColor="#020B18" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <button 
          onMouseDown={spawnWaterRipple}
          onClick={() => navigate('/login')}
          className="water-btn w-full bg-gradient-to-r from-primary to-accent text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all active:scale-95"
        >
          Get Started
        </button>
      </motion.div>
    </div>
  );
};

export default LandingPage;
