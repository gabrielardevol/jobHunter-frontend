export type tResponseType = 'interview' | 'assignment' | 'contract' | 'rejection'
export type tStatus = 'waiting' | 'expired' | 'rejected' | 'onProcess' | 'contract' | 'dumped'
export type tRole = 'frontend' | 'backend' | 'fullstack' | 'others'

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
    paymentType: 'month' | 'hour' | 'year' | 'day',
    salaryMinimum?: number,
    salaryMaximum?: number,
    weeklyHours?: number,
    durationMonths?: number | undefined,
    experienceMinimum?: number,
    experienceMaximum?: number,
    createdAt: Date,
    deletedAt?: Date,
    responses?: Response[],
    textSource?: TextSource,
    comments?: Comment[],
    user?: User,
}

export interface Response {
    id: string,
    type: tResponseType,
    date: Date | undefined,
    createdAt: Date,
    offer: Offer
}

export interface TextSource {
    id?: string,
    content: string,
    createdAt?: Date,
    offerId?: string,
    responseId?: string,
    deletedAt?: Date
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

export interface Snackbar {
    id: string,
    message: string,
    action: () => void,
}