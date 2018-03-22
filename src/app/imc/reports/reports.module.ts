import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { BsDatepickerModule, PopoverModule, AlertModule } from "ngx-bootstrap";
import { FacilitycodeTagToHexadecimalComponent } from './facilitycode-tag-to-hexadecimal.component';
import { PurchaseOrderItemsReturnedComponent } from './purchase-order-items-returned.component';
import { TagHistoryComponent } from './tag-history.component';
import { TagInventoryComponent } from './tag-inventory.component';
import { ViewExpiringTagsComponent } from './view-expiring-tags.component';
import { WarrantyTrackingComponent } from './warranty-tracking.component';
import { ImcReportsService } from "./services/report.service";
import { SharedModule } from "../../shared/shared.module";
import { FullCalendarModule } from 'ng-fullcalendar';
import { MyDateRangePickerModule } from 'mydaterangepicker';

@NgModule({
  imports: [
    MyDateRangePickerModule,
    CommonModule,
    FormsModule,
    PopoverModule.forRoot(),
    ReactiveFormsModule,
    NgxPaginationModule,
    AlertModule.forRoot(),
    BsDatepickerModule.forRoot(),
    SharedModule,
    FullCalendarModule

  ],
  declarations: [FacilitycodeTagToHexadecimalComponent, PurchaseOrderItemsReturnedComponent, TagHistoryComponent, TagInventoryComponent, ViewExpiringTagsComponent, WarrantyTrackingComponent],
  providers: [ImcReportsService]
})
export class ReportsModule { }
