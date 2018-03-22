import { PopoverModule } from 'ngx-bootstrap';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagsDistributionToLocationComponent } from './tags-distribution-to-location.component';
import { TagsRequestsByLocationComponent } from './tags-requests-by-location.component';
import { DistributionService } from "./services/distribution.service";
import { SharedModule } from "../../shared/shared.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MyDateRangePickerModule } from "mydaterangepicker";
import { NgxPaginationModule } from "ngx-pagination/dist/ngx-pagination";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    MyDateRangePickerModule,
    NgxPaginationModule,
    PopoverModule.forRoot(),
  ],
  declarations: [TagsDistributionToLocationComponent, TagsRequestsByLocationComponent],
  providers: [DistributionService]

})
export class DistributionModule { }
