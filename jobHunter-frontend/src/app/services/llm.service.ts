import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Offer } from '../models/models';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LlmService {

  headers = new HttpHeaders({
    Authorization: `Bearer ${environment.apiSecret}`,
    'Content-Type': 'application/json',
  });

  body = {
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `Return object of type`
      },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  };


  constructor(public httpClient: HttpClient) {
  }
  
  promptOffer(offerText: string) {
      console.log(offerText)
      console.log(environment.apiSecret , environment.apiUrl)

       const headers = this.headers;
    const body = this.body;
    body.messages[0].content = body.messages[0].content + `
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
    createdAt: Date,
    ` 

    return this.httpClient.post<any>(environment.apiUrl, 
    { body }, 
    { headers }
    ).subscribe(response => console.log(response))
      //must return an observable
  }
  
  promptResponse() {
   
  }
  
}
