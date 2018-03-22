import { PopoverModule, BsDatepickerModule } from 'ngx-bootstrap';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagePromosComponent } from './manage-promos.component';
import { DateTimePickerModule } from 'ng-pick-datetime';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from '../../shared/shared.module';
import { PromoService } from './services/promos.service';
import { MyDateRangePickerModule } from 'mydaterangepicker';
import { MyDatePickerModule } from 'mydatepicker';

@NgModule({
  imports: [
    MyDateRangePickerModule,
    MyDatePickerModule,
    CommonModule,
    PopoverModule.forRoot(),
    DateTimePickerModule,
    FormsModule,
    ReactiveFormsModule,
    DateTimePickerModule,
    SharedModule,
    NgxPaginationModule,
    BsDatepickerModule.forRoot(),
  ],
  providers: [PromoService],
  declarations: [ManagePromosComponent]
})
export class PromosModule { }
