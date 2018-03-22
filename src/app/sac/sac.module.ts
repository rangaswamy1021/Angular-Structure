import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgencysetupModule } from './agencysetup/agencysetup.module';
import { ConfigurationModule } from './configuration/configuration.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DiscountsModule } from './discounts/discounts.module';
import { FeesModule } from './fees/fees.module';
import { PlansModule } from './plans/plans.module';
import { PromosModule } from './promos/promos.module';
import { TollsModule } from './tolls/tolls.module';
import { UsermanagementModule } from './usermanagement/usermanagement.module';
import { WorkflowModule } from './workflow/workflow.module';
import { RouterModule } from '@angular/router';
import { sacChildrens } from './sac.route';
import { DateTimePickerModule } from 'ng-pick-datetime';
import { NgxPaginationModule } from 'ngx-pagination';


@NgModule({
  imports: [
    CommonModule,
    AgencysetupModule,
    ConfigurationModule,
    DashboardModule,
    DiscountsModule,
    FeesModule,
    PlansModule,
    PromosModule,
    TollsModule,
    UsermanagementModule,
    WorkflowModule,
    RouterModule.forChild(sacChildrens),
    DateTimePickerModule,
    NgxPaginationModule
  ],
  declarations: []
})
export class SacModule { }
