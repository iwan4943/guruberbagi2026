export type UserRole = 'GUEST' | 'GURU' | 'MODERATOR' | 'ADMIN';

export interface User {
  name: string;
  role: UserRole;
  school?: string;
  pin?: string;
}

export interface MediaItem {
  timestamp: string;
  author: string;
  school: string;
  fase: string;
  semester: string;
  title: string;
  mapel: string;
  htmlContent: string;
  linkContent: string;
  status: 'BARU' | 'DISETUJUI' | 'REVISI';
  kaih: string; // Kebiasaan Anak Indonesia Hebat
  type: string; // VIDEO, MODUL, GAME, etc.
  feedback: string;
  id: string;
  views: number;
}

// Raw array from Google Apps Script
export type ApiRow = [
  string, // 0: Timestamp
  string, // 1: Author
  string, // 2: School
  string, // 3: Fase
  string, // 4: Semester
  string, // 5: Title
  string, // 6: Mapel
  string, // 7: HTML
  string, // 8: Link
  string, // 9: Status
  string, // 10: KAIH
  string, // 11: Type
  string, // 12: Feedback
  string, // 13: ID
  number  // 14: Views
];

export interface AppSettings {
  types: string[];
  subjects: string[];
  phases: string[];
  kaih: string[];
  semesters: string[];
}

export interface ApiResponse {
  status: 'success' | 'error';
  message?: string;
  media?: ApiRow[];
  settings?: any[]; // Raw settings rows
  data?: any[]; // Generic data return for users
  user?: User;
}

export interface DashboardStats {
  total: number;
  approved: number;
  pending: number;
  teachers: number;
}

export interface TeacherStat {
  name: string;
  school: string;
  count: number;
}

export interface SchoolStat {
  name: string;
  teacherCount: number;
  mediaCount: number;
  percentage: number;
}
