// User & Authentication
export interface User {
  id: string
  email: string
  full_name: string
  role: 'student' | 'instructor' | 'admin'
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  full_name: string
  role: 'student' | 'instructor'
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  token_type: string
  user: User
}

// Course
export interface Course {
  id: string
  code: string
  name: string
  description?: string
  credits: number
  instructor_id: string
  instructor?: User
  semester: string
  year: number
  max_students: number
  enrolled_count: number
  created_at: string
  updated_at: string
}

export interface Enrollment {
  id: string
  course_id: string
  student_id: string
  enrolled_at: string
  status: 'active' | 'dropped' | 'completed'
  final_grade?: number
}

// Timetable
export interface TimetableEntry {
  id: string
  course_id: string
  course?: Course
  day_of_week: number // 0-6 (Sunday-Saturday)
  start_time: string
  end_time: string
  venue_id: string
  venue?: Venue
  created_at: string
  updated_at: string
}

// Venue
export interface Venue {
  id: string
  name: string
  building: string
  floor: number
  capacity: number
  type: 'classroom' | 'lab' | 'lecture_hall' | 'other'
  amenities: string[]
  is_available: boolean
  created_at: string
  updated_at: string
}

// Assignment
export interface Assignment {
  id: string
  course_id: string
  course?: Course
  title: string
  description: string
  due_date: string
  total_points: number
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface Submission {
  id: string
  assignment_id: string
  assignment?: Assignment
  student_id: string
  student?: User
  submitted_at: string
  file_url?: string
  content?: string
  grade?: number
  feedback?: string
  graded_at?: string
  graded_by?: string
  status: 'pending' | 'submitted' | 'graded' | 'late'
}

// Grade
export interface Grade {
  id: string
  student_id: string
  student?: User
  course_id: string
  course?: Course
  midterm_grade?: number
  final_grade?: number
  overall_grade?: number
  letter_grade?: string
  gpa_points: number
  is_published: boolean
  created_at: string
  updated_at: string
}

// Announcement
export interface Announcement {
  id: string
  course_id?: string
  course?: Course
  author_id: string
  author?: User
  title: string
  content: string
  is_pinned: boolean
  created_at: string
  updated_at: string
}

export interface AnnouncementReply {
  id: string
  announcement_id: string
  author_id: string
  author?: User
  content: string
  created_at: string
  updated_at: string
}

// Attendance
export interface AttendanceRecord {
  id: string
  student_id: string
  student?: User
  course_id: string
  course?: Course
  date: string
  status: 'present' | 'absent' | 'late' | 'excused'
  qr_session_id?: string
  checked_in_at?: string
  created_at: string
}

// Notification
export interface Notification {
  id: string
  user_id: string
  type: 'assignment' | 'grade' | 'announcement' | 'system'
  title: string
  message: string
  is_read: boolean
  link?: string
  created_at: string
}

// Dashboard Stats
export interface DashboardStats {
  total_courses: number
  total_assignments: number
  pending_submissions: number
  average_grade?: number
  attendance_rate?: number
  upcoming_deadlines: number
  unread_notifications: number
}

// API Response Types
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface ApiError {
  detail: string
  status_code: number
}
