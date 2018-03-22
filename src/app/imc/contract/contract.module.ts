import { SharedModule } from './../../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { NgxPaginationModule } from 'ngx-pagination';
import { AlertModule } from 'ngx-bootstrap/alert';

import { ContractSearchComponent } from './contract-search.component';
import { AddContractComponent } from './add-contract.component';
import { ContractService } from "./services/contract.service";
import { MaterialscriptService } from "../../shared/materialscript.service";

@NgModule({
  imports: [
    CommonModule,
      FormsModule,
      PopoverModule.forRoot(),
    ReactiveFormsModule,
    NgxPaginationModule,
    AlertModule.forRoot(),
    SharedModule
  ],
  declarations: [ContractSearchComponent, AddContractComponent],
  providers:[ContractService, MaterialscriptService]
})
export class ContractModule { }