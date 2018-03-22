import { RetailerBankComponent } from './retailer-bank.component';
import { RetailerBusinessComponent } from './retailer-business.component';
import { RetailerCompanyComponent } from './retailer-company.component';
import { RetailerContactComponent } from './retailer-contact.component';
import { RetailerFulfillmentComponent } from './retailer-fulfillment.component';
import { RetailerMakePaymentComponent } from './retailer-make-payment.component';
import { RetailerOrderDetailsComponent } from './retailer-order-details.component';
import { RetailerSearchComponent } from './retailer-search.component';
import { RetailerUsersSearchComponent } from './retailer-users-search.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddAddressComponent } from "../../shared/address/add-address.component";
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from "../../shared/shared.module";
import { RetailerService } from "./services/retailer.service";
import { PaymentModule } from "../../payment/payment.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PopoverModule.forRoot(),
    NgxPaginationModule,
    SharedModule,
    PaymentModule
  ],
  declarations: [RetailerBankComponent,
    RetailerBusinessComponent,
    RetailerCompanyComponent,
    RetailerContactComponent,
    RetailerFulfillmentComponent,
    RetailerMakePaymentComponent,
    RetailerOrderDetailsComponent,
    RetailerSearchComponent,
    RetailerUsersSearchComponent],
    providers: [RetailerService],
  
})
export class RetailerModule { }
