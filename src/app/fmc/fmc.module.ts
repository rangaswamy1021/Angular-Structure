import { fmcChidrens } from './fmc.route';
import { RouterModule } from '@angular/router';
import { DashboardModule } from './../fmc/dashboard/dashboard.module';
import { ReconciliationModule } from './reconciliation/reconciliation.module';
import { CashmanagementModule } from './cashmanagement/cashmanagement.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountGroupsComponent } from "./configuration/account-groups.component";
import { AccountSubGroupsComponent } from "./configuration/account-sub-groups.component";
import { ManageFiscalYearComponent } from "./configuration/manage-fiscal-year.component";
import { ManagePeriodsComponent } from "./configuration/manage-periods.component";
import { CostCenterCodesComponent } from "./configuration/cost-center-codes.component";
import { CategoryTypesComponent } from "./configuration/category-types.component";
import { ConfigurationModule } from "./configuration/configuration.module";
import { AccountingModule } from "./accounting/accounting.module";
import { ConfigurationService } from "./configuration/services/configuration.service";
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown/angular2-multiselect-dropdown';

@NgModule({
  imports: [
    CommonModule,
    ReconciliationModule,
    ConfigurationModule,
    DashboardModule,
    AccountingModule,
    CashmanagementModule,
    AngularMultiSelectModule,
    RouterModule.forChild(fmcChidrens)
  ],

  providers: [ConfigurationService]

})
export class FmcModule { }
