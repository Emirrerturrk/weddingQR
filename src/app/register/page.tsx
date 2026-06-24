'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/db';
import { toast } from 'sonner';
import { Heart, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      toast.error('Lütfen zorunlu alanları doldurun.');
      return;
    }
    if (password.length < 6) {
      toast.error('Şifreniz en az 6 karakter olmalıdır.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.signUp(email, password, fullName, companyName);
      toast.success('Kayıt başarılı! Panelinize yönlendiriliyorsunuz.');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Kayıt esnasında bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center min-h-[85vh] px-6 py-12">
      <div className="w-full max-w-md bg-white border border-[#EAE9E4] rounded-3xl p-8 sm:p-10 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col items-center gap-2 mb-8 text-center">
          <Link href="/" className="flex items-center gap-1.5 mb-2">
            <span className="serif-heading text-2xl font-semibold tracking-wide text-slate-800">
              L'Amour <span className="text-amber-600 font-light font-sans text-base">QR</span>
            </span>
          </Link>
          <h1 className="serif-heading text-2xl font-normal text-slate-800">Hesap Oluşturun</h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Kendi dijital QR albümünüzü kurmak için hemen ücretsiz başlayın
          </p>
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600" htmlFor="fullName">
              Ad Soyad <span className="text-amber-600">*</span>
            </label>
            <input
              id="fullName"
              type="text"
              placeholder="Elif Yılmaz"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 bg-[#FAF9F5]/40"
              disabled={isLoading}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600" htmlFor="companyName">
              Firma Adı <span className="text-slate-400 font-normal">(Opsiyonel)</span>
            </label>
            <input
              id="companyName"
              type="text"
              placeholder="Yıldız Organizasyon"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 bg-[#FAF9F5]/40"
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600" htmlFor="email">
              E-posta Adresi <span className="text-amber-600">*</span>
            </label>
            <input
              id="email"
              type="email"
              placeholder="dugun@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 bg-[#FAF9F5]/40"
              disabled={isLoading}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600" htmlFor="password">
              Şifre (En az 6 karakter) <span className="text-amber-600">*</span>
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
                Hesap Oluşturuluyor...
              </>
            ) : (
              'Kayıt Ol ve Başla'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-500 flex flex-col gap-2">
          <span>
            Zaten hesabınız var mı?{' '}
            <Link href="/login" className="font-semibold text-amber-700 hover:text-amber-800 underline">
              Giriş Yapın
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
