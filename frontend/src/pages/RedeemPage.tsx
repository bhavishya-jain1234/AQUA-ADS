import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import apiClient from '../api/apiClient';
import { spawnWaterRipple } from '../effects/waterButtonRipple';

interface RedemptionResponse {
  code: string;
  expiresAt: string;
  pointsRemaining: number;
}

const RedeemPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [redemption, setRedemption] = useState<RedemptionResponse | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  const handleRedeem = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await apiClient.post('/redeem');
      setRedemption({
        code: data.code,
        expiresAt: data.expiresAt,
        pointsRemaining: data.pointsRemaining,
      });
      
      const expiry = new Date(data.expiresAt).getTime();
      const now = new Date().getTime();
      setTimeLeft(Math.floor((expiry - now) / 1000));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to redeem points. Ensure you have at least 40 points.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!redemption || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [redemption, timeLeft]);

  return (
    <div className="p-6 pb-24 h-full flex flex-col pt-12">
      <h1 className="text-3xl font-extrabold mb-8 flex items-center shadow-primary/20 drop-shadow-lg">
        Claim Rewards <span className="ml-2">🎁</span>
      </h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-300 p-3 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      {!redemption ? (
        <div className="glass-card p-6 text-center transform transition-all hover:scale-[1.02]">
          <div className="w-16 h-16 bg-accent/20 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">1 Free Water Bottle</h2>
          <p className="text-gray-400 text-sm mb-6">Scan QR code at any partnered vendor location to claim your bottle.</p>
          <div className="flex justify-between items-center bg-black/40 rounded-lg p-3 mb-6">
            <span className="text-sm font-medium text-gray-300">Cost:</span>
            <span className="text-lg font-bold text-primary">40 Points</span>
          </div>
          <button 
            onMouseDown={spawnWaterRipple}
            onClick={handleRedeem}
            disabled={loading}
            className="water-btn bg-gradient-to-r from-primary to-accent text-white px-8 py-4 rounded-xl font-bold w-full shadow-lg shadow-primary/30 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Redeem Now'}
          </button>
        </div>
      ) : timeLeft > 0 ? (
        <div className="glass-card p-6 text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl -translate-y-10"></div>
          
          <h2 className="text-lg font-bold text-white z-10 relative">Show this QR to the vendor</h2>
          
          <div className="bg-white p-4 rounded-xl inline-block mx-auto relative z-10 shadow-xl shadow-white/10">
             <QRCodeSVG value={redemption.code} size={200} />
          </div>
          
          <div className="z-10 relative">
            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Redemption Code</p>
            <p className="text-2xl font-mono text-accent bg-black/40 py-2 rounded-lg font-bold tracking-widest">{redemption.code}</p>
          </div>

          <div className="border-t border-white/10 pt-4 z-10 relative">
            <p className="text-sm text-gray-400 mb-1">Time remaining to scan:</p>
            <p className="text-3xl font-mono text-white font-extrabold">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</p>
          </div>
        </div>
      ) : (
        <div className="glass-card p-8 text-center border border-red-500/30">
          <div className="w-16 h-16 bg-red-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-red-500 text-2xl font-bold">!</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Code Expired</h2>
          <p className="text-sm text-gray-400 mb-6">This redemption code is no longer valid. You must generate a new one.</p>
          <button 
            onMouseDown={spawnWaterRipple}
            onClick={() => setRedemption(null)}
            className="water-btn w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-all"
          >
            Generate New Code
          </button>
        </div>
      )}
    </div>
  );
};

export default RedeemPage;
