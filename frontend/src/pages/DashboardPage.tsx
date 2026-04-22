import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import WaterProgressBar from '../components/WaterProgressBar';
import { spawnWaterRipple } from '../effects/waterButtonRipple';

interface UserProfile {
  name: string;
  pointsBalance: number;
}

interface AdStatus {
  watchedToday: number;
  limit: number;
  canWatch: boolean;
  resetAt: string;
}

const DashboardPage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [adStatus, setAdStatus] = useState<AdStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, statusRes] = await Promise.all([
          apiClient.get('/user/profile'),
          apiClient.get('/user/ad-status')
        ]);
        setProfile(profileRes.data);
        setAdStatus(statusRes.data);
      } catch (err) {
        console.error("Failed to load dashboard. Redirecting to login.");
        localStorage.removeItem('aqua_token');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  if (loading) {
    return <div className="p-6 flex justify-center items-center h-full"><span className="animate-pulse">Loading...</span></div>;
  }

  return (
    <div className="p-6 pb-24">
      <h1 className="text-2xl font-bold text-white mb-6">Hey {profile?.name?.split(' ')[0] || 'User'} 👋</h1>
      
      {/* Points Card */}
      <div className="glass-card p-6 mb-8 text-center bg-gradient-to-br from-primary/20 to-accent/10 border border-t-white/30 border-l-white/30 border-b-black/50 border-r-black/50">
        <p className="text-sm font-medium text-gray-300 mb-1">Your Balance</p>
        <p className="text-5xl font-extrabold text-white tracking-tight">{profile?.pointsBalance || 0}</p>
        <p className="text-xs text-accent mt-2 font-medium">Points available</p>
      </div>

      {/* Ad Progress */}
      <h2 className="text-lg font-bold mb-4">Today's Progress</h2>
      <div className="glass-card p-5 mb-8">
        <WaterProgressBar
          label="Ads Watched"
          value={adStatus?.watchedToday || 0}
          max={adStatus?.limit || 1}
        />

        <button
          onMouseDown={spawnWaterRipple}
          onClick={() => {
            if (!adStatus?.canWatch) {
              navigate('/limit-exceeded', { state: { resetAt: adStatus?.resetAt } });
              return;
            }
            navigate('/watch/random');
          }}
          className={[
            'water-btn w-full py-3 rounded-xl font-bold shadow-lg transition-all active:scale-95 mt-4',
            adStatus?.canWatch
              ? 'bg-primary text-white shadow-primary/30 hover:shadow-primary/50'
              : 'bg-red-500/20 text-red-200 shadow-red-500/10 hover:bg-red-500/25',
          ].join(' ')}
        >
          Watch Ad Now
        </button>

        {!adStatus?.canWatch && (
          <div className="text-center mt-3 text-xs text-gray-400">
            You can watch again at <span className="font-mono">{new Date(adStatus?.resetAt || '').toLocaleString()}</span>
          </div>
        )}
      </div>

    </div>
  );
};

export default DashboardPage;
