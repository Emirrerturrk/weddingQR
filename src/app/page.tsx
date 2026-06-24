import Link from 'next/link';
import { Camera, QrCode, Download, Heart, ArrowRight, CheckCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen font-sans bg-[#FAF9F5]">
      {/* Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#FAF9F5]/80 border-b border-[#EAE9E4]">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="serif-heading text-2xl font-semibold tracking-wide text-slate-800 flex items-center gap-1.5">
              L'Amour <span className="text-amber-600 font-light font-sans text-lg">QR</span>
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-slate-900 transition-colors">Nasıl Çalışır?</a>
            <a href="#faq" className="hover:text-slate-900 transition-colors">S.S.S.</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-3 py-2"
            >
              Giriş Yap
            </Link>
            <Link 
              href="/register" 
              className="text-sm font-medium bg-slate-800 text-[#FAF9F5] hover:bg-slate-700 transition-all rounded-full px-5 py-2.5 shadow-sm"
            >
              Ücretsiz Dene
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 md:pt-20 md:pb-32 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="md:col-span-7 flex flex-col gap-6 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200/50 text-amber-800 text-xs font-medium self-center md:self-start">
                <Heart className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
                Düğününüzdeki Tüm Fotoğrafları Keşfedin
              </div>
              
              <h1 className="serif-heading text-4xl sm:text-5xl lg:text-6xl font-normal text-slate-800 tracking-tight leading-[1.1]">
                Düğününüzdeki tüm anıları <br />
                <span className="italic font-light text-slate-700">QR kod ile</span> tek albümde toplayın.
              </h1>
              
              <p className="text-base sm:text-lg text-slate-500 max-w-xl leading-relaxed">
                Misafirleriniz herhangi bir uygulama indirmeden masadaki QR kodu okutur, çektikleri fotoğraf ve videoları anında yükler. Siz tüm anıları tek panelden yüksek çözünürlüklü olarak görüntüler ve indirirsiniz.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start pt-2">
                <Link 
                  href="/register" 
                  className="w-full sm:w-auto text-center font-medium bg-slate-800 text-[#FAF9F5] hover:bg-slate-700 transition-all rounded-full px-8 py-3.5 shadow-md flex items-center justify-center gap-2 group"
                >
                  Etkinliğini Oluştur
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link 
                  href="/e/elif-can-dugun" 
                  className="w-full sm:w-auto text-center font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all rounded-full px-8 py-3.5 shadow-sm"
                >
                  Örnek Misafir Sayfası
                </Link>
              </div>
            </div>

            {/* Right Graphic/Mockup */}
            <div className="md:col-span-5 relative flex justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-100/30 to-slate-200/30 rounded-full blur-3xl -z-10" />
              
              {/* Premium Phone & Table Card Mockup */}
              <div className="relative w-full max-w-[340px] aspect-[9/16] bg-white rounded-[40px] border-8 border-slate-800 shadow-2xl overflow-hidden p-6 flex flex-col justify-between">
                {/* Speaker & camera slot */}
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-800 rounded-full" />
                
                {/* Mock Guest View UI */}
                <div className="flex flex-col items-center gap-4 pt-6 text-center">
                  <span className="serif-heading text-xl font-semibold text-slate-800">Elif & Can</span>
                  <div className="w-12 h-[1px] bg-amber-300" />
                  <p className="text-xs text-slate-400 font-serif italic">24 Haziran 2026</p>
                  
                  {/* Photo Frame Mockup */}
                  <div className="w-full aspect-square border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 p-4 bg-[#FAF9F5]">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-500">
                      <Camera className="w-6 h-6 text-amber-600" />
                    </div>
                    <span className="text-xs font-medium text-slate-700">Fotoğraf veya Video Seç</span>
                    <span className="text-[10px] text-slate-400">veya kamerayı aç</span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex flex-col gap-1.5 text-left">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500">
                    <span>Yüklenen Fotoğraflar</span>
                    <span className="text-amber-700">5 / 10 limit</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-600 h-full w-1/2 rounded-full" />
                  </div>
                </div>

                <div className="text-center text-[10px] text-slate-400 font-light pb-2">
                  Uygulama yüklemeniz gerekmez • L'Amour QR
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* How it Works / Features */}
      <section id="features" className="py-24 bg-white border-y border-[#EAE9E4]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto flex flex-col gap-4 mb-16">
            <span className="text-xs font-semibold tracking-wider text-amber-600 uppercase">3 Basit Adımda</span>
            <h2 className="serif-heading text-3xl sm:text-4xl text-slate-800 font-normal">
              Anılarınızı nasıl bir araya getiriyoruz?
            </h2>
            <p className="text-slate-500 text-sm sm:text-base">
              Hiçbir misafirinize karmaşık kayıt adımları veya uygulama indirme zahmeti yaşatmadan anıları toplayın.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="flex flex-col gap-4 p-6 rounded-2xl bg-[#FAF9F5] border border-[#EAE9E4] premium-card">
              <div className="w-12 h-12 rounded-xl bg-slate-800 text-[#FAF9F5] flex items-center justify-center font-serif text-lg font-semibold">
                1
              </div>
              <h3 className="serif-heading text-lg font-semibold text-slate-800 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-amber-600" /> QR Kodunu Oluştur
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Panelinizden etkinliğinizi saniyeler içinde oluşturun. Sistem size özel şık bir karşılama kartı ve QR kod oluşturacaktır.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col gap-4 p-6 rounded-2xl bg-[#FAF9F5] border border-[#EAE9E4] premium-card">
              <div className="w-12 h-12 rounded-xl bg-slate-800 text-[#FAF9F5] flex items-center justify-center font-serif text-lg font-semibold">
                2
              </div>
              <h3 className="serif-heading text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Heart className="w-5 h-5 text-amber-600" /> Masalara Yerleştir
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Oluşturulan QR kodlu karşılama tasarımının çıktısını alın. Masalara, giriş panolarına veya davetiyelere yerleştirin.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col gap-4 p-6 rounded-2xl bg-[#FAF9F5] border border-[#EAE9E4] premium-card">
              <div className="w-12 h-12 rounded-xl bg-slate-800 text-[#FAF9F5] flex items-center justify-center font-serif text-lg font-semibold">
                3
              </div>
              <h3 className="serif-heading text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Download className="w-5 h-5 text-amber-600" /> ZIP Olarak İndir
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Misafirler okutup anında fotoğraf/video yüklesin. Düğün sonrası tüm anıları tek tıkla topluca yüksek kaliteli ZIP olarak indirin.
              </p>
            </div>
          </div>
        </div>
      </section>



      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-white border-t border-[#EAE9E4]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center flex flex-col gap-4 mb-16">
            <span className="text-xs font-semibold tracking-wider text-amber-600 uppercase">Sıkça Sorulan Sorular</span>
            <h2 className="serif-heading text-3xl text-slate-800 font-normal">
              Aklınızdaki soruları yanıtlıyoruz
            </h2>
          </div>

          <div className="flex flex-col gap-6">
            <div className="p-6 rounded-2xl bg-[#FAF9F5] border border-[#EAE9E4]">
              <h4 className="serif-heading text-base font-semibold text-slate-800 mb-2">Misafirlerin uygulamayı indirmesi gerekir mi?</h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                Hayır! Misafirlerin hiçbir şey indirmesine gerek yoktur. Sadece telefon kameraları ile masadaki QR kodu okuturlar ve doğrudan web tarayıcısı üzerinden anında fotoğraf yüklerler.
              </p>
            </div>
            
            <div className="p-6 rounded-2xl bg-[#FAF9F5] border border-[#EAE9E4]">
              <h4 className="serif-heading text-base font-semibold text-slate-800 mb-2">Yüklenen fotoğraflar güvenli mi ve kimler görebilir?</h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                Evet, tüm yüklemeler şifreli sunucularda saklanır. Etkinlik sahibi, panelden dilediği fotoğrafı silebilir veya gizleyebilir. Eğer public galeri özelliğini açarsanız misafirleriniz de yüklenen diğer fotoğrafları görebilir; kapatırsanız sadece siz görebilirsiniz.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAF9F5] border border-[#EAE9E4]">
              <h4 className="serif-heading text-base font-semibold text-slate-800 mb-2">Misafirler için yükleme limiti koyabilir miyim?</h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                Evet. Panelinizden kişi başına yükleme limitini (örneğin cihaz başına en fazla 10 fotoğraf) belirleyebilirsiniz. Bu sayede gereksiz veya kopya yüklemelerin önüne geçebilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 mt-auto">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="serif-heading text-xl font-semibold tracking-wide text-white">
            L'Amour <span className="text-amber-500 font-light font-sans text-sm">QR</span>
          </span>
          <div className="text-xs font-light">
            © 2026 L'Amour QR. Tüm hakları saklıdır.
          </div>
          <div className="flex gap-6 text-xs font-light">
            <Link href="/login" className="hover:text-white transition-colors">Giriş</Link>
            <Link href="/register" className="hover:text-white transition-colors">Kayıt Ol</Link>
            <a href="mailto:destek@lamourqr.com" className="hover:text-white transition-colors">Destek</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
