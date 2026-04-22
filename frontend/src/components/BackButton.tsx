import { useLocation, useNavigate } from 'react-router-dom';
import { spawnWaterRipple } from '../effects/waterButtonRipple';

const BackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    // If there is no meaningful history entry, fall back to home.
    if (window.history.length <= 1) {
      navigate('/', { replace: true });
      return;
    }
    navigate(-1);
  };

  const isAdminPanel = location.pathname.startsWith('/admin');

  return (
    <button
      type="button"
      onMouseDown={spawnWaterRipple}
      onClick={handleBack}
      className={[
        'water-btn',
        'absolute top-3 left-3 z-50',
        'glass-panel',
        'px-3 py-2 rounded-xl',
        'text-white/90 hover:text-white',
        'flex items-center gap-2',
        'border border-white/15',
        isAdminPanel ? 'md:top-4 md:left-4' : '',
      ].join(' ')}
      aria-label="Go back"
    >
      <span className="text-lg leading-none">←</span>
      <span className="text-xs font-semibold tracking-wide">Back</span>
    </button>
  );
};

export default BackButton;

