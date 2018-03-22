import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceAgingComponent } from './invoice-aging.component';
import { ManageInvoiceAgingComponent } from './manage-invoice-aging.component';
import { WorkFlowService } from "./services/workflow.service";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PopoverModule } from "ngx-bootstrap";
import { SharedModule } from "../../shared/shared.module";

@NgModule({
  imports: [
    FormsModule,
    PopoverModule.forRoot(),
    ReactiveFormsModule,
    CommonModule,
    SharedModule
  ],
  declarations: [InvoiceAgingComponent, ManageInvoiceAgingComponent],
  providers: [WorkFlowService]
})
export class WorkflowModule { }
