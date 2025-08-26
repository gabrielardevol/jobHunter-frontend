import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { TextSource } from '../models/models';
import { v4 as uuidv4 } from 'uuid';
import { environment } from '../../environments/environment.development';
import { TextSourcesRepository } from './textSources.repository';

@Injectable({
  providedIn: 'root'
})
export class TextSourceService {
  private textSourceSubject = new BehaviorSubject<TextSource[]>([]);
  textSources$ = this.textSourceSubject.asObservable();

  constructor(private repository: TextSourcesRepository) {
    this.fetchTextSources();
  }

  private async fetchTextSources(): Promise<void> {
    await this.repository.init();
    const all = await this.repository.getAll();
    this.textSourceSubject.next(all);
    console.log('TextSources fetched from repository:', all);
  }

  getOfferTextSource(id: string): Observable<TextSource | undefined> {
    return this.textSources$.pipe(
      map(textSources => textSources.find(ts => ts.offerId === id))
    );
  }

  getResponseTextSource(id: string): Observable<TextSource | undefined> {
    return this.textSources$.pipe(
      map(textSources => textSources.find(ts => ts.responseId === id))
    );
  }

  async addTextSource(textSource: TextSource): Promise<void> {
    textSource.id = uuidv4();
    textSource.createdAt = new Date();

    const updated = [...this.textSourceSubject.value, textSource];
    this.textSourceSubject.next(updated);

    if (!environment.mockData) {
      await this.repository.save(textSource);
      console.log('TextSource saved:', textSource);
    }
  }

  async deleteTextSource(id: string): Promise<void> {
    const updated = this.textSourceSubject.value.filter(ts => ts.id !== id);
    this.textSourceSubject.next(updated);

    if (!environment.mockData) {
      await this.repository.delete(id);
      console.log(`TextSource ${id} deleted from repository`);
    }
  }
}
