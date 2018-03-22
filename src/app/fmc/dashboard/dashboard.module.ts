import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DirectorDashboardComponent } from './director-dashboard.component';
import { ManagerDashboardComponent } from './manager-dashboard.component';
import { ClerkDashboardComponent } from './clerk-dashboard.component';
import { BsDatepickerModule, PopoverModule } from "ngx-bootstrap";
import { SharedModule } from "../../shared/shared.module";
import { FMCDashBoardService } from "./services/dashboard.service";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MyDatePickerModule } from "mydatepicker";


@NgModule({
  imports: [
    CommonModule,
    BsDatepickerModule.forRoot(),
    PopoverModule.forRoot(),
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MyDatePickerModule
  ],
  declarations: [DirectorDashboardComponent, ManagerDashboardComponent, ClerkDashboardComponent],
  providers: [FMCDashBoardService]
})
export class DashboardModule { }
