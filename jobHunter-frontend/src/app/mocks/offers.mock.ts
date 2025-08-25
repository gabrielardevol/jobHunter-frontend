import { Offer , tRole, tStatus } from "../models/models";

export const OFFERS: Offer[] = [
 {
    id: uuidv4(),
    company: "TechCorp",
    role: "frontend" as tRole,
    hired: false,
    location: "Barcelona",
    recruiter: "Anna Puig",
    status: "open" as tStatus,
    platform: "LinkedIn",
    skills: ["Angular", "TypeScript", "RxJS"],
    paymentType: "month",
    salaryMinimum: 2500,
    salaryMaximum: 3500,
    weeklyHours: 40,
    durationMonths: 12,
    experienceMinimum: 2,
    experienceMaximum: 5,
    createdAt: new Date()
  },
  {
    id: uuidv4(),
    company: "DataSolutions",
    role: "backend" as tRole,
    hired: false,
    location: "Remote",
    recruiter: "Marc López",
    status: "screening" as tStatus,
    platform: "Indeed",
    skills: ["Node.js", "Express", "MongoDB"],
    paymentType: "hour",
    salaryMinimum: 20,
    salaryMaximum: 35,
    weeklyHours: 30,
    durationMonths: undefined,
    experienceMinimum: 3,
    createdAt: new Date()
  },
  {
    id: uuidv4(),
    company: "AI StartUp",
    role: "data-scientist" as tRole,
    hired: false,
    location: "Madrid",
    recruiter: "Laura Sánchez",
    status: "interview" as tStatus,
    platform: "Glassdoor",
    skills: ["Python", "TensorFlow", "Machine Learning"],
    paymentType: "year",
    salaryMinimum: 35000,
    salaryMaximum: 50000,
    weeklyHours: 40,
    experienceMinimum: 2,
    createdAt: new Date()
  }  

];
function uuidv4(): string {
  throw new Error("Function not implemented.");
}

