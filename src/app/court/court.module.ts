import { NgxGalleryModule } from 'ngx-gallery';
import { AttachmentContextService } from './services/attachment.context.service';
import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { CourtselectionComponent } from './court/courtselection.component';
import { SummarycomplaintComponent } from './court/summarycomplaint.component';
import { CourttrackingComponent } from './court/courttracking.component';
import { PrecourtComponent } from './precourt/precourt-selection.component';
import { PrecourtTrackingComponent } from './precourt/precourt-tracking.component';
import { RouterModule } from '@angular/router';
import { courtChildrens } from './court.route';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SharedModule } from "../shared/shared.module";
import { NgxPaginationModule } from 'ngx-pagination/dist/ngx-pagination';
import { BsDatepickerModule, PopoverModule } from "ngx-bootstrap";
import { HttpService } from "../shared/services/http.service";
import { CourtService } from "./services/court.service";
import { CommonService } from "../shared/services/common.service";
import { DateTimePickerModule } from "ng-pick-datetime/picker.module";
import { HttpModule } from "@angular/http";
import { HelpDeskService } from "../helpdesk/services/helpdesk.service";
import { MyDatePickerModule } from "mydatepicker";

@NgModule({
  imports: [
    HttpModule,
    DateTimePickerModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgxPaginationModule,
    SharedModule,
    NgxGalleryModule,
    RouterModule.forChild(courtChildrens),
    NgxPaginationModule, BsDatepickerModule,
    PopoverModule.forRoot(),
    MyDatePickerModule
  ],
  declarations: [CourtselectionComponent,
    SummarycomplaintComponent, CourttrackingComponent,
    PrecourtComponent, PrecourtTrackingComponent],
  providers: [DatePipe, HttpService, CommonService, CourtService, HelpDeskService, AttachmentContextService]
})
export class CourtModule { }
