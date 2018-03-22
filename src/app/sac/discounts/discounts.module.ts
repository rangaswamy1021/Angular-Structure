import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopoverModule, BsDatepickerModule } from 'ngx-bootstrap';
import { ManageDiscountsComponent } from './manage-discounts.component';
import { DateTimePickerModule } from "ng-pick-datetime/picker.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgxPaginationModule } from 'ngx-pagination';
import { DiscountsService } from "./services/discounts.service";
import { SharedModule } from "../../shared/shared.module";
import {  MyDatePickerModule } from "mydatepicker";
import { CSCReportsService } from '../../csc/reports/services/reports.service';

@NgModule({
  imports: [
    CommonModule,
    PopoverModule.forRoot(),
    DateTimePickerModule,
    BsDatepickerModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    SharedModule,
   MyDatePickerModule
  ],
  declarations: [ManageDiscountsComponent],
  providers: [DiscountsService,CSCReportsService]
})
export class DiscountsModule { }
