'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { eventService, WeddingEvent } from '@/lib/db';
import { toast } from 'sonner';
import { Plus, Calendar, Trash2, ArrowRight, QrCode } from 'lucide-react';

export default function EventsPage() {
  const [events, setEvents] = useState<WeddingEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await eventService.getMyEvents();
        setEvents(data);
      } catch (error) {
        toast.error('Etkinlikler yüklenirken bir hata oluştu.');
      } finally {
        setIsLoading(false);
      }
    }
    loadEvents();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" etkinliğini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve tüm fotoğraflar silinir.`)) {
      return;
    }

    try {
      await eventService.deleteEvent(id);
      setEvents(events.filter(e => e.id !== id));
      toast.success('Etkinlik başarıyla silindi.');
    } catch (error) {
      toast.error('Etkinlik silinirken bir hata oluştu.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-10 bg-slate-200 w-1/3 rounded-lg" />
        <div className="h-64 bg-slate-200 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="serif-heading text-2xl sm:text-3xl font-normal text-slate-800">Etkinliklerim</h1>
          <p className="text-slate-400 text-xs sm:text-sm">Oluşturduğunuz tüm davet ve organizasyonlar</p>
        </div>
        <Link
          href="/dashboard/events/new"
          className="bg-slate-800 text-[#FAF9F5] hover:bg-slate-700 transition-all rounded-full px-5 py-2.5 flex items-center justify-center gap-2 text-xs font-semibold shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Yeni Etkinlik Oluştur
        </Link>
      </div>

      <div className="bg-white border border-[#EAE9E4] rounded-3xl p-6 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.02)]">
        {events.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center justify-center gap-4">
            <QrCode className="w-12 h-12 text-slate-300 stroke-[1.5]" />
            <div>
              <p className="text-sm font-semibold text-slate-700">Henüz etkinlik oluşturmadınız</p>
              <p className="text-xs text-slate-400">Hemen ilk etkinliğinizi oluşturup QR kodunu edinin.</p>
            </div>
            <Link
              href="/dashboard/events/new"
              className="bg-slate-800 text-[#FAF9F5] hover:bg-slate-700 transition-all rounded-full px-6 py-2.5 text-xs font-semibold shadow-sm mt-2"
            >
              Etkinlik Ekle
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-500">
              <thead className="text-xs text-slate-400 uppercase border-b border-slate-100 bg-[#FAF9F5]/50">
                <tr>
                  <th className="px-6 py-4 font-semibold">Etkinlik Adı</th>
                  <th className="px-6 py-4 font-semibold">Tarih</th>
                  <th className="px-6 py-4 font-semibold">Tip</th>
                  <th className="px-6 py-4 font-semibold">Slug/Link</th>
                  <th className="px-6 py-4 font-semibold text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800 serif-heading text-base">
                      {event.title}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(event.event_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium uppercase text-slate-400">
                      {event.event_type === 'wedding' ? 'Düğün' : event.event_type}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600">
                      /e/{event.slug}
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2.5">
                      <Link
                        href={`/dashboard/events/${event.id}`}
                        className="text-slate-600 hover:text-slate-800 p-2 hover:bg-slate-100 rounded-full transition-colors flex items-center justify-center"
                        title="Detayları Görüntüle"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(event.id, event.title)}
                        className="text-destructive hover:bg-red-50 p-2 rounded-full transition-colors flex items-center justify-center cursor-pointer"
                        title="Etkinliği Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
