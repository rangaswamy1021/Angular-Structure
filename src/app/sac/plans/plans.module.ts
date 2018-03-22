import { DateTimePickerModule } from 'ng-pick-datetime';
import { NgxPaginationModule } from 'ngx-pagination';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreatePlansComponent } from './create-plans.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssignFeesToPlansComponent } from './assign-fees-to-plans.component';
import { UpdatePlansComponent } from './update-plans.component';
import { AssignDiscountsToPlansComponent } from './assign-discounts-to-plans.component';
import { PlansService } from "./services/plans.service";
import { ViewPlansComponent } from './view-plans.component';
import { AppModule } from "../../app.module";
import { HttpService } from "../../shared/services/http.service";
import { HttpModule } from "@angular/http";
import { PopoverModule } from "ngx-bootstrap";
import { ShipmentServiceTypesComponent } from './shipment-service-types.component';
import { SharedModule } from "../../shared/shared.module";
import {  MyDatePickerModule } from "mydatepicker";

@NgModule({
  imports: [
    CommonModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule,
    BsDatepickerModule.forRoot(),
    PopoverModule.forRoot(),
    NgxPaginationModule,
    DateTimePickerModule,
    SharedModule,    
    MyDatePickerModule
  ],
  declarations: [
    ViewPlansComponent,
    AssignFeesToPlansComponent,
    CreatePlansComponent,
    UpdatePlansComponent,
    AssignDiscountsToPlansComponent,
    ShipmentServiceTypesComponent
  ],
  providers: [PlansService, HttpService]
})
export class PlansModule { }
