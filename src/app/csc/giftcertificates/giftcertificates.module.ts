import { GiftCertificateService } from './services/giftcertificates.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ManageGiftCertificatesComponent } from './manage-gift-certificates.component';
import { AddGiftCertificateComponent } from './add-gift-certificate.component';
import { PaymentModule } from '../../payment/payment.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PopoverModule } from "ngx-bootstrap";

@NgModule({
  imports: [
    CommonModule,
    PaymentModule,
    FormsModule,
    ReactiveFormsModule,
    PopoverModule.forRoot()
  ],

  providers: [GiftCertificateService],
  declarations: [ManageGiftCertificatesComponent, AddGiftCertificateComponent]
})
export class GiftcertificatesModule { }
