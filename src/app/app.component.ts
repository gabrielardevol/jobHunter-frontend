import { Component, ComponentRef, Type, ViewChild, ViewContainerRef } from '@angular/core';
import { RouterOutlet , RouterModule } from '@angular/router';
import { OfferFormComponent } from "./shared/offer-form.component";
import { OffersService } from './core/services/offers.service';
import { NgIf } from "@angular/common";
import { CommonModule } from '@angular/common';
import { SnackbarService } from './core/services/snackbars.service';
import { ModalService } from './core/services/modals.service';
import { ResponseFormComponent } from './shared/response-form.component';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule, CommonModule, NgIf, NgApexchartsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  title = 'jobHunter-frontend';
  @ViewChild('modalHost', { read: ViewContainerRef, static: true })
  viewContainerRef!: ViewContainerRef;

  modalData: { component: Type<any>; inputs?: any } | null = null;

  constructor(public offersService: OffersService, 
    public snackbarService: SnackbarService, 
    public modalService: ModalService){

          this.modalService.modal$.subscribe(data => {
      this.modalData = data;
      this.viewContainerRef.clear();
      if (data) {
        const componentRef: ComponentRef<any> = this.viewContainerRef.createComponent(data.component);
        if (data.inputs) {
          Object.keys(data.inputs).forEach(key => {
            componentRef.instance[key] = data!.inputs![key];
          });
        }
      }
    });
    }

  openOfferForm() {
    this.modalService.open(OfferFormComponent)
  }

  openResponseForm() {
    this.modalService.open(ResponseFormComponent)
}

  close() {
    this.modalService.close();
  }
      
}
