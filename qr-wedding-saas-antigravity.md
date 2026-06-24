# QR Wedding SaaS MVP – Antigravity Geliştirme Dokümanı

## Proje Amacı

Düğün, nişan, mezuniyet ve özel etkinliklerde misafirlerin QR kod okutarak fotoğraf/video yükleyebildiği, etkinlik sahibinin ise tüm içerikleri tek panelden görebildiği ve indirebildiği bir SaaS MVP geliştirilecek.

Bu MVP'nin amacı:
- Her etkinlik için özel QR linki oluşturmak
- Misafirlerin uygulama indirmeden fotoğraf/video yüklemesini sağlamak
- Her misafir veya cihaz için yükleme limiti koymak
- Etkinlik sahibine galeri ve ZIP indirme paneli sunmak
- İleride düğün firmalarına, organizasyon şirketlerine ve davetiye/karşılama panosu satan markalara B2B olarak satılabilecek temel altyapıyı oluşturmak

---

## MVP Kapsamı

İlk sürümde yalnızca gerekli özellikler yapılacak.

### Kullanıcı Rolleri

1. Admin / SaaS Sahibi
2. Etkinlik Sahibi
3. Misafir

---

## Temel Akış

### 1. Etkinlik Sahibi Akışı

Etkinlik sahibi sisteme giriş yapar.

Panelden yeni etkinlik oluşturur:

- Etkinlik adı
- Çift / kişi adı
- Etkinlik tarihi
- Etkinlik tipi: Düğün, Nişan, Mezuniyet, Doğum Günü, Kurumsal Etkinlik
- Maksimum yükleme limiti
- Fotoğraf başına maksimum dosya boyutu
- Video yükleme açık/kapalı
- Galeri yayında mı?
- Canlı ekran açık/kapalı

Sistem otomatik olarak bir etkinlik linki oluşturur:

```text
https://domain.com/e/dugun-abc123
```

Bu link için QR kod üretilir.

Etkinlik sahibi panelden:
- QR kodu indirir
- Galeriyi görüntüler
- Fotoğrafları seçer/siler
- Tüm fotoğrafları ZIP olarak indirir

---

### 2. Misafir Akışı

Misafir QR kodu okutur.

Şu sayfa açılır:

```text
/e/dugun-abc123
```

Sayfada:
- Etkinlik başlığı
- Kısa açıklama
- Fotoğraf/video yükleme alanı
- Opsiyonel isim alanı
- Kalan yükleme hakkı
- Yükleme başarılı mesajı

Misafir:
- Kameradan fotoğraf çeker
- Galeriden fotoğraf seçer
- Yükler
- İçerik etkinlik galerisine kaydedilir

Misafir için hesap açma zorunlu olmayacak.

---

## Teknoloji Stack

### Frontend

Tercih edilen stack:

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod

Sebep:
- Hızlı MVP geliştirme
- SEO dostu yapı
- Vercel deploy kolaylığı
- Admin panel ve public upload sayfaları için uygun

Alternatif:
- Flutter Web kullanılabilir ama SEO ve hızlı SaaS panel geliştirme için Next.js daha mantıklı.

---

### Backend

- Supabase Auth
- Supabase PostgreSQL
- Supabase Storage
- Supabase Row Level Security
- Supabase Edge Functions opsiyonel

---

### Deploy

- Vercel
- Supabase

---

## Kurulumda Antigravity'nin Yapması Gerekenler

Önce proje oluştur:

```bash
npx create-next-app@latest qr-wedding-saas
```

Seçenekler:

```text
TypeScript: Yes
ESLint: Yes
Tailwind CSS: Yes
src directory: Yes
App Router: Yes
Turbopack: Yes
Import alias: @/*
```

Projeye gir:

```bash
cd qr-wedding-saas
```

Gerekli paketleri kur:

```bash
npm install @supabase/supabase-js @supabase/ssr
npm install zod react-hook-form @hookform/resolvers
npm install qrcode
npm install jszip file-saver
npm install lucide-react
npm install clsx tailwind-merge
```

shadcn/ui kur:

```bash
npx shadcn@latest init
```

Gerekli UI componentlerini ekle:

```bash
npx shadcn@latest add button card input label textarea dialog dropdown-menu table badge toast
```

---

## Environment Değişkenleri

`.env.local` dosyası oluştur:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Service role key sadece server-side işlemlerde kullanılacak. Client tarafına expose edilmeyecek.

---

## Veritabanı Tabloları

Supabase içinde aşağıdaki tablolar oluşturulacak.

### profiles

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  company_name text,
  created_at timestamp with time zone default now()
);
```

---

### events

```sql
create table events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  title text not null,
  slug text unique not null,
  event_type text default 'wedding',
  event_date date,
  description text,
  upload_limit_per_guest int default 10,
  max_file_size_mb int default 15,
  allow_video boolean default false,
  gallery_public boolean default false,
  live_screen_enabled boolean default false,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);
```

---

### uploads

```sql
create table uploads (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade,
  guest_name text,
  guest_device_id text,
  file_url text not null,
  file_path text not null,
  file_type text,
  file_size int,
  is_approved boolean default true,
  created_at timestamp with time zone default now()
);
```

---

## Storage Bucket

Supabase Storage içinde bucket oluştur:

```text
event-uploads
```

Klasör yapısı:

```text
event-uploads/
  event-slug/
    upload-id.jpg
    upload-id.mp4
```

---

## RLS Kuralları

MVP için basit kurallar:

### events

- Etkinlik sahibi kendi eventlerini görebilir.
- Etkinlik sahibi kendi eventlerini oluşturabilir.
- Public upload sayfası aktif eventleri slug üzerinden okuyabilir.

### uploads

- Misafir aktif evente upload ekleyebilir.
- Etkinlik sahibi kendi eventine ait uploadları görebilir.
- Etkinlik sahibi kendi eventine ait uploadları silebilir/gizleyebilir.

---

## Sayfa Yapısı

```text
src/
  app/
    page.tsx
    login/
      page.tsx
    register/
      page.tsx
    dashboard/
      page.tsx
    dashboard/events/
      page.tsx
    dashboard/events/new/
      page.tsx
    dashboard/events/[id]/
      page.tsx
    e/[slug]/
      page.tsx
    g/[slug]/
      page.tsx
    live/[slug]/
      page.tsx
  components/
    EventForm.tsx
    UploadDropzone.tsx
    QRCodeCard.tsx
    GalleryGrid.tsx
    DashboardSidebar.tsx
  lib/
    supabase/
      client.ts
      server.ts
    utils.ts
    qr.ts
    upload.ts
```

---

## Sayfalar

### Ana Sayfa

Landing page olacak.

Başlık:

```text
Düğününüzdeki tüm anıları QR kod ile tek albümde toplayın.
```

Alt metin:

```text
Misafirleriniz uygulama indirmeden QR kodu okutur, fotoğraf ve videolarını yükler. Siz tüm anıları tek panelden görüntüler ve indirirsiniz.
```

CTA:

```text
Demo Oluştur
```

Bölümler:
- Nasıl çalışır?
- Özellikler
- Paketler
- Sık sorulan sorular

---

### Dashboard

Etkinlik sahibinin paneli.

Gösterilecekler:
- Toplam etkinlik sayısı
- Toplam fotoğraf sayısı
- Aktif etkinlikler
- Son yüklenen fotoğraflar

---

### Yeni Etkinlik Oluşturma

Form alanları:
- Etkinlik adı
- Etkinlik tipi
- Tarih
- Açıklama
- Kişi başı yükleme limiti
- Video yükleme açık/kapalı
- Canlı ekran açık/kapalı

Submit sonrası:
- Event oluştur
- Slug oluştur
- QR kod oluştur
- Event detay sayfasına yönlendir

---

### Event Detay Sayfası

İçerikler:
- Event bilgileri
- QR kod
- Public upload linki
- Galeri linki
- Canlı ekran linki
- Fotoğraf listesi
- Sil/Gizle butonu
- ZIP indir butonu

---

### Public Upload Sayfası

URL:

```text
/e/[slug]
```

İçerikler:
- Event başlığı
- Açıklama
- Dosya seç/yükle
- Kamera ile çek
- İsim alanı
- Kalan yükleme hakkı
- Başarılı yükleme mesajı

Misafir limiti:
- İlk girişte localStorage içine `guest_device_id` oluştur.
- Upload sayısı bu device_id ile takip edilir.
- Limit dolduysa yükleme kapatılır.

---

### Public Galeri Sayfası

URL:

```text
/g/[slug]
```

Sadece `gallery_public = true` ise açılır.

Gösterilecekler:
- Onaylı fotoğraflar
- Grid görünüm
- Lightbox

---

### Live Screen Sayfası

URL:

```text
/live/[slug]
```

Düğün salonunda TV'ye yansıtılacak ekran.

Özellik:
- Son yüklenen fotoğraflar büyük ekranda otomatik değişir.
- 5-10 saniyede bir fotoğraf değişir.
- Yeni fotoğraf geldikçe ekrana düşer.

---

## MVP'de Olması Gereken Özellikler

### Zorunlu

- Kullanıcı kayıt/giriş
- Event oluşturma
- QR kod üretme
- Public upload linki
- Fotoğraf yükleme
- Upload limiti
- Admin galeri
- Fotoğraf silme/gizleme
- ZIP indirme
- Responsive tasarım

### Olursa İyi Olur

- Public galeri
- Live screen
- Video yükleme
- Misafir mesajı
- Basit paket sayfası
- Demo event

### MVP Sonrası

- Online ödeme
- Abonelik sistemi
- AI ile bulanık fotoğraf eleme
- Yüz tanıma ile kişiye özel albüm
- Marka/ajans paneli
- Düğün salonu için çoklu etkinlik yönetimi
- Canva/PNG QR tasarım çıktısı
- WhatsApp ile galeri paylaşımı

---

## Tasarım Dili

Modern, temiz, premium ve düğün sektörüne uygun olmalı.

Stil:
- Açık arka plan
- Soft krem/beyaz tonlar
- Yuvarlak kartlar
- Büyük başlıklar
- Minimal ikonlar
- Mobil öncelikli tasarım

Örnek his:
- Premium wedding SaaS
- Minimal davetiye estetiği
- Kolay anlaşılır dashboard

---

## Paketler

Landing page içinde örnek paketler gösterilecek.

### Başlangıç

```text
2.490 TL
```

- 1 etkinlik
- 500 fotoğraf
- QR upload sayfası
- Galeri paneli
- ZIP indirme

### Premium

```text
4.990 TL
```

- 1 etkinlik
- 2.000 fotoğraf
- Video yükleme
- Canlı ekran
- Public galeri
- 6 ay saklama

### Kurumsal

```text
Teklif Al
```

- Düğün salonları
- Organizasyon firmaları
- Sınırsız etkinlik
- Marka paneli
- Özel destek

---

## İlk Demo İçeriği

Demo için örnek event oluştur:

```text
Elif & Can Düğün Anıları
```

Slug:

```text
elif-can-dugun
```

Açıklama:

```text
Bu özel geceden yakaladığınız anıları bizimle paylaşın. QR kodu okutup fotoğraflarınızı yükleyebilirsiniz.
```

---

## Geliştirme Sırası

### Aşama 1

- Next.js kurulumu
- Tailwind/shadcn kurulumu
- Supabase bağlantısı
- Auth sistemi

### Aşama 2

- Event CRUD
- Dashboard
- QR kod üretimi

### Aşama 3

- Public upload sayfası
- Supabase Storage upload
- Upload limiti

### Aşama 4

- Admin galeri
- Sil/Gizle
- ZIP indir

### Aşama 5

- Landing page
- Public galeri
- Live screen
- Demo event

---

## Kabul Kriterleri

MVP tamamlanmış sayılması için:

- Kullanıcı kayıt olup giriş yapabilmeli.
- Kullanıcı yeni etkinlik oluşturabilmeli.
- Her etkinlik için özel upload linki ve QR kod oluşmalı.
- Misafir QR linkinden fotoğraf yükleyebilmeli.
- Misafir başına yükleme limiti çalışmalı.
- Etkinlik sahibi panelde fotoğrafları görebilmeli.
- Etkinlik sahibi tüm fotoğrafları indirebilmeli.
- Sistem mobilde sorunsuz çalışmalı.

---

## Antigravity İçin Net Talimat

Bu projeyi production'a yakın bir MVP olarak geliştir.

Öncelik:
1. Çalışan sistem
2. Temiz kod
3. Mobil uyumluluk
4. Supabase entegrasyonu
5. Basit ama premium UI

Gereksiz karmaşadan kaçın. Önce MVP'yi çalışır hale getir. Sonra ek özellikleri sırayla geliştir.
