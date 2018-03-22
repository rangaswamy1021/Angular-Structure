
import { NgxPaginationModule } from 'ngx-pagination';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown/angular2-multiselect-dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DateTimePickerModule } from 'ng-pick-datetime';
import { TollScheduleService } from './services/tollschedule.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManageRatesComponent } from './manage-rates.component';
import { ManageTollSchedulesComponent } from './manage-toll-schedules.component';
import { ManageTollRatesComponent } from './manage-toll-rates.component';
import { AddTollSchedulesComponent } from './add-toll-schedules.component';
import { TollRatesService } from './services/tollrates.service';
import { ManageVepPassesComponent } from './manage-vep-passes.component';
import { RouterModule } from '@angular/router';
import { DatePipe } from '@angular/common';
import { SharedModule } from "../../shared/shared.module";
import { BsDatepickerModule } from "ngx-bootstrap";
import { MyDatePickerModule } from 'mydatepicker';
import { MyDateRangePickerModule } from 'mydaterangepicker';

@NgModule({
  imports: [
    CommonModule,
    PopoverModule.forRoot(),
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    SharedModule,
    DateTimePickerModule,
    PopoverModule.forRoot(),
    NgxPaginationModule,
    DateTimePickerModule,
    FormsModule,
    MyDatePickerModule,
    MyDateRangePickerModule,
    ReactiveFormsModule,
    SharedModule,
    PopoverModule.forRoot(),
    AngularMultiSelectModule,
    BsDatepickerModule.forRoot(),
  ],
  providers: [
    TollScheduleService,
    TollRatesService,
    DatePipe],
  declarations: [
    ManageRatesComponent,
    ManageTollSchedulesComponent,
    ManageTollRatesComponent,
    AddTollSchedulesComponent,
    ManageVepPassesComponent,
   
  ],
})
export class TollsModule { }
