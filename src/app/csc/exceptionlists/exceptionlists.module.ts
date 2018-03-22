import { SharedModule } from '../../shared/shared.module';
import { NgxGalleryModule } from 'ngx-gallery';
import { ExceptionListService } from './services/exceptionlists.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { TabsModule, PopoverModule, BsDatepickerModule } from "ngx-bootstrap";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManageExceptionListComponent } from './manage-exception-list.component';
import { ExceptionListReviewComponent } from './exception-list-review.component';
import { TransactionProcessingErrorReportComponent } from './transaction-processing-error-report.component';
import { DatePipe } from '@angular/common';
import { DateTimePickerModule } from 'ng-pick-datetime/picker.module';
import { ProgressbarModule } from 'ngx-bootstrap';
import { MyDateRangePickerModule } from 'mydaterangepicker';

@NgModule({
  imports: [
    MyDateRangePickerModule,
    CommonModule,
    FormsModule,
    SharedModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    PopoverModule.forRoot(),
    DateTimePickerModule,
    BsDatepickerModule.forRoot(),
    ProgressbarModule.forRoot(),
    NgxGalleryModule
  ],
  declarations: [ManageExceptionListComponent, ExceptionListReviewComponent, TransactionProcessingErrorReportComponent],
  providers: [ExceptionListService]
})
export class ExceptionlistsModule { }
