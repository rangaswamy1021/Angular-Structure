import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DmvHistoryComponent } from './dmv-history.component';
import { InvoiceSearchDetailsComponent } from './invoice-search-details.component';
import { ViolatorSearchDetailsComponent } from './violator-search-details.component';
import { CreateViolatorComponent } from './create-violator.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { ViolatorAccountsService } from './services/violatoraccounts.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ], 
  declarations: [DmvHistoryComponent, InvoiceSearchDetailsComponent, ViolatorSearchDetailsComponent],
  providers: [ViolatorAccountsService]
})
export class ViolatoraccountsModule { }
