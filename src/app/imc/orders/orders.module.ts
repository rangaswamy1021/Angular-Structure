import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PurchaseOrderSearchComponent } from './purchase-order-search.component';
import { PurchaseOrderDetailsComponent } from './purchase-order-details.component';
import { ReturnPurchaseOrderComponent } from './return-purchase-order.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { NgxPaginationModule } from 'ngx-pagination';
import { AlertModule } from 'ngx-bootstrap/alert';
import { DateTimePickerModule } from 'ng-pick-datetime';
import { BsDatepickerModule } from "ngx-bootstrap";
import { OrdersService } from "./services/orders.service";
import { ReturnPurchaseOrderDetailsComponent } from './return-purchase-order-details.component';
import { SharedModule } from "../../shared/shared.module";
import { MyDateRangePickerModule } from 'mydaterangepicker';
import { MyDatePickerModule } from 'mydatepicker';
@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    DateTimePickerModule,
    MyDatePickerModule ,
    FormsModule,
    PopoverModule.forRoot(),
    BsDatepickerModule.forRoot(),
    ReactiveFormsModule,
    NgxPaginationModule,
    MyDateRangePickerModule,
    AlertModule.forRoot()
  ],
  declarations: [PurchaseOrderSearchComponent, PurchaseOrderDetailsComponent, ReturnPurchaseOrderComponent, ReturnPurchaseOrderDetailsComponent],
  providers: [OrdersService]
})
export class OrdersModule { }


