'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { eventService, uploadService, WeddingEvent } from '@/lib/db';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { Camera, Heart, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon, Video } from 'lucide-react';

export default function GuestUploadPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [event, setEvent] = useState<WeddingEvent | null>(null);
  const [guestDeviceId, setGuestDeviceId] = useState('');
  const [guestName, setGuestName] = useState('');
  const [uploadedCount, setUploadedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!slug) return;

    // 1. Get or generate device ID
    let deviceId = localStorage.getItem('wedding_guest_device_id') || '';
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem('wedding_guest_device_id', deviceId);
    }
    setGuestDeviceId(deviceId);

    // 2. Get saved guest name
    const savedName = localStorage.getItem('wedding_guest_name') || '';
    setGuestName(savedName);

    // 3. Load Event & Upload counts
    async function loadEvent() {
      try {
        const eventData = await eventService.getEventBySlug(slug);
        if (!eventData) {
          toast.error('Etkinlik bulunamadı.');
          return;
        }
        
        if (!eventData.is_active) {
          toast.error('Bu etkinlik şu anda aktif değil.');
          return;
        }
        
        setEvent(eventData);

        // Fetch user uploads count
        const count = await uploadService.getGuestUploadCount(eventData.id, deviceId);
        setUploadedCount(count);

      } catch (error) {
        toast.error('Etkinlik bilgileri yüklenemedi.');
      } finally {
        setIsLoading(false);
      }
    }
    loadEvent();
  }, [slug]);

  const handleNameChange = (val: string) => {
    setGuestName(val);
    localStorage.setItem('wedding_guest_name', val);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !event) return;

    const file = files[0];
    
    // Check validation checks in UI first
    if (uploadedCount >= event.upload_limit_per_guest) {
      toast.error(`Yükleme limitiniz doldu! En fazla ${event.upload_limit_per_guest} dosya yükleyebilirsiniz.`);
      return;
    }
    if (file.size > event.max_file_size_mb * 1024 * 1024) {
      toast.error(`Görsel çok büyük! En fazla ${event.max_file_size_mb}MB yükleyebilirsiniz.`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    
    try {
      const interval = setInterval(() => {
        setUploadProgress(prev => (prev >= 90 ? 90 : prev + 15));
      }, 150);

      await uploadService.uploadFile(event, file, guestName, guestDeviceId);
      
      clearInterval(interval);
      setUploadProgress(100);

      // Trigger Confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });

      toast.success('Anınız başarıyla paylaşıldı! Teşekkür ederiz.');
      setUploadedCount(prev => prev + 1);
      
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';

    } catch (error: any) {
      toast.error(error.message || 'Yükleme başarısız.');
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const triggerUploadClick = () => {
    fileInputRef.current?.click();
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] bg-[#FAF9F5] p-6 gap-4">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
        <span className="text-sm text-slate-500 font-medium">Sayfa Yükleniyor...</span>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] bg-[#FAF9F5] p-6 text-center gap-4">
        <AlertCircle className="w-12 h-12 text-destructive stroke-[1.5]" />
        <h1 className="serif-heading text-xl font-normal text-slate-800">Etkinlik Bulunamadı</h1>
        <p className="text-slate-400 text-sm max-w-xs">Girdiğiniz QR bağlantısı hatalı veya bu etkinlik silinmiş olabilir.</p>
        <Link href="/" className="text-xs font-semibold underline text-amber-700">Ana Sayfaya Git</Link>
      </div>
    );
  }

  const isLimitReached = uploadedCount >= event.upload_limit_per_guest;

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[90vh] bg-[#FAF9F5] px-6 py-12">
      {/* Mobile-optimized Card */}
      <div className="w-full max-w-md bg-white border border-[#EAE9E4] rounded-3xl p-6 sm:p-8 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.02)] flex flex-col gap-6 relative overflow-hidden">
        
        {/* Soft elegant top champagne banner */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-amber-200 via-amber-300 to-amber-200" />

        {/* Wedding titles */}
        <div className="text-center flex flex-col items-center gap-1.5 pt-2">
          <Heart className="w-5 h-5 fill-amber-500 text-amber-500" />
          <h1 className="serif-heading text-2xl font-normal text-slate-800 tracking-wide mt-1">{event.title}</h1>
          <p className="text-[10px] sm:text-xs text-slate-400 font-serif italic">
            {new Date(event.event_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          {event.description && (
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed mt-2 bg-slate-50 border border-slate-100/50 p-2.5 rounded-xl">
              {event.description}
            </p>
          )}
        </div>

        {/* Guest profile metadata */}
        <div className="flex flex-col gap-1.5 mt-2">
          <label className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase" htmlFor="guestName">
            Adınız Soyadınız <span className="text-slate-400 font-normal text-[9px]">(Tebrik mesajları için)</span>
          </label>
          <input
            id="guestName"
            type="text"
            placeholder="Adınızı yazın (Örn: Ayşe & Murat)"
            value={guestName}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 bg-[#FAF9F5]/40"
            disabled={isUploading}
          />
        </div>

        {/* Action Upload Area */}
        <div className="flex flex-col gap-4">
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={event.allow_video ? "image/*,video/*" : "image/*"}
            className="hidden"
            disabled={isUploading || isLimitReached}
          />

          {isUploading ? (
            <div className="w-full aspect-square border border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-4 p-6 bg-slate-50">
              <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-700">Anınız yükleniyor...</span>
                <span className="text-[10px] text-slate-400">Lütfen tarayıcınızı kapatmayın.</span>
              </div>
              <div className="w-2/3 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-600 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          ) : isLimitReached ? (
            <div className="w-full aspect-square border border-dashed border-red-200 rounded-2xl flex flex-col items-center justify-center gap-3 p-6 bg-red-50/50 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 stroke-[1.5]" />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-slate-800">Tüm Paylaşımlarınız İletildi!</span>
                <span className="text-[10px] text-slate-500 max-w-xs px-2">
                  En fazla {event.upload_limit_per_guest} adet fotoğraf paylaşım limitine ulaştınız. Harika kareler için çiftimiz adına teşekkür ederiz!
                </span>
              </div>
            </div>
          ) : (
            <button
              onClick={triggerUploadClick}
              type="button"
              className="w-full aspect-square border border-dashed border-amber-300 hover:border-amber-400 bg-amber-50/20 hover:bg-amber-50/30 rounded-3xl flex flex-col items-center justify-center gap-3.5 p-6 transition-all duration-300 cursor-pointer shadow-[0_2px_15px_-4px_rgba(212,175,55,0.06)] group"
            >
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-md border border-slate-100 group-hover:scale-105 transition-transform duration-200">
                <Camera className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex flex-col gap-1 text-center">
                <span className="text-xs font-semibold text-slate-700">Fotoğraf veya Video Paylaş</span>
                <span className="text-[10px] text-slate-400 leading-normal">
                  Kamerayı aç veya galeriden seç <br />
                  (Maks. {event.max_file_size_mb}MB{event.allow_video && ' • Video desteği açık'})
                </span>
              </div>
            </button>
          )}
        </div>

        {/* Quota limit counts indicators */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500">
            <span>YÜKLEME DURUMUNUZ</span>
            <span className={isLimitReached ? "text-emerald-700" : "text-amber-700"}>
              {uploadedCount} / {event.upload_limit_per_guest} Dosya
            </span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 rounded-full ${isLimitReached ? 'bg-emerald-600' : 'bg-amber-600'}`} 
              style={{ width: `${(uploadedCount / event.upload_limit_per_guest) * 100}%` }} 
            />
          </div>
        </div>

        {/* Public Gallery navigation if open */}
        {event.gallery_public && (
          <Link
            href={`/g/${event.slug}`}
            className="w-full text-center text-xs font-semibold border border-slate-200 hover:border-slate-300 rounded-full py-3 bg-white text-slate-700 shadow-sm transition-all"
          >
            Ortak Galeri ve Fotoğrafları Gör
          </Link>
        )}

        <div className="text-center text-[10px] text-slate-400 font-light flex items-center justify-center gap-1">
          L'Amour QR • Evlilik albümü asistanı
        </div>
      </div>
    </div>
  );
}
