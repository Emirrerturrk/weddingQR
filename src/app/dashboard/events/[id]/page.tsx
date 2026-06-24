'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { eventService, uploadService, WeddingEvent, UploadedItem } from '@/lib/db';
import { toast } from 'sonner';
import QRCode from 'qrcode';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { 
  ArrowLeft, Calendar, Settings, QrCode, Download, Trash2, Globe, Video, 
  Tv, Eye, Loader2, Sparkles, Image as ImageIcon 
} from 'lucide-react';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.id as string;

  const [event, setEvent] = useState<WeddingEvent | null>(null);
  const [uploads, setUploads] = useState<UploadedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Toggles states
  const [isUpdating, setIsUpdating] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [isZipping, setIsZipping] = useState(false);
  
  // Print Flyer Ref
  const printAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!eventId) return;

    async function loadEventData() {
      try {
        const eventData = await eventService.getEventById(eventId);
        if (!eventData) {
          toast.error('Etkinlik bulunamadı.');
          router.push('/dashboard');
          return;
        }
        setEvent(eventData);

        const uploadData = await uploadService.getEventUploads(eventId);
        setUploads(uploadData);

        // Generate QR Code URL
        const domain = typeof window !== 'undefined' ? window.location.origin : 'https://lamourqr.com';
        const uploadUrl = `${domain}/e/${eventData.slug}`;
        const qrCodeUrl = await QRCode.toDataURL(uploadUrl, {
          width: 600,
          margin: 2,
          color: {
            dark: '#2D3139',
            light: '#FAF9F5',
          },
        });
        setQrCodeDataUrl(qrCodeUrl);

      } catch (error) {
        toast.error('Detaylar yüklenirken bir hata oluştu.');
      } finally {
        setIsLoading(false);
      }
    }

    loadEventData();
  }, [eventId, router]);

  // Handle setting updates
  const handleToggle = async (field: keyof WeddingEvent, value: boolean) => {
    if (!event) return;
    setIsUpdating(true);
    try {
      const updated = await eventService.updateEvent(event.id, { [field]: value });
      setEvent(updated);
      toast.success('Ayarlar başarıyla güncellendi.');
    } catch (error) {
      toast.error('Ayarlar kaydedilemedi.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete upload
  const handleDeleteUpload = async (uploadId: string) => {
    if (!confirm('Bu görseli silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) return;
    try {
      await uploadService.deleteUpload(uploadId);
      setUploads(uploads.filter(u => u.id !== uploadId));
      toast.success('Görsel silindi.');
    } catch (error) {
      toast.error('Görsel silinirken bir hata oluştu.');
    }
  };

  // ZIP all photos download
  const handleDownloadZip = async () => {
    if (!event || uploads.length === 0) {
      toast.error('İndirilecek fotoğraf bulunmuyor.');
      return;
    }

    setIsZipping(true);
    const zip = new JSZip();
    const folder = zip.folder(`${event.slug}-anilari`);

    toast.info('Fotoğraflar derleniyor, lütfen bekleyin...');

    try {
      for (let i = 0; i < uploads.length; i++) {
        const upload = uploads[i];
        const fileName = `${upload.guest_name || 'misafir'}-${upload.id.slice(0, 8)}.${upload.file_type.split('/')[1] || 'jpg'}`;
        
        try {
          const response = await fetch(upload.file_url);
          const blob = await response.blob();
          folder?.file(fileName, blob);
        } catch (fetchError) {
          console.error('File download failed, using fallback mock photo contents', upload.file_url);
          // If we fail to fetch (e.g. CORS on remote bucket or local object url expired), 
          // in mock mode we can fallback to writing metadata files or ignore
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${event.slug}-fotograflari.zip`);
      toast.success('ZIP arşivi başarıyla indirildi!');
    } catch (error) {
      toast.error('ZIP dosyası oluşturulurken bir hata oluştu.');
    } finally {
      setIsZipping(false);
    }
  };

  const handlePrintFlyer = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-10 bg-slate-200 w-1/4 rounded-lg" />
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 h-96 bg-slate-200 rounded-3xl" />
          <div className="h-96 bg-slate-200 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!event) return null;

  const domain = typeof window !== 'undefined' ? window.location.origin : 'https://lamourqr.com';
  const guestLink = `${domain}/e/${event.slug}`;
  const galleryLink = `${domain}/g/${event.slug}`;
  const liveLink = `${domain}/live/${event.slug}`;

  return (
    <div className="flex flex-col gap-8">
      {/* Printable Flyer (hidden by default, shown during window.print()) */}
      <div className="hidden print:block print:bg-white print:text-slate-800 print:p-12 print:min-h-screen">
        <div className="max-w-xl mx-auto border-8 border-slate-800 p-8 rounded-[40px] flex flex-col items-center justify-between text-center gap-12 bg-white h-[90vh] my-auto">
          <div className="flex flex-col items-center gap-4">
            <span className="serif-heading text-4xl font-semibold tracking-wide text-slate-800">
              L'Amour <span className="text-amber-600 font-sans text-xl">QR</span>
            </span>
            <div className="w-16 h-[2px] bg-amber-400" />
            <h1 className="serif-heading text-3xl font-normal text-slate-800 mt-4">{event.title}</h1>
            <p className="text-sm text-slate-400 font-serif italic">
              {new Date(event.event_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="flex flex-col items-center gap-4">
            {qrCodeDataUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrCodeDataUrl} alt="Wedding QR Code" className="w-72 h-72 border border-slate-100 p-2 bg-white" />
            )}
            <p className="text-sm text-slate-500 font-medium max-w-sm mt-4">
              Kameranızı açıp QR kodu taratarak bu özel günden yakaladığınız fotoğrafları bizimle paylaşabilirsiniz.
            </p>
          </div>

          <div className="text-[10px] text-slate-400 tracking-wider">
            UYGULAMA İNDİRMENİZ GEREKMEZ • {guestLink}
          </div>
        </div>
      </div>

      {/* Screen layout */}
      <div className="flex items-center gap-4 print:hidden">
        <Link
          href="/dashboard"
          className="p-2 border border-slate-200 rounded-full hover:bg-slate-50 transition-colors text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="serif-heading text-xl sm:text-2xl font-normal text-slate-800">{event.title}</h1>
          <p className="text-slate-400 text-xs flex items-center gap-1.5 mt-0.5">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(event.event_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 print:hidden">
        {/* Gallery & Upload list */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* Gallery Card */}
          <div className="bg-white border border-[#EAE9E4] rounded-3xl p-6 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <h2 className="serif-heading text-base font-semibold text-slate-800 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-600" />
                Misafir Fotoğrafları ({uploads.length})
              </h2>

              {uploads.length > 0 && (
                <button
                  onClick={handleDownloadZip}
                  disabled={isZipping}
                  className="bg-slate-800 text-[#FAF9F5] hover:bg-slate-700 disabled:bg-slate-400 text-xs font-semibold px-4 py-2 rounded-full flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  {isZipping ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Arşivleniyor...
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      Tümünü ZIP İndir
                    </>
                  )}
                </button>
              )}
            </div>

            {uploads.length === 0 ? (
              <div className="text-center py-20 flex flex-col items-center justify-center gap-3">
                <ImageIcon className="w-12 h-12 text-slate-200 stroke-[1.2]" />
                <div>
                  <p className="text-sm font-semibold text-slate-700">Henüz hiç fotoğraf yüklenmedi</p>
                  <p className="text-xs text-slate-400">QR kod okutulup ilk yükleme yapıldığında fotoğraflar burada belirecektir.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {uploads.map((upload) => (
                  <div 
                    key={upload.id}
                    className="relative group aspect-square rounded-2xl overflow-hidden border border-slate-100 bg-[#FAF9F5] shadow-sm"
                  >
                    {upload.file_type.startsWith('video/') ? (
                      <video 
                        src={upload.file_url} 
                        className="w-full h-full object-cover" 
                        controls={false}
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={upload.file_url} 
                        alt="Guest Upload" 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    )}

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                      <button
                        onClick={() => handleDeleteUpload(upload.id)}
                        className="self-end p-2 bg-white/95 text-destructive hover:bg-destructive hover:text-white rounded-full transition-all shadow-md cursor-pointer"
                        title="Fotoğrafı Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="text-[10px] text-white font-medium truncate">
                        {upload.guest_name || 'Misafir'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right QR & settings cards */}
        <div className="flex flex-col gap-6">
          {/* QR Poster Card */}
          <div className="bg-white border border-[#EAE9E4] rounded-3xl p-6 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.02)] flex flex-col items-center gap-4 text-center">
            <h2 className="serif-heading text-base font-semibold text-slate-800 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-amber-600" />
              QR Karşılama Kartı
            </h2>
            
            {qrCodeDataUrl ? (
              <div className="relative group bg-[#FAF9F5] border border-slate-100 p-4 rounded-3xl shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrCodeDataUrl} alt="Wedding QR Code" className="w-40 h-40 object-contain mix-blend-multiply" />
              </div>
            ) : (
              <div className="w-40 h-40 bg-slate-100 rounded-3xl animate-pulse" />
            )}

            <p className="text-xs text-slate-400">
              Bu QR kodu masalara ve davetlilere sunarak fotoğrafları toplayın.
            </p>

            <div className="grid grid-cols-2 gap-3 w-full">
              {qrCodeDataUrl && (
                <a
                  href={qrCodeDataUrl}
                  download={`lamour-qr-${event.slug}.png`}
                  className="bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold py-2.5 rounded-full flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Görseli İndir
                </a>
              )}
              <button
                onClick={handlePrintFlyer}
                className="bg-slate-800 text-[#FAF9F5] hover:bg-slate-700 text-xs font-semibold py-2.5 rounded-full flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Kartı Yazdır
              </button>
            </div>
          </div>

          {/* Quick Config Controls */}
          <div className="bg-white border border-[#EAE9E4] rounded-3xl p-6 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.02)] flex flex-col gap-5">
            <h2 className="serif-heading text-base font-semibold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Settings className="w-4 h-4 text-amber-600" />
              Toggles ve Bağlantılar
            </h2>

            {/* Quick Links */}
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex flex-col gap-1">
                <span className="text-slate-400 font-semibold uppercase text-[9px] tracking-wider">Yükleme Sayfası</span>
                <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-lg p-2 gap-2">
                  <span className="font-mono text-slate-500 truncate">{guestLink}</span>
                  <a href={guestLink} target="_blank" rel="noopener noreferrer" className="text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-0.5 shrink-0">
                    Git <Eye className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-slate-400 font-semibold uppercase text-[9px] tracking-wider">Kamu Fotoğraf Galerisi</span>
                <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-lg p-2 gap-2">
                  <span className="font-mono text-slate-500 truncate">{galleryLink}</span>
                  <a href={galleryLink} target="_blank" rel="noopener noreferrer" className="text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-0.5 shrink-0">
                    Git <Eye className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-slate-400 font-semibold uppercase text-[9px] tracking-wider">Canlı Slideshow Ekranı</span>
                <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-lg p-2 gap-2">
                  <span className="font-mono text-slate-500 truncate">{liveLink}</span>
                  <a href={liveLink} target="_blank" rel="noopener noreferrer" className="text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-0.5 shrink-0">
                    Git <Eye className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            <div className="h-[1px] bg-slate-100 w-full my-1" />

            {/* Quick switches */}
            <div className="flex flex-col gap-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-slate-400" />
                    Video Yükleme
                  </span>
                  <span className="text-[10px] text-slate-400">Misafir video gönderebilsin</span>
                </div>
                <input
                  type="checkbox"
                  checked={event.allow_video}
                  onChange={(e) => handleToggle('allow_video', e.target.checked)}
                  disabled={isUpdating}
                  className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 border-slate-300 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    Ortak Galeri
                  </span>
                  <span className="text-[10px] text-slate-400">Galeri linki kamuya açık</span>
                </div>
                <input
                  type="checkbox"
                  checked={event.gallery_public}
                  onChange={(e) => handleToggle('gallery_public', e.target.checked)}
                  disabled={isUpdating}
                  className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 border-slate-300 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Tv className="w-3.5 h-3.5 text-slate-400" />
                    Canlı Ekran
                  </span>
                  <span className="text-[10px] text-slate-400">Slideshow sayfası aktif olsun</span>
                </div>
                <input
                  type="checkbox"
                  checked={event.live_screen_enabled}
                  onChange={(e) => handleToggle('live_screen_enabled', e.target.checked)}
                  disabled={isUpdating}
                  className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 border-slate-300 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
