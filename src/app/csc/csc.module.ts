import { AdditionalContactsComponent } from './customerdetails/additional-contacts.component';
import { CustomerContextService } from './../shared/services/customer.context.service';
import { cscRoutes } from './csc.route';
import { RouterModule } from '@angular/router';
import { CreateAccountPersonalInformationComponent } from './customeraccounts/create-account-personal-information.component';
import { VepPassesService } from './veppasses/services/veppasses.service';
import { DocumentsService } from './documents/services/documents.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomeraccountsModule } from './customeraccounts/customeraccounts.module';
import { CustomerdetailsModule } from './customerdetails/customerdetails.module';
import { DocumentsModule } from './documents/documents.module';
import { ExceptionlistsModule } from './exceptionlists/exceptionlists.module';
import { GiftcertificatesModule } from './giftcertificates/giftcertificates.module';
import { IcnModule } from './icn/icn.module';
import { ReportsModule } from './reports/reports.module';
import { SearchModule } from './search/search.module';
import { VeppassesModule } from './veppasses/veppasses.module';
import { SearchDetailsComponent } from './search/search-details.component';
import { HttpModule } from "@angular/http";
import { BsDatepickerModule } from "ngx-bootstrap";
import { GetVehiclesComponent } from '../vehicles/get-vehicles.component';
import { AmChartsModule } from "@amcharts/amcharts3-angular";
import { CscDashboardModule } from "./dashboard/cscdashboard.module";
import { InvoicesModule } from '../invoices/invoices.module';
import { CustomerserviceModule } from './customerservice/customerservice.module';
import { RefundsModule } from '../refunds/refunds.module';
import { HelpDeskModule } from '../helpdesk/helpdesk.module';
import 'hammerjs';

@NgModule({
  imports: [
    CustomeraccountsModule,
    CustomerdetailsModule,
    ExceptionlistsModule,
    CscDashboardModule,
    DocumentsModule,
    GiftcertificatesModule,
    IcnModule,
    ReportsModule,
    RouterModule.forChild(cscRoutes),
    SearchModule,
    VeppassesModule,
    InvoicesModule,
    CustomerserviceModule,
    RefundsModule,
    HelpDeskModule

  ],
  declarations: [
  ],
  providers: [VepPassesService]
})
export class CscModule { 
  
}
