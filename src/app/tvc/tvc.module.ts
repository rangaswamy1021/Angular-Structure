import { CustomerDetailsService } from './../csc/customerdetails/services/customerdetails.service';
import { HelpDeskModule } from './../helpdesk/helpdesk.module';
import { RefundsModule } from './../refunds/refunds.module';
import { tvcChildren } from './tvc.route';
import { RouterModule } from '@angular/router';
import { SearchModule } from './../tvc/search/search.module';
import { ViolatoraccountsModule } from './violatoraccounts/violatoraccounts.module';
import { DisputesModule } from './disputes/disputes.module';
import { TvcDashboardModule } from './tvcdashboard/tvcdashboard.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentdetailsModule } from './paymentdetails/paymentdetails.module';
import { HttpModule } from '@angular/http';
import { ReactiveFormsModule } from '@angular/forms';
import { ViolatordetailsModule } from './violatordetails/violatordetails.module';
import { SharedModule } from '../shared/shared.module';
import { InvoicesModule } from '../invoices/invoices.module';
import { ViolationSearchComponent } from './search/violation-search.component';
import { VehicleService } from '../vehicles/services/vehicle.services';

import { InvoiceService } from '../invoices/services/invoices.service';
import { CustomerAccountsService } from '../csc/customeraccounts/services/customeraccounts.service';

import { ViolatordetailsService } from './violatordetails/services/violatordetails.service';
import { ActivityTypesService } from '../csc/search/services/activities-service';
import { CreateAccountService } from '../shared/services/createaccount.service';
import { TvcDocumentsModule } from "./documents/tvcdocuments.module";

@NgModule({
  imports: [
    TvcDashboardModule,
    CommonModule,
    ViolatordetailsModule,
    SearchModule,
    PaymentdetailsModule,
    HttpModule,
    SharedModule,
    InvoicesModule,
    ReactiveFormsModule,
    DisputesModule,
    HelpDeskModule,
    ViolatoraccountsModule,
    RefundsModule,
    TvcDocumentsModule,
    RouterModule.forChild(tvcChildren)
  ],
  declarations: [],
  providers:[CustomerDetailsService,VehicleService,InvoiceService,CustomerAccountsService,ActivityTypesService,CreateAccountService ]

})
export class TvcModule { }
