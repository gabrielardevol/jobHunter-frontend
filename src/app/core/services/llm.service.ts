import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, tap, throwError, timeout } from 'rxjs';
import { Offer } from '../models/models';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SnackbarService } from './snackbars.service';

@Injectable({
  providedIn: 'root'
})
export class LlmService {

  headers = new HttpHeaders({
    Authorization: `Bearer ${environment.apiSecret}`,
    'Content-Type': 'application/json',
  });

  body = {
    model: environment.llmModel,
    messages: [{ role: 'system', content: '' },],
    temperature: 0.7,
    max_tokens: 1000,
  };


  constructor(public httpClient: HttpClient,
    public snackbarService: SnackbarService
  ) {
  }
  
  promptOffer(offerText: string):  Observable<Partial<Offer>> {
    const headers = this.headers;
    const body = {
      ...this.body,
      messages: [{
        ...this.body.messages[0],
        content: this.bodyContentBase + this.offerInterface
        + `. Considerate that software engineer equals Fullstack unless Frontend or Backend is specified.
        Considerate that recruiter must be a person's name, not generic tags like 'recruiter' or 'técnico de selección'
.        Text source is:` 
        + offerText 
        + `. An example of desired output is: ` 
        + this.offerExample
        }
      ]
    } 
    return this.httpClient.post<any>(environment.apiUrl, body, { headers }).pipe(
      timeout(6000), // ⏳ llença error si passen més de 6s
      map(response => {
        const match = response.choices[0].message.content.match(/{[\s\S]*}/);
        if (!match) throw new Error('No JSON object found in response');
        return JSON.parse(match[0]) as Partial<Offer>; // 🔒 força el tipatge
      }),
      catchError(err => {
        console.error('error with autofill:', err);
        this.snackbarService.addSnackbar({
          message: 'error with autofill',
        });
        return throwError(() => err);
      })
    );
  }
  
  promptResponse(responseText: string): Observable<Partial<Response>> {
      const headers = this.headers;
    const body = {
      ...this.body,
      messages: [{
        ...this.body.messages[0],
        content: this.bodyContentBase + this.responseInterface
        + `.I want you to classify the type of this reply to a job application. Text source is:` 
        + responseText 
        + `. Type can't be null. An example of desired output is: ` 
        + this.responseExample
        }
      ]
    } 
    return this.httpClient.post<any>(environment.apiUrl, 
    body, 
    { headers }
    ).pipe(
      timeout(6000),
      tap(response => console.log('server response regex:', response.choices[0].message.content.match(/{[\s\S]*}/))),
      map(response => JSON.parse(response.choices[0].message.content.match(/{[\s\S]*}/))),
      catchError(err => {
        console.error('error with autofill:', err);
        this.snackbarService.addSnackbar({
          message: 'error with autofill',
        });
        return throwError(() => err);
      })
    )
  }
  
  bodyContentBase: string = `
    Return object of type to be parsed, based on text source. 
    All fields are nullable. 
    Return only object, starting and ending with a curly brace, ready to be parsed. 
    No extra comments, only object. 
    Type is:
    `

  offerInterface: string = `{
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
    responses?: Response[],
    textSource?: TextSource,
    comments?: Comment[],
    user?: User,
  }` 

  offerExample: string = `
  {
    "company": "ACME",
    "role": "frontend",
    "hired": false,
    "location": null,
    "recruiter": null,
    "status": null,
    "platform": null,
    "skills": null,
    "paymentType": "hour",
    "salaryMinimum": 11.51,
    "salaryMaximum": 11.51,
    "weeklyHours": 40,
    "durationMonths": null,
    "experienceMinimum": null,
    "experienceMaximum": null,
  }`

  responseExample: string = `
  {
    "type": "interview",
    "date": "6/24/2025",
    "recruiter": "John Doe",
    "email": "johndoe@gmail.com",
    "company": "ACME",
  }
  `;
  responseInterface: string = `
  {
      type: "interview" | "assignment" | "contract" | "rejection",
      date: Date | null,
      recruiter: string,
      email: string,
      telephone: string,
      company: string
    
  }`;
  
}
