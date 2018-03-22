import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViolationSearchComponent } from './violation-search.component';
import { InvoiceSearchComponent } from './invoice-search.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgxPaginationModule } from "ngx-pagination/dist/ngx-pagination";
import { SharedModule } from "../../shared/shared.module";
import { InvoicesModule } from "../../invoices/invoices.module";
import { ViolationSearchService } from "./services/violation-search.service";
import { ViolatorContextService } from "../../shared/services/violator.context.service";
import { ViolatorSearchContextService } from "./services/violation-search-context.service";

@NgModule({
  imports: [
    CommonModule,
     FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    SharedModule,
    InvoicesModule
  ],
  declarations: [ViolationSearchComponent, InvoiceSearchComponent],
  providers:[ViolationSearchService, ViolatorContextService, ViolatorSearchContextService]
})
export class SearchModule { }
