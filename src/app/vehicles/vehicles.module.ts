import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddVehicleComponent } from './add-vehicle.component';
import { UpdateVehicleComponent } from './update-vehicle.component';
import { DeleteVehicleComponent } from './delete-vehicle.component';
import { GetVehiclesComponent } from './get-vehicles.component';
import { VehicleService } from './services/vehicle.services';
import { HttpModule } from '@angular/http';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpService } from '../shared/services/http.service';
import { CommonService } from '../shared/services/common.service';
import { DateTimePickerModule } from 'ng-pick-datetime';
import { BsDatepickerModule, PopoverModule } from 'ngx-bootstrap';
import { BulkuploadComponent } from './bulkupload.component';
import { SearchVehicleComponent } from './search-vehicle.component';
import { CreateAccountService } from '../shared/services/createaccount.service';
import { SharedModule } from '../shared/shared.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { CustomerdetailsModule } from '../csc/customerdetails/customerdetails.module';
import { MyDatePickerModule } from 'mydatepicker';

@NgModule({
  imports: [
    CommonModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule,
    DateTimePickerModule,
    BsDatepickerModule.forRoot(),
    SharedModule,
    NgxPaginationModule,
    PopoverModule.forRoot(),
    CustomerdetailsModule,
    MyDatePickerModule
  ],
  exports: [AddVehicleComponent, GetVehiclesComponent, UpdateVehicleComponent,
    DeleteVehicleComponent, GetVehiclesComponent, BulkuploadComponent, SearchVehicleComponent],
  declarations: [AddVehicleComponent, UpdateVehicleComponent,
    DeleteVehicleComponent,
    GetVehiclesComponent
    , BulkuploadComponent, SearchVehicleComponent],
  providers: [VehicleService, HttpService, CommonService, CreateAccountService],
})
export class VehiclesModule { }
