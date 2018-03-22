import { DatePickerFormatService } from './services/datepickerformat.service';
import { TruncatePipe } from './pipes/limit.pipe';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdvanceSearchComponent } from './search/advance-search.component';
import { AddAddressComponent } from './address/add-address.component';
import { BsDatepickerModule } from 'ngx-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpService } from './services/http.service';
import { CommonService } from './services/common.service';
import { PhoneComponent } from './phone/phone.component';
import { EmailComponent } from './email/email.component';
import { AccountholderdetailsComponent } from './accountholderdetails/accountholderdetails.component';
import { DisplayNAPipe } from "./pipes/convert-to-not-applicable.pipe";
import { TableLayoutComponent } from './table-layout.component';

import { customDateFormatPipe } from "./pipes/convert-date.pipe";
import { CustomDateTimeFormatPipe } from './pipes/convert-datetime.pipe';
import { PopoverModule, ModalModule } from "ngx-bootstrap";
import { DateTimePickerModule } from 'ng-pick-datetime';
import { FullAddressComponent } from "./address/full-address.component";
import { BlockedListComponent } from './blocked/blocked-list.component';
import { ConvertToSpacesPipe } from './pipes/convert-to-spaces.pipe';
import { ForbiddenPhoneValidator } from "./validators/forbiddenphone";
import { InvoicesContextService } from "./services/invoices.context.service";
import { CurrencycustomPipe } from "./pipes/convert-currency.pipe";
import { SuccessFailureAlertsMessageComponent } from './success-failure-alerts-message.component';
import { AccountInfoHeaderComponent } from "./accountprimaryinfo/account-info-header.component";
import { AccountInfoComponent } from "./accountprimaryinfo/account-info.component";
import { AccountPrimaryInformationComponent } from "./accountprimaryinfo/account-primary-information.component";
import { Error404Component } from './error-404.component';
import { UnauthorizedAccessComponent } from './unauthorized-access.component';
import { MaterialscriptService } from "./materialscript.service";
import { AddressCreditcardService } from "./services/addresscreditcarddetails.context.service";



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BsDatepickerModule.forRoot(),
    ModalModule.forRoot(),
    PopoverModule,
    DateTimePickerModule,
    NgxPaginationModule,
    RouterModule
  ],
  declarations: [AdvanceSearchComponent, ConvertToSpacesPipe,CurrencycustomPipe, AddAddressComponent, PhoneComponent, EmailComponent, AccountholderdetailsComponent, DisplayNAPipe, customDateFormatPipe, CustomDateTimeFormatPipe, FullAddressComponent, BlockedListComponent, TableLayoutComponent, ForbiddenPhoneValidator, SuccessFailureAlertsMessageComponent,
  AccountInfoHeaderComponent,AccountInfoComponent,AccountPrimaryInformationComponent, Error404Component, UnauthorizedAccessComponent,TruncatePipe],
  providers: [HttpService, CommonService, InvoicesContextService ,MaterialscriptService, DatePickerFormatService, AddressCreditcardService],
  exports: [AdvanceSearchComponent,SuccessFailureAlertsMessageComponent, PhoneComponent, EmailComponent, AccountholderdetailsComponent, DisplayNAPipe, AddAddressComponent, customDateFormatPipe, CustomDateTimeFormatPipe, FullAddressComponent, TableLayoutComponent, BlockedListComponent, ForbiddenPhoneValidator,CurrencycustomPipe,
  AccountInfoHeaderComponent,AccountInfoComponent,AccountPrimaryInformationComponent,TruncatePipe]

})
export class SharedModule { }
