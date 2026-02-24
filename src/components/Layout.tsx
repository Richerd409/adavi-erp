import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard,
  Scissors,
  Ruler,
  Users,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '../lib/utils';
import Button from './ui/Button';

const Layout: React.FC = () => {
  const { role, signOut } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'tailor'] },
    { name: 'Orders', href: '/app/orders', icon: Scissors, roles: ['admin', 'manager', 'tailor'] },
    { name: 'Measurements', href: '/app/measurements', icon: Ruler, roles: ['admin', 'manager'] },
    { name: 'Users', href: '/app/users', icon: Users, roles: ['admin'] },
  ];

  const filteredNavigation = navigation.filter((item) =>
    role && item.roles.includes(role)
  );

  return (
    <div className="flex h-screen bg-background text-text font-sans">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-muted transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-muted">
          <h1 className="text-xl font-serif font-bold tracking-tight">Adavi</h1>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-text-muted hover:text-text"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary text-white shadow-soft'
                    : 'text-text-muted hover:bg-muted/50 hover:text-text'
                )}
                onClick={() => setIsSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-muted">
          <div className="flex items-center mb-4 px-4">
            <div className="flex-shrink-0 w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-white font-serif font-bold">
              {role ? role.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-text capitalize">{role}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-error hover:bg-red-50 hover:text-red-700"
            onClick={signOut}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="flex items-center justify-between h-16 px-4 border-b border-muted bg-surface lg:hidden">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-text-muted hover:text-text focus:outline-none"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-serif font-bold">Adavi</h1>
          <div className="w-6" />
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
