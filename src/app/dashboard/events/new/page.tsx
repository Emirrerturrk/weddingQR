'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { eventService } from '@/lib/db';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Save } from 'lucide-react';

export default function NewEventPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [eventType, setEventType] = useState('wedding');
  const [eventDate, setEventDate] = useState('');
  const [description, setDescription] = useState('');
  const [uploadLimit, setUploadLimit] = useState(10);
  const [maxFileSize, setMaxFileSize] = useState(15);
  const [allowVideo, setAllowVideo] = useState(false);
  const [galleryPublic, setGalleryPublic] = useState(false);
  const [liveScreenEnabled, setLiveScreenEnabled] = useState(false);

  // Helper to slugify title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    // Convert to lowercase, replace Turkish chars, remove non-alphanumeric, replace spaces with dash
    let generatedSlug = val
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    setSlug(generatedSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !eventDate) {
      toast.error('Lütfen gerekli tüm alanları doldurun.');
      return;
    }

    setIsLoading(true);
    try {
      const newEvent = await eventService.createEvent({
        title,
        slug,
        event_type: eventType,
        event_date: eventDate,
        description,
        upload_limit_per_guest: Number(uploadLimit),
        max_file_size_mb: Number(maxFileSize),
        allow_video: allowVideo,
        gallery_public: galleryPublic,
        live_screen_enabled: liveScreenEnabled,
      });

      toast.success('Etkinlik başarıyla oluşturuldu!');
      router.push(`/dashboard/events/${newEvent.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Etkinlik oluşturulurken bir hata meydana geldi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="p-2 border border-slate-200 rounded-full hover:bg-slate-50 transition-colors text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="serif-heading text-xl sm:text-2xl font-normal text-slate-800">Yeni Etkinlik Oluştur</h1>
          <p className="text-slate-400 text-xs">Dijital albümünüz için gerekli ayarları belirleyin</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-8">
        {/* Left Form Settings */}
        <div className="md:col-span-2 flex flex-col gap-6 bg-white border border-[#EAE9E4] rounded-3xl p-6 sm:p-8 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.02)]">
          <h2 className="serif-heading text-base font-semibold text-slate-800 border-b border-slate-100 pb-3">Etkinlik Bilgileri</h2>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600" htmlFor="title">
                Etkinlik Başlığı <span className="text-amber-600">*</span>
              </label>
              <input
                id="title"
                type="text"
                placeholder="Elif & Can Düğün Anıları"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 bg-[#FAF9F5]/40"
                disabled={isLoading}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600" htmlFor="slug">
                Etkinlik Bağlantısı (Slug) <span className="text-amber-600">*</span>
              </label>
              <div className="flex items-center">
                <span className="bg-slate-100 border border-r-0 border-slate-200 px-3 py-2.5 rounded-l-xl text-xs font-mono text-slate-400 select-none">
                  /e/
                </span>
                <input
                  id="slug"
                  type="text"
                  placeholder="elif-can-dugun"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  className="w-full border border-slate-200 rounded-r-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 bg-[#FAF9F5]/40"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600" htmlFor="eventType">
                Etkinlik Türü
              </label>
              <select
                id="eventType"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 bg-[#FAF9F5]/40 cursor-pointer"
                disabled={isLoading}
              >
                <option value="wedding">Düğün</option>
                <option value="engagement">Nişan / Söz</option>
                <option value="graduation">Mezuniyet</option>
                <option value="birthday">Doğum Günü</option>
                <option value="corporate">Kurumsal Etkinlik</option>
                <option value="other">Diğer</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600" htmlFor="eventDate">
                Etkinlik Tarihi <span className="text-amber-600">*</span>
              </label>
              <input
                id="eventDate"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 bg-[#FAF9F5]/40"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600" htmlFor="description">
              Kısa Açıklama <span className="text-slate-400 font-normal">(Misafirlere gösterilecek karşılama metni)</span>
            </label>
            <textarea
              id="description"
              placeholder="Bu özel geceden yakaladığınız en güzel anları bizimle paylaşın. QR kodu okutup fotoğraflarınızı yükleyebilirsiniz."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 bg-[#FAF9F5]/40 h-24 resize-none"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Right Restrictions & Features Settings */}
        <div className="flex flex-col gap-6">
          <div className="bg-white border border-[#EAE9E4] rounded-3xl p-6 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.02)] flex flex-col gap-6">
            <h2 className="serif-heading text-base font-semibold text-slate-800 border-b border-slate-100 pb-3">Yükleme Ayarları</h2>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600" htmlFor="uploadLimit">
                Kişi Başı Yükleme Limiti
              </label>
              <input
                id="uploadLimit"
                type="number"
                min="1"
                max="100"
                value={uploadLimit}
                onChange={(e) => setUploadLimit(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 bg-[#FAF9F5]/40"
                disabled={isLoading}
                required
              />
              <span className="text-[10px] text-slate-400">Tek bir cihazın yükleyebileceği maksimum dosya sayısı</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600" htmlFor="maxFileSize">
                Maksimum Dosya Boyutu (MB)
              </label>
              <input
                id="maxFileSize"
                type="number"
                min="1"
                max="50"
                value={maxFileSize}
                onChange={(e) => setMaxFileSize(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 bg-[#FAF9F5]/40"
                disabled={isLoading}
                required
              />
              <span className="text-[10px] text-slate-400">Dosya başına yüklenebilecek maksimum boyut (örn: 15MB)</span>
            </div>

            <div className="h-[1px] bg-slate-100 w-full" />

            <div className="flex flex-col gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowVideo}
                  onChange={(e) => setAllowVideo(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 w-4.5 h-4.5 border-slate-300"
                  disabled={isLoading}
                />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-700">Video Yüklemeye İzin Ver</span>
                  <span className="text-[10px] text-slate-400">Aktif edilirse misafirler kısa videolar yükleyebilir</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={galleryPublic}
                  onChange={(e) => setGalleryPublic(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 w-4.5 h-4.5 border-slate-300"
                  disabled={isLoading}
                />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-700">Ortak Galeri Aktif</span>
                  <span className="text-[10px] text-slate-400">Misafirler kendi yüklediklerinin yanı sıra diğer yüklenenleri de görebilir</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={liveScreenEnabled}
                  onChange={(e) => setLiveScreenEnabled(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 w-4.5 h-4.5 border-slate-300"
                  disabled={isLoading}
                />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-700">Canlı Ekran Özelliği</span>
                  <span className="text-[10px] text-slate-400">Salondaki projeksiyonda fotoğrafları otomatik döndürmeyi açar</span>
                </div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full font-semibold bg-slate-800 hover:bg-slate-700 text-[#FAF9F5] hover:shadow-md disabled:bg-slate-400 transition-all rounded-full py-3.5 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Etkinliği Kaydet
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
