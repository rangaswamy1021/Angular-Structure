import { InvoiceSearchComponent } from './../tvc/search/invoice-search.component';
import { invoiceChildren } from './invoices.routes';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceDetailsComponent } from './invoice-details.component';
import { HttpModule } from '@angular/http';
import { FormControl, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { customDateFormatPipe } from '../shared/pipes/convert-date.pipe';
import { InvoicesummaryComponent } from './invoicesummary.component';
import { TabsModule, BsDatepickerModule } from 'ngx-bootstrap';
import { InvoiceFeesComponent } from './invoice-fees.component';
import { InvoiceTripsComponent } from './invoice-trips.component';
import { InvoicePaymentsComponent } from './invoice-payments.component';
import { RecentTransactionsComponent } from './recent-transactions.component';
import { InvoiceHistoryComponent } from './invoice-history.component';

import { NgxPaginationModule } from 'ngx-pagination/dist/ngx-pagination';

import { ViewInvoiceDetailsComponent } from './view-invoice-details.component';
import { BatchInvoiceDetailsComponent } from './batch-invoice-details.component';
import { RouterModule } from '@angular/router';
import { CurrencycustomPipe } from '../shared/pipes/convert-currency.pipe';
import { CustomerdetailsModule } from '../csc/customerdetails/customerdetails.module';
import { MyDatePickerModule } from "mydatepicker";




@NgModule({
  imports: [
   CustomerdetailsModule, CommonModule, HttpModule, FormsModule, ReactiveFormsModule, SharedModule, TabsModule.forRoot(), NgxPaginationModule, BsDatepickerModule, RouterModule.forChild(invoiceChildren),MyDatePickerModule,
  ],

  declarations: [InvoiceDetailsComponent, InvoicesummaryComponent, InvoiceFeesComponent, InvoiceTripsComponent, InvoicePaymentsComponent, RecentTransactionsComponent, InvoiceHistoryComponent, ViewInvoiceDetailsComponent, BatchInvoiceDetailsComponent],

  exports: [
    InvoiceHistoryComponent, InvoiceDetailsComponent, RecentTransactionsComponent
  ]




})
export class InvoicesModule { }
