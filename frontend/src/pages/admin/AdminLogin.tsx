import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { spawnWaterRipple } from '../../effects/waterButtonRipple';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await apiClient.post('/admin/login', { username, password });
      localStorage.setItem('aqua_admin_token', data.token);
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="h-screen flex items-center justify-center p-4">
      <div className="glass-card p-8 w-full max-w-sm">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">AQUA_ADS Admin</h2>
        
        {error && <div className="text-red-400 bg-red-400/10 p-3 rounded mb-4 text-sm text-center border border-red-500/20">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-gray-800 text-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-800 text-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
          <button type="submit" onMouseDown={spawnWaterRipple} className="water-btn w-full bg-primary hover:bg-blue-600 text-white p-3 rounded font-bold transition-all">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
