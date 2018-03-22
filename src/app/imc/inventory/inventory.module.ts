import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddInventoryComponent } from './add-inventory.component';
import { InventoryService } from "./services/inventory.service";
import { PopoverModule } from 'ngx-bootstrap/popover';
import { InventoryTrackingComponent } from './inventory-tracking.component';
import { ManageBulkTagsComponent } from './manage-bulk-tags.component';
import { TagsHistoryComponent } from './tags-history.component';
import { NgxPaginationModule } from 'ngx-pagination';
// import { BsDatepickerModule } from "ngx-bootstrap";
import { SharedModule } from "../../shared/shared.module";
import { MyDateRangePickerModule } from 'mydaterangepicker';


@NgModule({
  imports: [
    CommonModule,
    FormsModule, 
    ReactiveFormsModule,
    NgxPaginationModule,
    PopoverModule.forRoot(),
  //  BsDatepickerModule.forRoot(),
   SharedModule,
   MyDateRangePickerModule

  ],
  declarations: [AddInventoryComponent, InventoryTrackingComponent, ManageBulkTagsComponent, TagsHistoryComponent],
  providers:[InventoryService,DatePipe]
})
export class InventoryModule { }
