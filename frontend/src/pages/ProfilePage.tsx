import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { supabase } from '../lib/supabaseClient';
import { spawnWaterRipple } from '../effects/waterButtonRipple';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  pointsBalance: number;
  _count: {
    adWatchSessions: number;
  };
  createdAt: string;
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await apiClient.get('/user/profile');
        setProfile(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    // Clear both app token and Supabase session (otherwise Login auto-signs-in again).
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore signOut errors; we still want to clear local tokens.
    }
    localStorage.removeItem('aqua_token');
    navigate('/login?mode=user', { replace: true });
  };

  return (
    <div className="p-6 pb-24 pt-12 text-white h-full">
      <h1 className="text-3xl font-extrabold mb-8 drop-shadow-lg">Profile</h1>
      
      {!profile ? (
        <div className="flex justify-center py-20"><span className="animate-pulse">Loading Profile...</span></div>
      ) : (
        <div className="space-y-6">
          <div className="glass-card p-6 flex items-center space-x-4">
             <div className="w-16 h-16 bg-gradient-to-tr from-primary to-accent rounded-full flex items-center justify-center text-2xl font-bold shadow-lg">
                {profile.name?.charAt(0) || 'U'}
             </div>
             <div>
               <p className="font-bold text-xl">{profile.name}</p>
               <p className="text-sm text-gray-400">{profile.email}</p>
             </div>
          </div>

          <div className="glass-card p-6 grid grid-cols-2 gap-4 text-center">
             <div className="border-r border-white/10">
               <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider font-bold">Lifetime Points</p>
               <p className="text-2xl font-bold text-primary">{profile.pointsBalance}</p>
             </div>
             <div>
               <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider font-bold">Ads Watched</p>
               <p className="text-2xl font-bold text-accent">{profile._count.adWatchSessions}</p>
             </div>
          </div>

          <div className="glass-card p-4 space-y-3">
             <h3 className="text-sm font-bold text-gray-300 pb-2 border-b border-white/10 mb-4">Account Settings</h3>
             <div className="flex justify-between items-center py-2 hover:bg-white/5 rounded-lg px-2 cursor-pointer transition-colors">
               <span className="text-sm">Notification Preferences</span>
               <span className="text-gray-500">&gt;</span>
             </div>
             <div className="flex justify-between items-center py-2 hover:bg-white/5 rounded-lg px-2 cursor-pointer transition-colors">
               <span className="text-sm">Privacy Policy</span>
               <span className="text-gray-500">&gt;</span>
             </div>
             <div className="flex justify-between items-center py-2 hover:bg-white/5 rounded-lg px-2 cursor-pointer transition-colors">
               <span className="text-sm">Terms of Service</span>
               <span className="text-gray-500">&gt;</span>
             </div>
          </div>

          <button 
            onMouseDown={spawnWaterRipple}
            onClick={handleLogout}
            className="water-btn mt-8 text-red-500 font-bold border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 rounded-xl px-4 py-4 w-full shadow-lg transition-all active:scale-95"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
