import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, of, tap } from 'rxjs';
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
    model: environment.llmModel,
    messages: [{ role: 'system', content: '' },],
    temperature: 0.7,
    max_tokens: 1000,
  };

  constructor(public httpClient: HttpClient) {
  }
  
  promptOffer(offerText: string):  Observable<Partial<Offer>> {
    const headers = this.headers;
    const body = {
      ...this.body,
      messages: [{
        ...this.body.messages[0],
        content: this.bodyContentBase + this.offerInterface
        + `. Text source is:` 
        + offerText 
        + `. An example of desired output is: ` 
        + this.offerExample
        }
      ]
    } 
    return this.httpClient.post<any>(environment.apiUrl, 
    body, 
    { headers }
    ).pipe(
//      tap(response => console.log('server response:', response.choices[0].message.content)),
      tap(response => console.log('server response regex:', response.choices[0].message.content.match(/{[\s\S]*}/))),
      map(response => JSON.parse(response.choices[0].message.content.match(/{[\s\S]*}/))))
  }
  
  promptResponse() {
   
  }
  
  bodyContentBase: string = `
    Return object of type to be parsed, based on text source. 
    All fields are nullable. 
    Return only object, starting and ending with a curly brace, ready to be parsed. 
    No extra comments, only object. 
    Type is:
    `

  offerInterface: string = `{
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
      "perHoursMinimum": 11.51,
      "perHoursMaximum": 11.51,
      "weeklyHours": 40,
      "durationMonths": null,
      "experienceMinimum": null,
      "experienceMaximum": null,
    }`
  
}
