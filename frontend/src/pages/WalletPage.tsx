import { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';

interface Transaction {
  type: 'earned' | 'spent';
  points: number;
  title: string;
  date: string;
}

const WalletPage = () => {
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const { data } = await apiClient.get('/user/wallet');
        setBalance(data.balance);
        
        const allHistory = [...data.history.earned, ...data.history.spent]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setHistory(allHistory);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWallet();
  }, []);

  if (loading) {
    return <div className="p-6 flex justify-center items-center h-full"><span className="animate-pulse">Loading Wallet...</span></div>;
  }

  return (
    <div className="p-6 pb-24">
      <h1 className="text-2xl font-bold mb-6">Wallet</h1>
      
      <div className="glass-card p-6 mb-8 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
        <p className="text-sm font-medium text-gray-300 mb-1 z-10 relative">Total Balance</p>
        <p className="text-5xl font-extrabold text-accent z-10 relative">{balance}</p>
      </div>
      
      <h2 className="text-lg font-bold mb-4">Transaction History</h2>
      {history.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No transactions yet.</p>
      ) : (
        <div className="space-y-3">
          {history.map((tx, idx) => (
            <div key={idx} className="glass-card p-4 flex justify-between items-center transition-all hover:bg-white/5">
              <div>
                <p className="font-bold text-sm">{tx.title}</p>
                <p className="text-[10px] text-gray-400 mt-1">{new Date(tx.date).toLocaleString()}</p>
              </div>
              <p className={`font-bold ${tx.type === 'earned' ? 'text-green-400' : 'text-red-400'}`}>
                {tx.type === 'earned' ? '+' : '-'}{tx.points}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WalletPage;
