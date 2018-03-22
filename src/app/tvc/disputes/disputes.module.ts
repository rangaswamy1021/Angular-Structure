import { DisputesService } from './services/disputes.service';
import { SharedModule } from './../../shared/shared.module';
import { PopoverModule, TabsModule } from 'ngx-bootstrap';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AffidavitSearchViolatorComponent } from './affidavit-search-violator.component';
import { NonLiabilityComponent } from './non-liability.component';
import { ViolationTransferComponent } from './violation-transfer.component';
import { CreateViolatorComponent } from './create-violator.component';
import { DateTimePickerModule } from "ng-pick-datetime/picker.module";
import { NgxPaginationModule } from 'ngx-pagination';
import { ViewDisputesComponent } from './view-disputes.component';
import { MyDatePickerModule } from 'mydatepicker';
import { DisputeContextService } from "./services/dispute.context.service";

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DateTimePickerModule,
    FormsModule,
    SharedModule,
    PopoverModule.forRoot(),
    TabsModule.forRoot(),
    NgxPaginationModule,
    MyDatePickerModule
  ],
  declarations: [AffidavitSearchViolatorComponent, NonLiabilityComponent, CreateViolatorComponent, ViewDisputesComponent],
  providers:[DisputesService,DisputeContextService]
})
export class DisputesModule { }
