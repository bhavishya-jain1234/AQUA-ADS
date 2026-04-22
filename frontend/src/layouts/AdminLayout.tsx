import { useEffect } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import clsx from 'clsx';

const AdminLayout = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('aqua_admin_token');

  useEffect(() => {
    if (!token) {
      navigate('/login?mode=admin', { replace: true });
    }
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('aqua_admin_token');
    navigate('/login?mode=admin', { replace: true });
  };

  if (!token) return null;

  const links = [
    { name: 'Dashboard', path: '/admin' },
    { name: 'Ads Management', path: '/admin/ads' },
    { name: 'User Management', path: '/admin/users' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 w-full text-white flex flex-col md:flex-row">
      {/* Sidebar / Topnav */}
      <header className="p-4 bg-gray-900 border-b md:border-b-0 md:border-r border-gray-800 md:w-64 md:min-h-screen flex flex-col">
        <h1 className="font-black text-xl text-primary tracking-widest mb-8">AQUA_ADS<br/><span className="text-sm text-gray-400 font-medium tracking-normal">Admin Panel</span></h1>
        
        <nav className="flex-1 space-y-2 flex flex-row md:flex-col overflow-x-auto md:overflow-visible pb-2 md:pb-0">
          {links.map(l => (
            <NavLink
              key={l.path}
              to={l.path}
              end={l.path === '/admin'}
              className={({ isActive }) => clsx(
                "px-4 py-2 rounded whitespace-nowrap transition-colors",
                isActive ? "bg-primary text-white font-bold" : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
            >
              {l.name}
            </NavLink>
          ))}
        </nav>

        <button onClick={handleLogout} className="mt-auto px-4 py-2 text-left text-red-400 hover:bg-red-500/10 rounded hidden md:block transition-colors">
          Log Out
        </button>
      </header>
      
      <main className="flex-1 p-6 relative overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
