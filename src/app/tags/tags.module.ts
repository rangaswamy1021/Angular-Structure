import { ManageTagsComponent } from './../csc/customerdetails/manage-tags.component';
import { PopoverModule } from 'ngx-bootstrap';
import { CustomerContextService } from './../shared/services/customer.context.service';
import { HttpModule } from '@angular/http';
import { CommonService } from './../shared/services/common.service';
import { HttpService } from './../shared/services/http.service';
import { tagsChildren } from './tags.route';
import { RouterModule } from '@angular/router';
import { SharedModule } from './../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddTagComponent } from './add-tag.component';
import { GetTagDetailsComponent } from './get-tag-details.component';
import { RequestNewTagsComponent } from "./request-new-tags.component";
import { TagService } from "./services/tags.service";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from "ngx-pagination/dist/ngx-pagination";
import { AssociateTagComponent } from './associate-tag.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown/angular2-multiselect-dropdown';
import { MyDatePickerModule } from "mydatepicker";
@NgModule({
  imports: [
    CommonModule,
    HttpModule,
    FormsModule,
    SharedModule,
    ReactiveFormsModule,
    RouterModule.forChild(tagsChildren),
    PopoverModule.forRoot(),
    NgxPaginationModule,
    AngularMultiSelectModule,
    BsDatepickerModule.forRoot(), MyDatePickerModule
  ],
  declarations: [AddTagComponent, GetTagDetailsComponent, RequestNewTagsComponent, AssociateTagComponent],
  providers: [TagService, HttpService, CommonService, CustomerContextService],
  exports: [
    AddTagComponent, GetTagDetailsComponent
  ],
})
export class TagsModule { }
