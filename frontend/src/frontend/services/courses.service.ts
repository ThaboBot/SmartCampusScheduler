import { get, post, put, del } from './api'
import type { Course, Enrollment, PaginatedResponse } from '../types'

export const coursesApi = {
  getAll: (params?: { page?: number; page_size?: number }) => 
    get<PaginatedResponse<Course>>('/courses', ),
  
  getById: (id: string) => 
    get<Course>(`/courses/${id}`),
  
  create: (data: Partial<Course>) => 
    post<Course>('/courses', data),
  
  update: (id: string, data: Partial<Course>) => 
    put<Course>(`/courses/${id}`, data),
  
  delete: (id: string) => 
    del(`/courses/${id}`),
  
  enroll: (courseId: string, studentId: string) => 
    post(`/courses/${courseId}/enroll`, { student_id: studentId }),
  
  getEnrollments: (courseId: string) => 
    get<Enrollment[]>(`/courses/${courseId}/enrollments`),
}

export default coursesApi
