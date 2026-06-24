import { supabase, isSupabaseConfigured } from './supabase/client';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  company_name: string;
}

export interface WeddingEvent {
  id: string;
  owner_id: string;
  title: string;
  slug: string;
  event_type: string;
  event_date: string;
  description: string;
  upload_limit_per_guest: number;
  max_file_size_mb: number;
  allow_video: boolean;
  gallery_public: boolean;
  live_screen_enabled: boolean;
  is_active: boolean;
  created_at: string;
}

export interface UploadedItem {
  id: string;
  event_id: string;
  guest_name: string;
  guest_device_id: string;
  file_url: string;
  file_path: string;
  file_type: string;
  file_size: number;
  is_approved: boolean;
  created_at: string;
}

// -------------------------------------------------------------
// LOCAL MOCK DATABASE STORAGE (Used if Supabase is not configured)
// -------------------------------------------------------------
const IS_SERVER = typeof window === 'undefined';

const getLocalData = <T>(key: string, defaultValue: T): T => {
  if (IS_SERVER) return defaultValue;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
};

const setLocalData = <T>(key: string, data: T): void => {
  if (IS_SERVER) return;
  localStorage.setItem(key, JSON.stringify(data));
};

// Global memory registry to persist object URLs across views during a single session (since they expire)
const mockFilesRegistry: Record<string, string> = {};

// -------------------------------------------------------------
// AUTH OPERATIONS
// -------------------------------------------------------------
export const authService = {
  async getCurrentUser(): Promise<UserProfile | null> {
    if (isSupabaseConfigured && supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      return {
        id: user.id,
        email: user.email || '',
        full_name: profile?.full_name || '',
        company_name: profile?.company_name || '',
      };
    } else {
      // Mock Auth
      const session = getLocalData<{ userId: string } | null>('wedding_session', null);
      if (!session) return null;
      const profiles = getLocalData<Record<string, UserProfile>>('wedding_profiles', {});
      return profiles[session.userId] || null;
    }
  },

  async signUp(email: string, password: string, fullName: string, companyName: string): Promise<UserProfile> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw new Error(error.message);
      if (!data.user) throw new Error('Signup failed');

      // Create profile
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: fullName,
        company_name: companyName,
      });

      if (profileError) throw new Error(profileError.message);

      return {
        id: data.user.id,
        email,
        full_name: fullName,
        company_name: companyName,
      };
    } else {
      // Mock Signup
      const profiles = getLocalData<Record<string, UserProfile>>('wedding_profiles', {});
      
      // Check if email already exists
      const existingUser = Object.values(profiles).find(p => p.email === email);
      if (existingUser) throw new Error('Email is already registered.');

      const newId = crypto.randomUUID();
      const newProfile: UserProfile = {
        id: newId,
        email,
        full_name: fullName,
        company_name: companyName,
      };

      profiles[newId] = newProfile;
      setLocalData('wedding_profiles', profiles);
      setLocalData('wedding_session', { userId: newId });

      return newProfile;
    }
  },

  async signIn(email: string, password: string): Promise<UserProfile> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      if (!data.user) throw new Error('Login failed');

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      return {
        id: data.user.id,
        email: data.user.email || '',
        full_name: profile?.full_name || '',
        company_name: profile?.company_name || '',
      };
    } else {
      // Mock Signin
      const profiles = getLocalData<Record<string, UserProfile>>('wedding_profiles', {});
      const user = Object.values(profiles).find(p => p.email === email);
      
      if (!user || password.length < 4) {
        throw new Error('Invalid email or password (mock needs password to be 4+ characters).');
      }

      setLocalData('wedding_session', { userId: user.id });
      return user;
    }
  },

  async signOut(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    } else {
      if (!IS_SERVER) {
        localStorage.removeItem('wedding_session');
      }
    }
  }
};

// -------------------------------------------------------------
// EVENT OPERATIONS
// -------------------------------------------------------------
export const eventService = {
  async getMyEvents(): Promise<WeddingEvent[]> {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data || [];
    } else {
      // Mock Get My Events
      const events = getLocalData<WeddingEvent[]>('wedding_events', []);
      return events.filter(e => e.owner_id === user.id);
    }
  },

  async getEventById(id: string): Promise<WeddingEvent | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();
      if (error) return null;
      return data;
    } else {
      const events = getLocalData<WeddingEvent[]>('wedding_events', []);
      return events.find(e => e.id === id) || null;
    }
  },

  async getEventBySlug(slug: string): Promise<WeddingEvent | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('slug', slug)
        .single();
      if (error) return null;
      return data;
    } else {
      const events = getLocalData<WeddingEvent[]>('wedding_events', []);
      return events.find(e => e.slug === slug) || null;
    }
  },

  async createEvent(eventData: Omit<WeddingEvent, 'id' | 'owner_id' | 'created_at' | 'is_active'>): Promise<WeddingEvent> {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('events')
        .insert({
          ...eventData,
          owner_id: user.id,
          is_active: true
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    } else {
      const events = getLocalData<WeddingEvent[]>('wedding_events', []);
      
      // Check slug uniqueness
      if (events.some(e => e.slug === eventData.slug)) {
        throw new Error('Bu link/slug başka bir etkinlik tarafından kullanılıyor.');
      }

      const newEvent: WeddingEvent = {
        ...eventData,
        id: crypto.randomUUID(),
        owner_id: user.id,
        is_active: true,
        created_at: new Date().toISOString()
      };

      events.push(newEvent);
      setLocalData('wedding_events', events);
      return newEvent;
    }
  },

  async updateEvent(id: string, updateData: Partial<WeddingEvent>): Promise<WeddingEvent> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    } else {
      const events = getLocalData<WeddingEvent[]>('wedding_events', []);
      const index = events.findIndex(e => e.id === id);
      if (index === -1) throw new Error('Etkinlik bulunamadı');

      const updated = { ...events[index], ...updateData };
      events[index] = updated;
      setLocalData('wedding_events', events);
      return updated;
    }
  },

  async deleteEvent(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);
      if (error) throw new Error(error.message);
    } else {
      const events = getLocalData<WeddingEvent[]>('wedding_events', []);
      const filtered = events.filter(e => e.id !== id);
      setLocalData('wedding_events', filtered);

      // Clean uploads
      const uploads = getLocalData<UploadedItem[]>('wedding_uploads', []);
      const filteredUploads = uploads.filter(u => u.event_id !== id);
      setLocalData('wedding_uploads', filteredUploads);
    }
  }
};

// -------------------------------------------------------------
// UPLOADS OPERATIONS
// -------------------------------------------------------------
export const uploadService = {
  async getEventUploads(eventId: string): Promise<UploadedItem[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('uploads')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data || [];
    } else {
      const uploads = getLocalData<UploadedItem[]>('wedding_uploads', []);
      // Map mock memory URLs back to uploads if they exist, to ensure they show up in this browser session
      return uploads
        .filter(u => u.event_id === eventId)
        .map(u => {
          if (mockFilesRegistry[u.id]) {
            return { ...u, file_url: mockFilesRegistry[u.id] };
          }
          return u;
        })
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  },

  async getGuestUploadCount(eventId: string, guestDeviceId: string): Promise<number> {
    if (isSupabaseConfigured && supabase) {
      const { count, error } = await supabase
        .from('uploads')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .eq('guest_device_id', guestDeviceId);
      if (error) throw new Error(error.message);
      return count || 0;
    } else {
      const uploads = getLocalData<UploadedItem[]>('wedding_uploads', []);
      return uploads.filter(u => u.event_id === eventId && u.guest_device_id === guestDeviceId).length;
    }
  },

  async uploadFile(
    event: WeddingEvent,
    file: File,
    guestName: string,
    guestDeviceId: string
  ): Promise<UploadedItem> {
    // 1. Limit Check
    const count = await this.getGuestUploadCount(event.id, guestDeviceId);
    if (count >= event.upload_limit_per_guest) {
      throw new Error(`Yükleme limitiniz doldu! En fazla ${event.upload_limit_per_guest} dosya yükleyebilirsiniz.`);
    }

    // 2. File size check
    if (file.size > event.max_file_size_mb * 1024 * 1024) {
      throw new Error(`Dosya boyutu çok büyük! Maksimum limit: ${event.max_file_size_mb}MB`);
    }

    // 3. File type check
    const isVideo = file.type.startsWith('video/');
    if (isVideo && !event.allow_video) {
      throw new Error('Bu etkinlikte sadece fotoğraf yüklenmesine izin verilmektedir.');
    }

    const uploadId = crypto.randomUUID();
    const fileExtension = file.name.split('.').pop() || (isVideo ? 'mp4' : 'jpg');
    const filePath = `${event.slug}/${uploadId}.${fileExtension}`;

    if (isSupabaseConfigured && supabase) {
      // Supabase Storage upload
      const { error: uploadError } = await supabase.storage
        .from('event-uploads')
        .upload(filePath, file);

      if (uploadError) throw new Error(uploadError.message);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('event-uploads')
        .getPublicUrl(filePath);

      // Save to database
      const { data: dbUpload, error: dbError } = await supabase
        .from('uploads')
        .insert({
          event_id: event.id,
          guest_name: guestName || 'Misafir',
          guest_device_id: guestDeviceId,
          file_url: publicUrl,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
          is_approved: true
        })
        .select()
        .single();

      if (dbError) throw new Error(dbError.message);
      return dbUpload;
    } else {
      // Mock storage using temporary blob URL
      const localFileUrl = URL.createObjectURL(file);
      mockFilesRegistry[uploadId] = localFileUrl;

      // Also generate a base64 version for small files just in case, or just store the blob URL
      // If we store blob URL in localStorage, it will break on reload. To prevent total failure,
      // we can save some stock wedding pictures as fallback if blob is expired.
      const uploads = getLocalData<UploadedItem[]>('wedding_uploads', []);

      const newUpload: UploadedItem = {
        id: uploadId,
        event_id: event.id,
        guest_name: guestName || 'Misafir',
        guest_device_id: guestDeviceId,
        file_url: localFileUrl,
        file_path: filePath,
        file_type: file.type,
        file_size: file.size,
        is_approved: true,
        created_at: new Date().toISOString()
      };

      uploads.push(newUpload);
      setLocalData('wedding_uploads', uploads);

      return newUpload;
    }
  },

  async deleteUpload(uploadId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      // Fetch details first
      const { data: upload } = await supabase
        .from('uploads')
        .select('file_path')
        .eq('id', uploadId)
        .single();

      if (upload) {
        // Delete from Storage
        await supabase.storage.from('event-uploads').remove([upload.file_path]);
      }

      // Delete from DB
      const { error } = await supabase
        .from('uploads')
        .delete()
        .eq('id', uploadId);
      if (error) throw new Error(error.message);
    } else {
      const uploads = getLocalData<UploadedItem[]>('wedding_uploads', []);
      const filtered = uploads.filter(u => u.id !== uploadId);
      setLocalData('wedding_uploads', filtered);

      if (mockFilesRegistry[uploadId]) {
        URL.revokeObjectURL(mockFilesRegistry[uploadId]);
        delete mockFilesRegistry[uploadId];
      }
    }
  }
};
