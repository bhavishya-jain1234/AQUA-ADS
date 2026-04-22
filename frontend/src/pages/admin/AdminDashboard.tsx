import { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';

interface Stats {
  totalUsers: number;
  totalAdsWatched: number;
  totalPointsDistributed: number;
  totalRedemptions: number;
  activeUsersToday: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('aqua_admin_token');
        const { data } = await apiClient.get('/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(data);
      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="animate-pulse">Loading Platform Stats...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Platform Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6">
          <p className="text-sm text-gray-400 font-bold uppercase tracking-wider mb-2">Total Users</p>
          <p className="text-4xl font-extrabold text-white">{stats?.totalUsers || 0}</p>
        </div>
        
        <div className="glass-card p-6">
          <p className="text-sm text-gray-400 font-bold uppercase tracking-wider mb-2">Ads Watched</p>
          <p className="text-4xl font-extrabold text-accent">{stats?.totalAdsWatched || 0}</p>
        </div>
        
        <div className="glass-card p-6">
          <p className="text-sm text-gray-400 font-bold uppercase tracking-wider mb-2">Points Distributed</p>
          <p className="text-4xl font-extrabold text-green-400">{stats?.totalPointsDistributed || 0}</p>
        </div>
        
        <div className="glass-card p-6">
          <p className="text-sm text-gray-400 font-bold uppercase tracking-wider mb-2">Active Today</p>
          <p className="text-4xl font-extrabold text-primary">{stats?.activeUsersToday || 0}</p>
        </div>
        
        <div className="glass-card p-6 lg:col-span-2">
          <p className="text-sm text-gray-400 font-bold uppercase tracking-wider mb-2">Water Bottles Redeemed</p>
          <p className="text-4xl font-extrabold text-white">{stats?.totalRedemptions || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
