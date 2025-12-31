import { API_URL } from '../constants';
import { ApiRow, MediaItem, ApiResponse, User } from '../types';

const mapRowToMedia = (row: ApiRow): MediaItem => ({
  timestamp: row[0],
  author: row[1],
  school: row[2],
  fase: row[3],
  semester: row[4],
  title: row[5],
  mapel: row[6],
  htmlContent: row[7],
  linkContent: row[8],
  status: row[9] as any,
  kaih: row[10],
  type: row[11],
  feedback: row[12],
  id: row[13],
  views: row[14] || 0,
});

export const apiService = {
  async fetchAll(): Promise<{ media: MediaItem[], settings: any[] }> {
    try {
      const response = await fetch(`${API_URL}?action=read`);
      const json: ApiResponse = await response.json();
      if (json.status === 'success' && json.media) {
        return {
          media: json.media.map(mapRowToMedia),
          settings: json.settings || []
        };
      }
      throw new Error(json.message || 'Failed to fetch data');
    } catch (error) {
      console.error('API Read Error:', error);
      throw error;
    }
  },

  async login(pin: string): Promise<User> {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'login', payload: { pin } })
    });
    const json: ApiResponse = await response.json();
    if (json.status === 'success' && json.user) {
      return json.user;
    }
    throw new Error(json.message || 'Login failed');
  },

  async addMedia(payload: any): Promise<boolean> {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'add', payload })
    });
    const json = await response.json();
    return json.status === 'success';
  },

  async deleteMedia(id: string): Promise<boolean> {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'hapus', payload: { id } })
    });
    const json = await response.json();
    return json.status === 'success';
  },

  async viewMedia(id: string): Promise<void> {
    // Fire and forget
    fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'view', payload: { id } })
    }).catch(e => console.error(e));
  },
  
  async updateKurasi(id: string, status: string, feedback: string): Promise<boolean> {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'updateKurasi', payload: { id, status, feedback } })
      });
      const json = await response.json();
      return json.status === 'success';
  },

  async fetchUsers(): Promise<any[]> {
     const response = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'users' })
     });
     const json = await response.json();
     return json.data || [];
  },

  async saveUser(payload: any): Promise<boolean> {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'simpanUser', payload })
      });
      const json = await response.json();
      return json.status === 'success';
  },

  async deleteUser(pin: string): Promise<boolean> {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'hapusUser', payload: { pin } })
      });
      const json = await response.json();
      return json.status === 'success';
  }
};
