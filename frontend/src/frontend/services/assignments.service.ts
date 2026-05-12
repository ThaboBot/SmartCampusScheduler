import { get, post, put } from './api'
import type { Assignment, Submission, PaginatedResponse } from '../types'

export const assignmentsApi = {
  getAll: (courseId?: string) => 
    get<PaginatedResponse<Assignment>>(`/assignments${courseId ? `?course_id=${courseId}` : ''}`),
  
  getById: (id: string) => 
    get<Assignment>(`/assignments/${id}`),
  
  create: (data: Partial<Assignment>) => 
    post<Assignment>('/assignments', data),
  
  update: (id: string, data: Partial<Assignment>) => 
    put<Assignment>(`/assignments/${id}`, data),
  
  submit: (assignmentId: string, data: { content?: string; file_url?: string }) => 
    post<Submission>(`/assignments/${assignmentId}/submit`, data),
  
  getSubmissions: (assignmentId: string) => 
    get<Submission[]>(`/assignments/${assignmentId}/submissions`),
  
  gradeSubmission: (submissionId: string, data: { grade: number; feedback?: string }) => 
    post<Submission>(`/submissions/${submissionId}/grade`, data),
}

export default assignmentsApi
