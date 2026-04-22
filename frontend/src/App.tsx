import { Routes, Route, Navigate } from 'react-router-dom';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AdWatchPage from './pages/AdWatchPage';
import RewardPage from './pages/RewardPage';
import WalletPage from './pages/WalletPage';
import RedeemPage from './pages/RedeemPage';
import ProfilePage from './pages/ProfilePage';
import LimitExceededPage from './pages/LimitExceededPage';
import DonatePage from './pages/DonatePage';
import AdminDashboard from './pages/admin/AdminDashboard'; 
import AdminAds from './pages/admin/AdminAds';
import AdminUsers from './pages/admin/AdminUsers';
import WaterBackground from './effects/WaterBackground';
import WaterCursor from './effects/WaterCursor';
import Bubbles from './effects/Bubbles';
import FloatingMascots from './effects/FloatingMascots';
import BackButton from './components/BackButton';

// Layouts
import MobileLayout from './layouts/MobileLayout';
import AdminLayout from './layouts/AdminLayout';

function App() {
  return (
    <div className="min-h-screen text-white w-full relative">
      <WaterBackground />
      <Bubbles />
      <FloatingMascots />
      <WaterCursor />
      {/* On mobile keep a framed app; on laptop/desktop use full screen */}
      <div className="w-full min-h-screen relative overflow-x-hidden bg-[#020B18]/65 border border-white/10 shadow-2xl max-w-[430px] mx-auto md:max-w-none md:mx-0 md:border-0 md:shadow-none">
        <BackButton />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected User Routes wrapped in MobileLayout (Bottom Nav) */}
          <Route element={<MobileLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/redeem" element={<RedeemPage />} />
            <Route path="/donate" element={<DonatePage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Full Screen Protected User Routes (No Bottom Nav) */}
          <Route path="/watch/:adId" element={<AdWatchPage />} />
          <Route path="/reward/:sessionId" element={<RewardPage />} />
          <Route path="/limit-exceeded" element={<LimitExceededPage />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<Navigate to="/login?mode=admin" replace />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="ads" element={<AdminAds />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
