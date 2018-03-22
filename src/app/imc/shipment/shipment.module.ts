

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShipmentSearchComponent } from './shipment-search.component';
import { ShipmentDetailsComponent } from './shipment-details.component';
import { ReceiveShipmentDetailsComponent } from './receive-shipment-details.component';
import { ShipmentBatchInformationComponent } from './shipment-batch-information.component';
import { VerifyShipmentDetailsComponent } from './verify-shipment-details.component';
import { TestReceivedShipmentComponent } from './test-received-shipment.component';
import { DateTimePickerModule } from "ng-pick-datetime/picker.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { PopoverModule, BsDatepickerModule, AlertModule } from "ngx-bootstrap";
import { NgxPaginationModule } from "ngx-pagination/dist/ngx-pagination";
import { ShipmentService } from "./services/shipment.service";
import { SharedModule } from "../../shared/shared.module";
import { customDateFormatPipe } from "../../shared/pipes/convert-date.pipe";
import { MyDateRangePickerModule } from "mydaterangepicker";
import { MyDatePickerModule } from 'mydatepicker';



@NgModule({
  imports: [
    CommonModule,
    DateTimePickerModule,
    FormsModule,
    MyDateRangePickerModule,
    MyDatePickerModule,
    PopoverModule.forRoot(),
    BsDatepickerModule.forRoot(),
    ReactiveFormsModule,
    NgxPaginationModule,
    AlertModule.forRoot(),
    SharedModule

  ],
  declarations: [ShipmentSearchComponent, ShipmentDetailsComponent, ReceiveShipmentDetailsComponent, ShipmentBatchInformationComponent, VerifyShipmentDetailsComponent, TestReceivedShipmentComponent],
   providers: [ShipmentService,customDateFormatPipe]
})
export class ShipmentModule { }
