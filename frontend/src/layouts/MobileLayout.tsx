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

  return (
    <div className="flex flex-col h-screen w-full relative">
      <main className="flex-1 overflow-y-auto pb-20 no-scrollbar">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="absolute bottom-0 left-0 right-0 bg-white/10 backdrop-blur-md border-t border-white/10 p-2 pb-4">
        <ul className="flex justify-around items-center">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  clsx(
                    'flex flex-col items-center justify-center space-y-1 p-2 rounded-xl transition-all duration-300',
                    isActive ? 'text-accent scale-110' : 'text-gray-400 hover:text-white'
                  )
                }
              >
                <item.icon size={24} />
                <span className="text-[10px] font-medium">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default MobileLayout;
