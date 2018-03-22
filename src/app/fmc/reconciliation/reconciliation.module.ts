import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionRevenueComponent } from './transaction-revenue.component';
import { TransactionsByAccountComponent } from './transactions-by-account.component';
import { FinanceByCategoryComponent } from './finance-by-category.component';
import { FmcCreditCardComponent } from './fmc-credit-card.component';
import { TransactionComponent } from './transaction.component';
import { TagDepositComponent } from './tag-deposit.component';
import { BsDatepickerModule, PopoverModule } from "ngx-bootstrap";
import { DateTimePickerModule } from "ng-pick-datetime/picker.module";
import { ReconciliationService } from "./services/reconciliation.service";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgxPaginationModule } from "ngx-pagination/dist/ngx-pagination";
import { SharedModule } from "../../shared/shared.module";
import { MyDateRangePickerModule } from "mydaterangepicker";
@NgModule({
  imports: [
    CommonModule,
    BsDatepickerModule.forRoot(),
    DateTimePickerModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    SharedModule,    
    PopoverModule.forRoot(),
    MyDateRangePickerModule
  ],
  declarations: [
    TransactionRevenueComponent, 
    TransactionsByAccountComponent, 
    FinanceByCategoryComponent,
    FmcCreditCardComponent, 
    TransactionComponent, 
    TagDepositComponent],
  providers: [ReconciliationService]
})
export class ReconciliationModule { }