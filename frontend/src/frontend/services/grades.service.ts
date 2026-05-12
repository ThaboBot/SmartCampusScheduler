import { get, post, put } from './api'
import type { Grade, PaginatedResponse } from '../types'

export const gradesApi = {
  getByStudent: (studentId: string) => 
    get<PaginatedResponse<Grade>>(`/grades/student/${studentId}`),
  
  getByCourse: (courseId: string) => 
    get<PaginatedResponse<Grade>>(`/grades/course/${courseId}`),
  
  save: (data: Partial<Grade>) => 
    post<Grade>('/grades', data),
  
  update: (id: string, data: Partial<Grade>) => 
    put<Grade>(`/grades/${id}`, data),
  
  publish: (id: string) => 
    post(`/grades/${id}/publish`),
}

export default gradesApi
