import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeneralLedgerComponent } from './general-ledger.component';
import { TrailBalanceComponent } from './trail-balance.component';
import { GeneralJournalComponent } from './general-journal.component';
import { ManageChartOfAccountsComponent } from './manage-chart-of-accounts.component';
import { CloseFiscalYearComponent } from './close-fiscal-year.component';
import { ManualJournalEntriesComponent } from './manual-journal-entries.component';
import { ManualJournalEntriesApprovalComponent } from './manual-journal-entries-approval.component';
import { SpecialJournalComponent } from './special-journal.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BsDatepickerModule, PopoverModule } from "ngx-bootstrap";
import { NgxPaginationModule } from "ngx-pagination/dist/ngx-pagination";
import { AccountingService } from "./services/accounting.service";
import { DateTimePickerModule } from "ng-pick-datetime/picker.module";
import { SelectModule } from 'ng2-select';
import { SharedModule } from "../../shared/shared.module";
import { MyDateRangePickerModule } from "mydaterangepicker";
import { MyDatePickerModule } from "mydatepicker";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    BsDatepickerModule.forRoot(),
    PopoverModule.forRoot(),
    DateTimePickerModule,
    SelectModule,
    SharedModule,
    MyDateRangePickerModule,
    MyDatePickerModule
  ],
  declarations: [GeneralLedgerComponent, TrailBalanceComponent, GeneralJournalComponent, ManageChartOfAccountsComponent, CloseFiscalYearComponent, ManualJournalEntriesComponent, ManualJournalEntriesApprovalComponent, SpecialJournalComponent],
  providers: [AccountingService]
})
export class AccountingModule { }
