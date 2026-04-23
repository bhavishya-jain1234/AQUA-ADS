import { Outlet, NavLink } from 'react-router-dom';
import { Home, Wallet, Gift, HeartHandshake, User } from 'lucide-react';
import clsx from 'clsx';

const MobileLayout = () => {
  const navItems = [
    { name: 'Home', path: '/dashboard', icon: Home },
    { name: 'Wallet', path: '/wallet', icon: Wallet },
    { name: 'Redeem', path: '/redeem', icon: Gift },
    { name: 'Donate', path: '/donate', icon: HeartHandshake },
    { name: 'Profile', path: '/profile', icon: User },
  ];

    <div className="flex flex-col h-[100dvh] w-full relative bg-black">
      {/* Top Right Navigation */}
      <nav className="fixed top-4 right-4 z-50 bg-black/60 backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl shadow-2xl overflow-x-auto max-w-[calc(100vw-32px)] no-scrollbar">
        <ul className="flex items-center gap-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  clsx(
                    'flex flex-col items-center justify-center space-y-1 px-3 py-2 rounded-xl transition-all duration-300',
                    isActive ? 'bg-primary/20 text-accent scale-105' : 'text-gray-400 hover:text-white hover:bg-white/5'
                  )
                }
              >
                <item.icon size={20} />
                <span className="text-[9px] font-bold tracking-wider">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <main className="flex-1 overflow-y-auto pt-28 pb-6 no-scrollbar">
        <Outlet />
      </main>
    </div>
};

export default MobileLayout;
