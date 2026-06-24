'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { eventService, uploadService, WeddingEvent, UploadedItem } from '@/lib/db';
import { toast } from 'sonner';
import { 
  ArrowLeft, Calendar, Heart, ShieldAlert, Loader2, Eye, 
  X, ChevronLeft, ChevronRight, Download, Camera 
} from 'lucide-react';

export default function PublicGalleryPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [event, setEvent] = useState<WeddingEvent | null>(null);
  const [uploads, setUploads] = useState<UploadedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!slug) return;

    async function loadGallery() {
      try {
        const eventData = await eventService.getEventBySlug(slug);
        if (!eventData) {
          toast.error('Etkinlik bulunamadı.');
          return;
        }

        setEvent(eventData);

        // Fetch uploads if gallery is public
        if (eventData.gallery_public) {
          const uploadsList = await uploadService.getEventUploads(eventData.id);
          setUploads(uploadsList);
        }

      } catch (error) {
        toast.error('Galeri yüklenemedi.');
      } finally {
        setIsLoading(false);
      }
    }

    loadGallery();
  }, [slug]);

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxIndex === null) return;
    setLightboxIndex(prev => (prev === 0 ? uploads.length - 1 : prev! - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxIndex === null) return;
    setLightboxIndex(prev => (prev === uploads.length - 1 ? 0 : prev! + 1));
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] bg-[#FAF9F5] p-6 gap-4">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
        <span className="text-sm text-slate-500 font-medium">Galeri Yükleniyor...</span>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] bg-[#FAF9F5] p-6 text-center gap-4">
        <ShieldAlert className="w-12 h-12 text-destructive stroke-[1.5]" />
        <h1 className="serif-heading text-xl font-normal text-slate-800">Galeri Bulunamadı</h1>
        <p className="text-slate-400 text-sm max-w-xs">Girdiğiniz QR bağlantısı hatalı veya bu etkinlik silinmiş olabilir.</p>
        <Link href="/" className="text-xs font-semibold underline text-amber-700">Ana Sayfaya Git</Link>
      </div>
    );
  }

  // Check if public gallery is enabled
  if (!event.gallery_public) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[85vh] bg-[#FAF9F5] px-6 text-center gap-6">
        <ShieldAlert className="w-16 h-16 text-amber-600 stroke-[1.2] bg-amber-50 rounded-full p-3 shadow-inner" />
        <div className="flex flex-col gap-2">
          <h1 className="serif-heading text-2xl font-normal text-slate-800">Galeri Kamuya Kapalıdır</h1>
          <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
            Çiftimiz yüklenen fotoğrafları sadece kendi yönetim panellerinde görüntülemeyi tercih etmiştir.
          </p>
        </div>
        <Link 
          href={`/e/${event.slug}`}
          className="bg-slate-800 text-[#FAF9F5] hover:bg-slate-700 px-6 py-2.5 rounded-full text-xs font-semibold shadow-sm transition-all"
        >
          Fotoğraf Yükleme Sayfasına Dön
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#FAF9F5] px-6 py-12">
      {/* Header */}
      <div className="max-w-6xl mx-auto w-full flex flex-col items-center text-center gap-4 mb-12">
        <Link 
          href={`/e/${event.slug}`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 transition-colors self-start border border-slate-200 rounded-full px-4 py-1.5 bg-white shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Yükleme Ekranı
        </Link>
        
        <Heart className="w-6 h-6 fill-amber-500 text-amber-500" />
        <h1 className="serif-heading text-3xl font-normal text-slate-800">{event.title} – Fotoğraf Galerisi</h1>
        <p className="text-slate-400 text-xs sm:text-sm flex items-center gap-1.5">
          <Calendar className="w-4 h-4" />
          {new Date(event.event_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-6xl mx-auto w-full flex-1">
        {uploads.length === 0 ? (
          <div className="text-center py-24 flex flex-col items-center justify-center gap-4 bg-white border border-[#EAE9E4] rounded-3xl p-8">
            <Camera className="w-12 h-12 text-slate-200 stroke-[1.2]" />
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-slate-700">Galeri henüz boş</p>
              <p className="text-xs text-slate-400">İlk kareler paylaşıldığında burada sergilenecektir.</p>
            </div>
            <Link 
              href={`/e/${event.slug}`}
              className="bg-slate-800 text-[#FAF9F5] hover:bg-slate-700 px-6 py-2.5 rounded-full text-xs font-semibold shadow-sm mt-2"
            >
              Fotoğraf Yükle
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {uploads.map((upload, idx) => (
              <div 
                key={upload.id}
                onClick={() => setLightboxIndex(idx)}
                className="group aspect-square rounded-2xl overflow-hidden border border-slate-100 bg-white hover:shadow-md cursor-pointer transition-all duration-300 relative"
              >
                {upload.file_type.startsWith('video/') ? (
                  <div className="relative w-full h-full">
                    <video src={upload.file_url} className="w-full h-full object-cover" controls={false} />
                    <div className="absolute top-2 right-2 bg-black/60 text-[#FAF9F5] p-1.5 rounded-full">
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={upload.file_url} 
                    alt="Gallery item" 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}

                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <div className="text-[10px] text-white font-medium truncate w-full flex items-center justify-between">
                    <span>{upload.guest_name || 'Misafir'}</span>
                    <Eye className="w-3 h-3 shrink-0" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Lightbox Overlay */}
      {lightboxIndex !== null && (
        <div 
          onClick={() => setLightboxIndex(null)}
          className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-6 select-none"
        >
          {/* Top Actions */}
          <div className="flex items-center justify-between text-[#FAF9F5] z-10">
            <span className="text-xs font-medium">
              {lightboxIndex + 1} / {uploads.length} • {uploads[lightboxIndex].guest_name || 'Misafir'}
            </span>
            <button 
              onClick={() => setLightboxIndex(null)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Image & Navigation Controls */}
          <div className="flex-1 flex items-center justify-center relative">
            <button 
              onClick={handlePrev}
              className="absolute left-0 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="max-w-4xl max-h-[75vh] flex items-center justify-center p-4">
              {uploads[lightboxIndex].file_type.startsWith('video/') ? (
                <video 
                  src={uploads[lightboxIndex].file_url} 
                  className="max-w-full max-h-[70vh] rounded-lg shadow-2xl" 
                  controls 
                  autoPlay
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={uploads[lightboxIndex].file_url} 
                  alt="Lightbox Preview" 
                  className="max-w-full max-h-[70vh] rounded-lg shadow-2xl object-contain"
                />
              )}
            </div>

            <button 
              onClick={handleNext}
              className="absolute right-0 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Bottom Actions */}
          <div className="flex justify-center pb-2 z-10">
            <a
              href={uploads[lightboxIndex].file_url}
              download={`lamour-gallery-${uploads[lightboxIndex].id}.jpg`}
              onClick={(e) => e.stopPropagation()}
              className="bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold px-5 py-2.5 rounded-full flex items-center gap-1.5 shadow-md transition-all"
            >
              <Download className="w-4 h-4" />
              Görseli İndir
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
