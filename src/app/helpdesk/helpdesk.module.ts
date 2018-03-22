import { ComplaintContextService } from './../shared/services/complaint.context.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateComplaintComponent } from './create-complaint.component';
import { ViewComplaintsComponent } from './view-complaints.component';
import { ManageComplaintsComponent } from './manage-complaints.component';
import { AssignToMasterComplaintsComponent } from './assign-to-master-complaints.component';
import { DashboardComplaintComponent } from './dashboard-complaint.component';
import { PmPopupComponent } from './pm-popup.component';
import { PopoverModule, BsDatepickerModule } from "ngx-bootstrap";
import { HelpDeskService } from './services/helpdesk.service';
import { DateTimePickerModule } from 'ng-pick-datetime';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from "../shared/shared.module";
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterModule } from '@angular/router'
import { FrontDeskComponent } from './front-desk.component';
import { PmAttachmentComponent } from "./pm-attachment.component";
import { TrackComplaintsComponent } from "./track-complaints.component";
import { helpdeskChildrens } from "./helpdesk.route";
import { CustomerdetailsModule } from "../csc/customerdetails/customerdetails.module";
import { MyDateRangePickerModule } from 'mydaterangepicker';
import { MyDatePickerModule } from 'mydatepicker';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    DateTimePickerModule,
    NgxPaginationModule,
    RouterModule.forChild(helpdeskChildrens),
    PopoverModule.forRoot(),
    SharedModule,
    BsDatepickerModule.forRoot(),
    CustomerdetailsModule,
    MyDateRangePickerModule,
    MyDatePickerModule
  ],
  declarations: [CreateComplaintComponent, ViewComplaintsComponent, ManageComplaintsComponent, AssignToMasterComplaintsComponent,
    DashboardComplaintComponent, PmPopupComponent, FrontDeskComponent, PmAttachmentComponent, TrackComplaintsComponent],
  providers: [HelpDeskService,ComplaintContextService]
})
export class HelpDeskModule { }
