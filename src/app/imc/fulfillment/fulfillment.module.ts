import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerFulfillmentComponent } from './customer-fulfillment.component';
import { ManageFulfillmentComponent } from './manage-fulfillment.component';
import { PosOutletFulfillmentComponent } from './pos-outlet-fulfillment.component';
import { DateTimePickerModule } from "ng-pick-datetime/picker.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { PopoverModule, BsDatepickerModule, AlertModule } from "ngx-bootstrap";
import { NgxPaginationModule } from "ngx-pagination/dist/ngx-pagination";
import { TagsModule } from "../../tags/tags.module";
import { SharedModule } from '../../shared/shared.module';


import { MyDateRangePickerModule } from 'mydaterangepicker';


@NgModule({
  imports: [
    CommonModule,
    MyDateRangePickerModule,
    DateTimePickerModule,
    FormsModule,
    PopoverModule.forRoot(),
    BsDatepickerModule.forRoot(),
    ReactiveFormsModule,
    NgxPaginationModule,
    TagsModule,
    AlertModule.forRoot(),
    SharedModule

  ],
  declarations: [CustomerFulfillmentComponent, ManageFulfillmentComponent, PosOutletFulfillmentComponent]
})
export class FulfillmentModule { }
