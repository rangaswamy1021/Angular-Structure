import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GetTollTransactionsComponent } from './get-toll-transactions.component';
import { GetParkingTransactionsComponent } from './get-parking-transactions.component';
import { GetFerryTransactionsComponent } from './get-ferry-transactions.component';
import { GetTransitTransactionsComponent } from './get-transit-transactions.component';
import { GetViolationTransactionsComponent } from './get-violation-transactions.component';
import { SharedModule } from "../shared/shared.module";
import { ViewTransactionDetailsComponent } from './view-transaction-details.component';
import { RouterModule } from "@angular/router";

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule
  ],
  declarations: [
    GetTollTransactionsComponent, 
    GetParkingTransactionsComponent, 
    GetFerryTransactionsComponent, 
    GetTransitTransactionsComponent, 
    GetViolationTransactionsComponent, ViewTransactionDetailsComponent    
  ],
  exports: [
    GetTollTransactionsComponent,
    GetParkingTransactionsComponent, 
    GetFerryTransactionsComponent, 
    GetTransitTransactionsComponent, 
    GetViolationTransactionsComponent 
  ]
})
export class TransactionsModule { }
