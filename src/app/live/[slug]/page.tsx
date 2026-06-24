'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { eventService, uploadService, WeddingEvent, UploadedItem } from '@/lib/db';
import QRCode from 'qrcode';
import { toast } from 'sonner';
import { Loader2, Tv, Heart, QrCode } from 'lucide-react';

export default function LiveSlideshowPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [event, setEvent] = useState<WeddingEvent | null>(null);
  const [uploads, setUploads] = useState<UploadedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  
  // Carousel slide state
  const [currentIndex, setCurrentIndex] = useState(0);

  // Background polling ref to keep track of the current items count
  const uploadsRef = useRef<UploadedItem[]>([]);

  useEffect(() => {
    if (!slug) return;

    // Load event metadata
    async function loadEvent() {
      try {
        const eventData = await eventService.getEventBySlug(slug);
        if (!eventData) {
          toast.error('Etkinlik bulunamadı.');
          return;
        }

        if (!eventData.live_screen_enabled) {
          toast.error('Bu etkinlikte Canlı Ekran özelliği aktif değildir.');
          return;
        }
        
        setEvent(eventData);

        // Fetch uploads
        const initialUploads = await uploadService.getEventUploads(eventData.id);
        setUploads(initialUploads);
        uploadsRef.current = initialUploads;

        // Generate QR code data url
        const domain = typeof window !== 'undefined' ? window.location.origin : 'https://lamourqr.com';
        const uploadUrl = `${domain}/e/${eventData.slug}`;
        const qrUrl = await QRCode.toDataURL(uploadUrl, {
          width: 300,
          margin: 1.5,
          color: {
            dark: '#2D3139',
            light: '#FFFFFF',
          },
        });
        setQrCodeDataUrl(qrUrl);

      } catch (error) {
        toast.error('Canlı ekran hazırlanamadı.');
      } finally {
        setIsLoading(false);
      }
    }
    loadEvent();
  }, [slug]);

  // Polling for new photos (every 8 seconds)
  useEffect(() => {
    if (!event || !event.live_screen_enabled) return;

    const intervalId = setInterval(async () => {
      try {
        const freshUploads = await uploadService.getEventUploads(event.id);
        
        // If length changed (new uploads), update list
        if (freshUploads.length !== uploadsRef.current.length) {
          setUploads(freshUploads);
          uploadsRef.current = freshUploads;
          // Set to the first item (newly uploaded photo is shown immediately)
          setCurrentIndex(0);
        }
      } catch (error) {
        console.error('Failed to poll uploads in slideshow');
      }
    }, 8000);

    return () => clearInterval(intervalId);
  }, [event]);

  // Slideshow auto-rotation timer (every 6 seconds)
  useEffect(() => {
    if (uploads.length <= 1) return;

    const slideshowTimer = setInterval(() => {
      setCurrentIndex(prev => (prev === uploads.length - 1 ? 0 : prev + 1));
    }, 6000);

    return () => clearInterval(slideshowTimer);
  }, [uploads]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-950 text-[#FAF9F5] gap-4">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <span className="text-sm font-semibold tracking-wider text-slate-400">Canlı Ekran Başlatılıyor...</span>
      </div>
    );
  }

  if (!event || !event.live_screen_enabled) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-950 text-[#FAF9F5] px-6 text-center gap-6">
        <Tv className="w-16 h-16 text-slate-600 stroke-[1.2]" />
        <div className="flex flex-col gap-2">
          <h1 className="serif-heading text-2xl font-normal">Canlı Ekran Devre Dışı</h1>
          <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
            Bu etkinliğin Canlı Ekran (Live Slideshow) yayını durdurulmuş veya hiç başlatılmamış olabilir.
          </p>
        </div>
        <Link 
          href="/"
          className="bg-white hover:bg-slate-100 text-slate-800 px-6 py-2.5 rounded-full text-xs font-semibold shadow-sm transition-all"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    );
  }

  const currentUpload = uploads[currentIndex];

  return (
    <div className="flex-1 min-h-screen bg-black text-[#FAF9F5] flex flex-col justify-between relative overflow-hidden select-none">
      {/* Background blur container for luxury ambient mood */}
      {currentUpload && (
        <div 
          className="absolute inset-0 bg-cover bg-center blur-3xl opacity-20 transition-all duration-1000 scale-110"
          style={{ backgroundImage: `url(${currentUpload.file_url})` }}
        />
      )}

      {/* Top Banner (Host brand and Wedding info) */}
      <header className="z-10 bg-gradient-to-b from-black/80 to-transparent p-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Heart className="w-6 h-6 fill-amber-500 text-amber-500 animate-pulse" />
          <div>
            <h1 className="serif-heading text-2xl font-normal tracking-wide text-white">{event.title}</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Canlı Fotoğraf Gösterisi</p>
          </div>
        </div>
        
        <span className="serif-heading text-lg font-light tracking-widest text-slate-400">
          L'AMOUR <span className="text-amber-500 font-sans text-xs">QR</span>
        </span>
      </header>

      {/* Main Slideshow Body */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        {uploads.length === 0 ? (
          <div className="text-center flex flex-col items-center justify-center gap-4 z-10 p-12 bg-white/5 backdrop-blur-md border border-white/10 rounded-[40px] max-w-lg">
            <QrCode className="w-16 h-16 text-amber-500 stroke-[1.2]" />
            <h3 className="serif-heading text-xl font-normal">İlk Fotoğrafı Siz Yükleyin!</h3>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Sağ alt köşede yer alan QR kodu cep telefonunuzun kamerası ile okutarak çekeceğiniz fotoğrafların anında bu ekranda belirmesini sağlayabilirsiniz.
            </p>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center relative z-10 transition-all duration-700">
            {currentUpload.file_type.startsWith('video/') ? (
              <video 
                src={currentUpload.file_url} 
                className="max-h-[72vh] max-w-[85vw] object-contain rounded-3xl shadow-[0_15px_50px_rgba(0,0,0,0.8)] border border-white/5" 
                controls={false}
                autoPlay
                muted
                loop
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={currentUpload.file_url} 
                alt="Slideshow Item" 
                className="max-h-[72vh] max-w-[85vw] object-contain rounded-3xl shadow-[0_15px_50px_rgba(0,0,0,0.8)] border border-white/5 animate-fade-in transition-all duration-700"
              />
            )}
            
            {/* Guest details overlay bottom central */}
            {currentUpload.guest_name && (
              <div className="absolute bottom-4 bg-black/75 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/10 text-xs font-medium tracking-wide shadow-md">
                Paylaşan: <span className="text-amber-400 font-semibold">{currentUpload.guest_name}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating QR Code info card in bottom right corner */}
      {qrCodeDataUrl && (
        <div className="absolute bottom-8 right-8 z-20 bg-white/95 backdrop-blur-md border border-white p-4 rounded-[30px] shadow-2xl flex items-center gap-4 text-slate-800 max-w-xs animate-bounce-slow">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrCodeDataUrl} alt="Upload QR code" className="w-20 h-20 bg-white border border-slate-100 rounded-xl" />
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">ANILARINI PAYLAŞ</span>
            <span className="serif-heading text-xs font-semibold text-slate-800 leading-tight">Fotoğraf Göndermek İçin Kodu Okutun</span>
            <span className="text-[9px] font-mono text-amber-700">{event.slug}</span>
          </div>
        </div>
      )}

      {/* Simple indicator dot lights on bottom-left */}
      {uploads.length > 1 && (
        <div className="absolute bottom-8 left-8 z-10 flex gap-1.5 items-center">
          {uploads.slice(0, 8).map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-amber-500 w-4' : 'bg-white/20 w-1.5'}`} 
            />
          ))}
          {uploads.length > 8 && <span className="text-[9px] text-white/40">+{uploads.length - 8}</span>}
        </div>
      )}
    </div>
  );
}
