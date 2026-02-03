'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const getUserInitials = () => {
    if (!user) return '?';
    const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email || '';
    if (name.includes('@')) {
      return name.charAt(0).toUpperCase();
    }
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0].charAt(0).toUpperCase() + parts[1].charAt(0).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };
  
  const navItems = [
    { href: '/app', label: 'Dashboard', icon: '📊' },
    { href: '/app/gifts', label: 'Gifts', icon: '🎁' },
    { href: '/app/wishlists', label: 'Lists', icon: '📝' },
    { href: '/app/occasions', label: 'Events', icon: '📅' },
    { href: '/app/people', label: 'People', icon: '👥' },
  ];

  return (
    <div className="min-h-screen bg-[#FFF9F5]">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <Link href="/app" className="flex items-center gap-1">
              <img src="/gifthq-logo-v3.jpg" alt="GiftHQ" className="h-10 w-10" />
              <span className="text-[26px] font-bold leading-none tracking-tight">
                <span className="text-[#3D4F5F]">Gift</span>
                <span className="text-[#F4C430]">HQ</span>
              </span>
            </Link>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    pathname === item.href
                      ? 'bg-[#D64045] text-white'
                      : 'text-[#3D4F5F] hover:bg-gray-100'
                  }`}
                >
                  {item.icon} {item.label}
                </Link>
              ))}
            </nav>

            {/* Profile/Settings */}
            <div className="relative">
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-3 hover:bg-gray-50 rounded-full p-1 pr-3 transition"
              >
                <div className="w-9 h-9 rounded-full bg-[#D64045] flex items-center justify-center text-white font-medium">
                  {getUserInitials()}
                </div>
                <span className="hidden sm:block text-sm text-[#3D4F5F]">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                </span>
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-[#3D4F5F] truncate">
                      {user?.user_metadata?.full_name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <Link
                    href="/app/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowMenu(false)}
                  >
                    ⚙️ Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    🚪 Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Click outside to close menu */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowMenu(false)}
        />
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-4 py-2 ${
                pathname === item.href
                  ? 'text-[#D64045]'
                  : 'text-[#636E72]'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
      
      {/* Bottom padding for mobile nav */}
      <div className="h-16 md:hidden" />
    </div>
  );
}
