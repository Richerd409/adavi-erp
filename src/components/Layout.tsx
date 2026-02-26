import React, { useState, useEffect } from 'react';
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
  Banknote,
  Search,
  Bell,
  Settings
} from 'lucide-react';
import { cn } from '../lib/utils';

const Layout: React.FC = () => {
  const { role, signOut } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const navigation = [
    { name: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'tailor'] },
    { name: 'Orders', href: '/app/orders', icon: Scissors, roles: ['admin', 'manager', 'tailor'] },
    { name: 'Measurements', href: '/app/measurements', icon: Ruler, roles: ['admin', 'manager'] },
    { name: 'Clients', href: '/app/clients', icon: Users, roles: ['admin', 'manager'] },
    { name: 'Users', href: '/app/users', icon: Users, roles: ['admin'] },
    { name: 'Finance', href: '/app/finance', icon: Banknote, roles: ['admin', 'manager'] },
  ];

  const filteredNavigation = navigation.filter((item) =>
    role && item.roles.includes(role)
  );

  return (
    <div className="flex min-h-screen bg-background text-text font-sans">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity animate-fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Premium Glassmorphic */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-surface/80 backdrop-blur-xl border-r border-white/10 transform transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] lg:translate-x-0 lg:static lg:inset-auto shadow-glass',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between h-20 px-8 border-b border-white/5 relative overflow-hidden">
          {/* Subtle gradient glow */}
          <div className="absolute top-0 left-1/4 w-1/2 h-full bg-primary/20 blur-2xl rounded-full" />

          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)]">
              <span className="text-white font-display font-bold text-xl">A</span>
            </div>
            <h1 className="text-2xl font-display font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              Adavi <span className="text-primary tracking-normal text-sm font-medium">ERP</span>
            </h1>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-text-muted hover:text-white transition-colors relative z-10 p-2 bg-white/5 rounded-lg border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col h-[calc(100%-5rem)] justify-between">
          <nav className="p-4 space-y-2 mt-4 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'group flex items-center px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden',
                    isActive
                      ? 'bg-primary/10 text-primary border border-primary/20 shadow-neon'
                      : 'text-text-muted hover:bg-white/5 hover:text-white border border-transparent'
                  )}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  {isActive && (
                    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                  )}
                  <item.icon className={cn(
                    "w-5 h-5 mr-3 transition-transform duration-300 group-hover:scale-110",
                    isActive ? "text-primary drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]" : "text-text-muted group-hover:text-white"
                  )} />
                  {item.name}
                  {isActive && (
                    <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_5px_theme(colors.primary)] animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="p-6 border-t border-white/5 bg-gradient-to-b from-transparent to-black/20">
            <div className="glass-card p-4 rounded-xl flex items-center mb-4 transition-all hover:bg-white/[0.08]">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-secondary to-green-600 rounded-lg flex items-center justify-center text-white font-display font-bold shadow-md">
                {role ? role.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="ml-3 flex-1 overflow-hidden">
                <p className="text-sm font-semibold text-white truncate capitalize">{role || 'Administrator'}</p>
                <p className="text-xs text-text-muted truncate">Premium Plan</p>
              </div>
              <button className="text-text-muted hover:text-white p-1 rounded-md transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={signOut}
              className="flex items-center justify-center w-full px-4 py-3 text-sm font-semibold text-error/90 hover:text-error bg-error/10 hover:bg-error/20 border border-error/20 rounded-xl transition-all duration-300 group"
            >
              <LogOut className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header - Glassmorphic top layer */}
        <header className={cn(
          "flex items-center justify-between h-20 px-8 transition-all duration-300 z-30",
          scrolled ? "bg-surface/80 backdrop-blur-xl border-b border-white/10 shadow-glass" : "bg-transparent"
        )}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-text-muted hover:text-white focus:outline-none p-2 rounded-xl bg-white/5 border border-white/10 transition-all hover:bg-white/10"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Global Search */}
            <div className="hidden md:flex relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search everywhere..."
                className="w-80 bg-white/5 border border-white/10 hover:border-white/20 focus:border-primary/50 focus:bg-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-text-muted outline-none transition-all shadow-inner focus:shadow-[0_0_15px_rgba(99,102,241,0.1)]"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded-md border border-white/10 bg-white/5 text-[10px] font-medium text-text-muted">⌘</kbd>
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded-md border border-white/10 bg-white/5 text-[10px] font-medium text-text-muted">K</kbd>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2.5 text-text-muted hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-2 w-2 h-2 bg-error rounded-full animate-pulse border border-background"></span>
            </button>
            <div className="hidden sm:block h-8 w-px bg-white/10"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-white">Adavi Admin</div>
                <div className="text-xs text-text-muted">Active Now</div>
              </div>
              <img
                src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=6366f1"
                alt="Avatar"
                className="w-10 h-10 rounded-xl shadow-glass border border-white/10 bg-surface object-cover"
              />
            </div>
          </div>
        </header>

        {/* Dynamic Main Workspace */}
        <main
          className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-10 hide-scrollbar"
          onScroll={(e) => {
            const isScrolled = (e.target as HTMLElement).scrollTop > 20;
            if (isScrolled !== scrolled) setScrolled(isScrolled);
          }}
        >
          <div className="max-w-7xl mx-auto w-full h-full animate-fade-in relative">
            {/* Add a subtle glow behind the content */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 w-full">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
