type tResponseType = 'interview' | 'assignment' | 'contract' | 'rejection'
type tStatus = 'waiting' | 'expired' | 'rejected' | 'onProcess' | 'contract' | 'dumped'
type tRole = 'frontend' | 'backend' | 'fullstack' | 'others'

export interface Offer {
    id: string,
    company: string,
    role: tRole,
    hired?: boolean,
    location?: string,
    recruiter?: string,
    status: tStatus,
    platform?: string,
    skills?: string[],
    perHoursMinimum?: number,
    perHoursMaximum?: number,
    weeklyHours?: number,
    durationMonths?: number | undefined,
    experienceMinimum?: number,
    experienceMaximum?: number,
    createdAt: Date
}

export interface Response {
    id: string,
    type: tResponseType,
    date: Date | undefined,
    createdAt: Date
}

export interface TextSource {
    id: string,
    content: string,
    createdAt: Date
}

export interface User {
    id: string,
    email: string,
    skills: string[],
    password: string,
    createdAt: Date
}

export interface Comment {
    id: string,
    createdAt: Date,
    content: string
}

export interface WorkingExperience {
    id: string,
    company: string,
    startDate: Date,
    endDate: Date,
    salaryPerYear: number
}