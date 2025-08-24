type tResponseType = 'interview' | 'assignment' | 'contract' | 'rejection'
type tStatus = 'waiting' | 'expired' | 'rejected' | 'onProcess' | 'contract' | 'dumped'
type tRole = 'frontend' | 'backend' | 'fullstack' | 'others'

export interface Offer {
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
    type: tResponseType,
    date: Date | undefined,
    createdAt: Date
}

export interface TextSource {
    content: string,
    createdAt: Date
}

export interface User {
    email: string,
    skills: string[],
    password: string,
    createdAt: Date
}

export interface Comment {
    createdAt: Date,
    content: string
}

export interface WorkingExperience {
    company: string,
    startDate: Date,
    endDate: Date,
    salaryPerYear: number
}