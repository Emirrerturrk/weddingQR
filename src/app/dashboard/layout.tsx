'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { authService, UserProfile } from '@/lib/db';
import { toast } from 'sonner';
import { LayoutDashboard, Calendar, LogOut, Home, Loader2, Menu, X, User } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const currentUser = await authService.getCurrentUser();
        if (!currentUser) {
          toast.error('Bu alana erişmek için giriş yapmalısınız.');
          router.push('/login');
        } else {
          setUser(currentUser);
        }
      } catch (error) {
        toast.error('Oturum kontrol edilirken hata oluştu.');
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      toast.success('Oturum kapatıldı.');
      router.push('/login');
    } catch (error) {
      toast.error('Çıkış yapılırken bir hata oluştu.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#FAF9F5] gap-4">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
        <span className="text-sm font-medium text-slate-500">Panel Yükleniyor...</span>
      </div>
    );
  }

  if (!user) return null;

  const menuItems = [
    { name: 'Genel Bakış', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Etkinliklerim', path: '/dashboard/events', icon: Calendar },
  ];

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-screen bg-[#FAF9F5]">
      {/* Mobile Top Navbar */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-[#EAE9E4] px-6 h-16 flex items-center justify-between">
        <span className="serif-heading text-lg font-semibold text-slate-800">
          L'Amour <span className="text-amber-600 font-sans text-xs">QR</span>
        </span>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-slate-500 hover:text-slate-800 p-2"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar - Desktop & Drawer Mobile */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#EAE9E4] flex flex-col justify-between p-6 transition-transform duration-300 md:static md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-1.5">
              <span className="serif-heading text-xl font-semibold text-slate-800">
                L'Amour <span className="text-amber-600 font-sans text-sm">QR</span>
              </span>
            </Link>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Card */}
          <div className="bg-[#FAF9F5] border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 text-[#FAF9F5] flex items-center justify-center font-bold text-sm shrink-0">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-800 truncate">{user.full_name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
            </div>
          </div>

          {/* Nav menu */}
          <nav className="flex flex-col gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                    ${isActive 
                      ? 'bg-slate-800 text-[#FAF9F5] shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col gap-2 border-t border-slate-100 pt-4">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            Ana Sayfaya Dön
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium text-destructive hover:bg-red-50 transition-colors text-left w-full cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
