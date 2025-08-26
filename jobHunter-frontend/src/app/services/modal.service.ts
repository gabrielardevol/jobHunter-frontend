import { Injectable, Type } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


interface ModalData {
  component: Type<any>;
  inputs?: { [key: string]: any };
}

@Injectable({ providedIn: 'root' })
export class ModalService {

  private modalSubject = new BehaviorSubject<ModalData | null>(null);
  modal$ = this.modalSubject.asObservable();

  open(component: Type<any>,  inputs?: { [key: string]: any }) {
    console.log('open modal.service.ts', inputs);
    this.modalSubject.next({ component, inputs });
  }

  close() {
    this.modalSubject.next(null);
  }
}
