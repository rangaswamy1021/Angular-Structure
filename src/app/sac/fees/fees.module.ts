import { TruncatePipe } from './../../shared/pipes/limit.pipe';
import { SharedModule } from './../../shared/shared.module';
import { HttpService } from './../../shared/services/http.service';
import { FeeTypesService } from './services/fees.service';
import { BsDatepickerModule, PopoverModule } from 'ngx-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { Router, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManageFeesComponent } from './manage-fees.component';
import { Http, HttpModule } from "@angular/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AddFeesComponent } from './add-fees.component';
import { UpdateFeesComponent } from './update-fees.component';
import { MyDatePickerModule } from "mydatepicker";


@NgModule({
  imports: [
    CommonModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    BsDatepickerModule.forRoot(),
    PopoverModule.forRoot(),
    SharedModule,
    MyDatePickerModule
    //TruncatePipe
  ],
  providers: [
    HttpService, FeeTypesService
  ],
  declarations: [ManageFeesComponent, AddFeesComponent, UpdateFeesComponent]
})
export class FeesModule { }
