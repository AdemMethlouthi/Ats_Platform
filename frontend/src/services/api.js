import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:8080/api'
})

// Automatically add JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Jobs
export const getJobs = () => API.get('/jobs')
export const getOpenJobs = () => API.get('/jobs/open')
export const getJobById = (id) => API.get(`/jobs/${id}`)
export const createJob = (data) => API.post('/jobs', data)
export const updateJob = (id, data) => API.put(`/jobs/${id}`, data)
export const deleteJob = (id) => API.delete(`/jobs/${id}`)

// Candidates
export const getCandidates = () => API.get('/candidates')
export const createCandidate = (data) => API.post('/candidates', data)

// Applications
export const getApplications = () => API.get('/applications')
export const applyToJob = (data) => API.post('/applications', data)
export const updateStatus = (id, status) => API.patch(`/applications/${id}/status?status=${status}`)
export const getApplicationsByCandidate = (id) => API.get(`/applications/candidate/${id}`)

// Auth
export const login = (data) => API.post('/auth/login', data)
export const register = (data) => API.post('/auth/register', data)

export const uploadCV = (candidateId, file) => {
  const formData = new FormData()
  formData.append('file', file)
  return API.post(`/files/upload-cv/${candidateId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export const downloadCV = (candidateId) =>
  API.get(`/files/download-cv/${candidateId}`, { responseType: 'blob' })

export const scheduleInterview = (id, interviewDate) =>
  API.patch(`/applications/${id}/interview`, { interviewDate })