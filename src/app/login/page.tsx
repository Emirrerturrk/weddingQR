'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/db';
import { toast } from 'sonner';
import { Heart, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Lütfen tüm alanları doldurun.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.signIn(email, password);
      toast.success('Giriş başarılı! Panelinize yönlendiriliyorsunuz.');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Giriş yapılamadı. Bilgilerinizi kontrol edin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center min-h-[80vh] px-6 py-12">
      <div className="w-full max-w-md bg-white border border-[#EAE9E4] rounded-3xl p-8 sm:p-10 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col items-center gap-2 mb-8 text-center">
          <Link href="/" className="flex items-center gap-1.5 mb-2">
            <span className="serif-heading text-2xl font-semibold tracking-wide text-slate-800">
              L'Amour <span className="text-amber-600 font-light font-sans text-base">QR</span>
            </span>
          </Link>
          <h1 className="serif-heading text-2xl font-normal text-slate-800">Panele Giriş Yapın</h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Etkinliğinizi yönetmek ve anıları indirmek için giriş yapın
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600" htmlFor="email">
              E-posta Adresi
            </label>
            <input
              id="email"
              type="email"
              placeholder="ornek@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 bg-[#FAF9F5]/40"
              disabled={isLoading}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600" htmlFor="password">
              Şifre
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 bg-[#FAF9F5]/40"
              disabled={isLoading}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full font-medium bg-slate-800 text-[#FAF9F5] hover:bg-slate-700 disabled:bg-slate-400 transition-all rounded-full py-3 mt-2 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Giriş Yapılıyor...
              </>
            ) : (
              'Giriş Yap'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-500 flex flex-col gap-2">
          <span>
            Hesabınız yok mu?{' '}
            <Link href="/register" className="font-semibold text-amber-700 hover:text-amber-800 underline">
              Hemen Kaydolun
            </Link>
          </span>
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 mt-2">
            <Heart className="w-3 h-3 fill-amber-400 text-amber-400" />
            L'Amour QR Evlilik & Etkinlik Asistanı
          </div>
        </div>
      </div>
    </div>
  );
}
