import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountGroupsComponent } from './account-groups.component';
import { AccountSubGroupsComponent } from './account-sub-groups.component';
import { CategoryTypesComponent } from './category-types.component';
import { CostCenterCodesComponent } from './cost-center-codes.component';
import { ManageSpecialJournalsComponent } from './manage-special-journals.component';
import { ManageSpecialJournalsAssociationsComponent } from './manage-special-journals-associations.component';
import { ManageTransactionTypesComponent } from './manage-transaction-types.component';
import { ManageBusinessProcessesComponent } from './manage-business-processes.component';
import { ManageFiscalYearComponent } from './manage-fiscal-year.component';
import { ManagePeriodsComponent } from './manage-periods.component';
import { PeriodCloseComponent } from './period-close.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ManageBusinessProcessCodesComponent } from './manage-business-process-codes.component';
import { TransactionTypeHistoryComponent } from './transaction-type-history.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { PopoverModule, BsDatepickerModule } from "ngx-bootstrap";
import { ConfigurationService } from "./services/configuration.service";
import { SelectModule } from 'ng2-select';
import { AngularMultiSelectModule } from "angular2-multiselect-dropdown/angular2-multiselect-dropdown";
import { SharedModule } from "../../shared/shared.module";
import { MyDatePickerModule } from "mydatepicker";
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    PopoverModule.forRoot(),
    BsDatepickerModule.forRoot(),
    SelectModule,
    BsDatepickerModule.forRoot(),
    AngularMultiSelectModule,
    SharedModule,
    MyDatePickerModule
  ],
  declarations: [AccountGroupsComponent, AccountSubGroupsComponent, CategoryTypesComponent, CostCenterCodesComponent, ManageSpecialJournalsComponent, ManageSpecialJournalsAssociationsComponent, ManageTransactionTypesComponent, ManageBusinessProcessesComponent, ManageFiscalYearComponent, ManagePeriodsComponent, PeriodCloseComponent, ManageBusinessProcessCodesComponent, TransactionTypeHistoryComponent],
  providers: [ConfigurationService]
})
export class ConfigurationModule { }
