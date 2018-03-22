import { ReferralprogramComponent } from './referral-program.component';
import { CustomerserviceService } from './services/customerservice.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CloseAccountComponent } from "./close-account.component";
import { BrowserModule } from '@angular/platform-browser';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ManageDiscountsComponent } from "./manage-discounts.component";
import { AccountFlagsComponent } from './account-flags.component';
import { DateTimePickerModule } from "ng-pick-datetime/picker.module";

import { ChangeOfPlanComponent } from "./change-of-plan.component";
import { SharedModule } from "../../shared/shared.module";
import { DeliveryOptionsComponent } from './delivery-options.component';
import { AlertsCommunicationsComponent } from './alerts-communications.component';
import { AdditionalContactsComponent } from './additional-contacts.component';
import { PopoverModule } from 'ngx-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { PlansService } from "../../sac/plans/services/plans.service";
import { customDateFormatPipe } from "../../shared/pipes/convert-date.pipe";
import { CustomerdetailsModule } from '../customerdetails/customerdetails.module';
import { AddBankDetailsComponent } from './add-bank-details.component';
import { AddCreditCardDetailsComponent } from './add-credit-card-details.component';
import { PaymentModule } from "../../payment/payment.module";
import { MyDatePickerModule } from 'mydatepicker';
@NgModule({
  imports: [
    MyDatePickerModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DateTimePickerModule,
    BsDatepickerModule.forRoot(),
    SharedModule,
    PopoverModule.forRoot(),
    NgxPaginationModule,
    CustomerdetailsModule,
    PaymentModule
  ],
  providers: [
    CustomerserviceService,
    PlansService,
    customDateFormatPipe
  ],
  declarations: [
    CloseAccountComponent,
    ManageDiscountsComponent,
    AccountFlagsComponent,
    ReferralprogramComponent,
    ChangeOfPlanComponent, DeliveryOptionsComponent, AlertsCommunicationsComponent,
    AdditionalContactsComponent,
    AddBankDetailsComponent,
    AddCreditCardDetailsComponent
  ]

})
export class CustomerserviceModule {

}