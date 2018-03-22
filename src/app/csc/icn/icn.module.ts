import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IcnAssignComponent } from './icn-assign.component';
import { IcnCloseComponent } from './icn-close.component';
import { IcnReconciliationComponent } from './icn-reconciliation.component';
import { IcnVerificationComponent } from './icn-verification.component';
import { IcnAssignDetailsComponent } from './icn-assign-details.component';
import { TabsModule, PopoverModule, BsDatepickerModule } from "ngx-bootstrap";
import { ICNService } from "./services/icn.service";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DateTimePickerModule } from "ng-pick-datetime/picker.module";
import { IcnCountOutComponent } from './icn-count-out.component';
import { NgxPaginationModule } from "ngx-pagination";
import { SharedModule } from "../../shared/shared.module";
import { CurrencycustomPipe } from "../../shared/pipes/convert-currency.pipe";
import { MyDateRangePickerModule } from 'mydaterangepicker';
import { IcnDayShiftCloseComponent } from './icn-day-shift-close.component';

@NgModule({
  imports: [
    CommonModule,
    MyDateRangePickerModule,
    TabsModule.forRoot(),
    PopoverModule.forRoot(),
    DateTimePickerModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    SharedModule,
    BsDatepickerModule.forRoot(),
  ],
  providers: [ICNService, CurrencycustomPipe],
  declarations: [IcnAssignComponent, IcnCloseComponent, IcnReconciliationComponent, IcnVerificationComponent, IcnAssignDetailsComponent, IcnCountOutComponent, IcnDayShiftCloseComponent]
})
export class IcnModule { }
