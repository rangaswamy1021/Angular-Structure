import { CustomerContextService } from './../../shared/services/customer.context.service';
import { ActivitiesSearchComponent } from './activities-search.component';
import { CustomerSearchService } from './services/customer.search';
import { Http, HttpModule } from '@angular/http';
import { FormControl, FormGroup, Validators, ReactiveFormsModule, FormsModule  } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BasicSearchComponent } from './basic-search.component';
import { InvoicesSearchComponent } from './invoices-search.component';
import { HttpService } from '../../shared/services/http.service';
import { ActivityTypesService } from './services/activities-service';
import { SearchDetailsComponent } from './search-details.component';
import { AdvanceCscSearchComponent } from './advance-csc-search.component';
import { SharedModule } from '../../shared/shared.module';
import { BsDatepickerModule, TabsModule } from 'ngx-bootstrap';
import { DatePipe } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { InvoiceService } from '../../invoices/services/invoices.service';
import { PayAAdvanceTollsComponent } from './pay-a-advance-tolls.component';
import { DateTimePickerModule } from 'ng-pick-datetime';
import { RouterModule } from '@angular/router';

import { MyDateRangePickerModule } from 'mydaterangepicker';

@NgModule({

  imports: [MyDateRangePickerModule,RouterModule, NgxPaginationModule,CommonModule,DateTimePickerModule, HttpModule, FormsModule, ReactiveFormsModule,SharedModule, BsDatepickerModule.forRoot(), TabsModule.forRoot() ],
  declarations: [SearchDetailsComponent, BasicSearchComponent, AdvanceCscSearchComponent, InvoicesSearchComponent,  ActivitiesSearchComponent, PayAAdvanceTollsComponent],
  providers: [ActivityTypesService, CustomerSearchService, DatePipe, HttpService, CustomerContextService, InvoiceService]

})
export class SearchModule { }
