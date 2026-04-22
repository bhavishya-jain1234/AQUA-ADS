const WaterProgressBar = ({ value = 0, max = 1, label = 'Progress' }) => {
  const clampedMax = max > 0 ? max : 1;
  const clampedValue = Math.min(Math.max(value, 0), clampedMax);
  const percentage = (clampedValue / clampedMax) * 100;

  return (
    <div className="water-progress-card">
      <div className="water-progress-header">
        <p className="text-sm text-gray-300">{label}</p>
        <p className="font-bold">{clampedValue} / {clampedMax}</p>
      </div>

      <div className="water-progress-shell" role="progressbar" aria-valuemin={0} aria-valuemax={clampedMax} aria-valuenow={clampedValue}>
        <div className="water-progress-fill" style={{ transform: `scaleX(${percentage / 100})` }}>
          <div className="water-surface-wave" />
        </div>
      </div>

      <p className="water-progress-caption">{Math.round(percentage)}% filled</p>
    </div>
  );
};

export default WaterProgressBar;
