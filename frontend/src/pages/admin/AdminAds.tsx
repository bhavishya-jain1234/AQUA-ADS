import { useEffect, useMemo, useState } from 'react';
import apiClient from '../../api/apiClient';
import { spawnWaterRipple } from '../../effects/waterButtonRipple';

type Ad = {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl?: string | null;
  durationSeconds: number;
  rewardPoints: number;
  isActive: boolean;
  viewsCount: number;
  createdAt: string;
};

const AdminAds = () => {
  const token = localStorage.getItem('aqua_admin_token') || '';

  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [title, setTitle] = useState('');
  const [durationSeconds, setDurationSeconds] = useState<number>(15);
  const [rewardPoints, setRewardPoints] = useState<number>(10);
  const [file, setFile] = useState<File | null>(null);

  const canSubmit = useMemo(() => {
    return title.trim().length > 0 && durationSeconds > 0 && rewardPoints > 0 && !!file && !busy;
  }, [title, durationSeconds, rewardPoints, file, busy]);

  const fetchAds = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const { data } = await apiClient.get('/admin/ads', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAds(data);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to load ads.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUploadAndCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setBusy(true);
    setError('');
    setSuccess('');

    try {
      const form = new FormData();
      form.append('file', file);

      const uploadRes = await apiClient.post('/admin/ads/upload', form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const mediaUrl: string = uploadRes.data?.url;
      if (!mediaUrl) throw new Error('Upload did not return a URL.');

      await apiClient.post(
        '/admin/ads',
        {
          title: title.trim(),
          videoUrl: mediaUrl,
          durationSeconds,
          rewardPoints,
          isActive: true,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTitle('');
      setDurationSeconds(15);
      setRewardPoints(10);
      setFile(null);
      setSuccess('Ad uploaded and activated.');
      await fetchAds();
    } catch (e: any) {
      setError(e.response?.data?.error || e.message || 'Failed to upload ad.');
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (ad: Ad) => {
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await apiClient.patch(
        `/admin/ads/${ad.id}/active`,
        { isActive: !ad.isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(`Ad ${!ad.isActive ? 'activated' : 'deactivated'}.`);
      await fetchAds();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to update ad.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Ads Management</h2>
          <p className="text-sm text-gray-400">Upload an ad video and it will appear for users when they tap “Watch Ad Now”.</p>
        </div>
        <button
          onMouseDown={spawnWaterRipple}
          onClick={fetchAds}
          disabled={busy}
          className="water-btn px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm font-bold disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      {(error || success) && (
        <div
          className={[
            'p-3 rounded-xl border text-sm',
            error ? 'bg-red-500/10 border-red-500/30 text-red-300' : 'bg-green-500/10 border-green-500/30 text-green-300',
          ].join(' ')}
        >
          {error || success}
        </div>
      )}

      {/* Upload Card */}
      <div className="glass-card p-5">
        <h3 className="font-bold mb-3">Upload new ad</h3>
        <form onSubmit={handleUploadAndCreate} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ad title"
            className="w-full bg-black/30 border border-white/10 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />

          <input
            type="number"
            min={1}
            value={durationSeconds}
            onChange={(e) => setDurationSeconds(Number(e.target.value))}
            placeholder="Duration (seconds)"
            className="w-full bg-black/30 border border-white/10 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />

          <input
            type="number"
            min={1}
            value={rewardPoints}
            onChange={(e) => setRewardPoints(Number(e.target.value))}
            placeholder="Reward points"
            className="w-full bg-black/30 border border-white/10 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />

          <input
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full bg-black/30 border border-white/10 rounded-xl p-3"
            required
          />

          <button
            type="submit"
            onMouseDown={spawnWaterRipple}
            disabled={!canSubmit}
            className="water-btn md:col-span-2 w-full bg-primary text-white py-3 rounded-xl font-bold shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all active:scale-95 disabled:opacity-50"
          >
            {busy ? 'Uploading…' : 'Upload & Activate'}
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-3">
          Tip: videos are stored locally in `backend/uploads`. For production, we can switch this to Cloudinary/S3.
        </p>
      </div>

      {/* List */}
      <div className="glass-card p-5">
        <h3 className="font-bold mb-3">All ads</h3>

        {loading ? (
          <div className="animate-pulse text-gray-400">Loading ads…</div>
        ) : ads.length === 0 ? (
          <div className="text-gray-400 text-sm">No ads yet. Upload one above.</div>
        ) : (
          <div className="space-y-3">
            {ads.map((a) => (
              <div key={a.id} className="p-4 rounded-xl border border-white/10 bg-black/20 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold truncate">{a.title}</p>
                    <span className={['text-xs px-2 py-0.5 rounded-full border', a.isActive ? 'border-green-500/40 text-green-300 bg-green-500/10' : 'border-gray-500/30 text-gray-300 bg-white/5'].join(' ')}>
                      {a.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Duration: <span className="font-mono">{a.durationSeconds}s</span> · Reward: <span className="font-mono">{a.rewardPoints}</span> · Views: <span className="font-mono">{a.viewsCount}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1 truncate">{a.videoUrl}</p>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onMouseDown={spawnWaterRipple}
                    onClick={() => toggleActive(a)}
                    disabled={busy}
                    className={[
                      'water-btn px-3 py-2 rounded-xl text-xs font-bold disabled:opacity-50',
                      a.isActive ? 'bg-red-500/20 text-red-200 hover:bg-red-500/25' : 'bg-green-500/20 text-green-200 hover:bg-green-500/25',
                    ].join(' ')}
                  >
                    {a.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAds;

