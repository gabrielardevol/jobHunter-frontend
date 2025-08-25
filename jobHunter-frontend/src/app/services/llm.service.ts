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
        content: `Return object of type to be parsed, based on text source. All fields are nullable. Return only object, starting and ending with a curly brace, ready to be parsed. Type is:`
      },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  };


  constructor(public httpClient: HttpClient) {
  }
  
  promptOffer(offerText: string) {
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
    ` + `
    . Text source is:
    ` + offerText

    return this.httpClient.post<any>(environment.apiUrl, 
    body, 
    { headers }
    ).subscribe(response => console.log(response.choices[0].message.content))
  }
  
  promptResponse() {
   
  }
  
}
