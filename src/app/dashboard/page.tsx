'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { eventService, uploadService, WeddingEvent } from '@/lib/db';
import { toast } from 'sonner';
import { Plus, Camera, FileImage, QrCode, Calendar, ArrowRight, Eye } from 'lucide-react';

export default function DashboardPage() {
  const [events, setEvents] = useState<WeddingEvent[]>([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalUploads: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const myEvents = await eventService.getMyEvents();
        setEvents(myEvents);
        
        let uploadCount = 0;
        for (const ev of myEvents) {
          const uploads = await uploadService.getEventUploads(ev.id);
          uploadCount += uploads.length;
        }

        setStats({
          totalEvents: myEvents.length,
          totalUploads: uploadCount,
        });
      } catch (error) {
        toast.error('Veriler yüklenirken bir sorun oluştu.');
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-10 bg-slate-200 w-1/3 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-28 bg-slate-200 rounded-3xl" />
          <div className="h-28 bg-slate-200 rounded-3xl" />
          <div className="h-28 bg-slate-200 rounded-3xl" />
        </div>
        <div className="h-64 bg-slate-200 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="serif-heading text-2xl sm:text-3xl font-normal text-slate-800">Yönetim Paneli</h1>
          <p className="text-slate-400 text-xs sm:text-sm">Tüm özel günlerinizi ve misafir paylaşımlarını buradan takip edin</p>
        </div>
        <Link
          href="/dashboard/events/new"
          className="bg-slate-800 text-[#FAF9F5] hover:bg-slate-700 transition-all rounded-full px-5 py-2.5 flex items-center justify-center gap-2 text-xs font-semibold shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Yeni Etkinlik Oluştur
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="premium-card rounded-3xl p-6 flex items-center gap-4 bg-white">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Toplam Etkinlik</p>
            <h3 className="serif-heading text-2xl font-semibold text-slate-800">{stats.totalEvents}</h3>
          </div>
        </div>

        <div className="premium-card rounded-3xl p-6 flex items-center gap-4 bg-white">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center shadow-sm">
            <FileImage className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Yüklenen İçerik</p>
            <h3 className="serif-heading text-2xl font-semibold text-slate-800">{stats.totalUploads}</h3>
          </div>
        </div>

        <div className="premium-card rounded-3xl p-6 flex items-center gap-4 bg-white">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Depolama Tipi</p>
            <h3 className="serif-heading text-lg font-semibold text-slate-700">Bulut / Sınırsız</h3>
          </div>
        </div>
      </div>

      {/* Events Listing */}
      <div className="bg-white border border-[#EAE9E4] rounded-3xl p-6 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.02)]">
        <h2 className="serif-heading text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
          Etkinlikleriniz
        </h2>

        {events.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center justify-center gap-4 border border-dashed border-slate-200 rounded-2xl bg-[#FAF9F5]/50">
            <QrCode className="w-12 h-12 text-slate-300 stroke-[1.5]" />
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-slate-700">Henüz bir etkinlik oluşturmadınız</p>
              <p className="text-xs text-slate-400">İlk etkinliğinizi saniyeler içinde kurup QR kodunu üretebilirsiniz.</p>
            </div>
            <Link
              href="/dashboard/events/new"
              className="bg-slate-800 text-[#FAF9F5] hover:bg-slate-700 transition-all rounded-full px-6 py-2.5 text-xs font-semibold shadow-sm mt-2"
            >
              Başlamak için Tıklayın
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {events.map((event) => (
              <div 
                key={event.id}
                className="group border border-[#EAE9E4] hover:border-slate-300 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 bg-[#FAF9F5]/30 hover:bg-white"
              >
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="serif-heading text-base font-semibold text-slate-800">{event.title}</span>
                    <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/50">
                      {event.event_type === 'wedding' ? 'Düğün' : event.event_type}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(event.event_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <span>Link: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-600">/e/{event.slug}</code></span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href={`/dashboard/events/${event.id}`}
                    className="text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-[#FAF9F5] px-4 py-2.5 rounded-full flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  >
                    Detay ve Galeri
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <a
                    href={`/e/${event.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-full flex items-center gap-1.5 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Misafir Sayfası
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
