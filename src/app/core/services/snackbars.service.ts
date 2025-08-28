import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Snackbar } from '../models/models';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  private snackbarsSubject = new BehaviorSubject<Partial<Snackbar>[]>([]);
  snackbars$ = this.snackbarsSubject.asObservable();

  constructor() {}

  addSnackbar(snackbar: Partial<Snackbar>) {
    snackbar.id = uuidv4();
    const current = this.snackbarsSubject.value;
    this.snackbarsSubject.next([...current, snackbar]);

    setTimeout(() => {
      this.removeSnackbar(snackbar.id!);
    }, 18000);
  }

  removeSnackbar(id: string) {
    const current = this.snackbarsSubject.value;
    this.snackbarsSubject.next(current.filter(s => s.id !== id));
  }
}
