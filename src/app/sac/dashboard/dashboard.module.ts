import { SacDashBoardService } from './services/models.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SacDashboardComponent } from './sac-dashboard.component';
import { HelpDeskDashboardComponent } from './help-desk-dashboard.component';
import { ConsoleJobsConfigurationComponent } from './console-jobs-configuration.component';
import { SacDashboardSettingsComponent } from './sac-dashboard-settings.component';
import { AddServersToPingComponent } from './add-servers-to-ping.component';
import { AddServerDetailsComponent } from './add-server-details.component';
import { AddServiceDetailsComponent } from './add-service-details.component';
import { AddSqlJobsComponent } from './add-sql-jobs.component';
import { AddThresholdAlaramsComponent } from './add-threshold-alarams.component';
import { AddMailServerSettingsComponent } from './add-mail-server-settings.component';
import { AmChartsModule } from "@amcharts/amcharts3-angular";

@NgModule({
  imports: [
    CommonModule,
    AmChartsModule
  ],
  declarations: [SacDashboardComponent, HelpDeskDashboardComponent, ConsoleJobsConfigurationComponent, SacDashboardSettingsComponent, AddServersToPingComponent, AddServerDetailsComponent, AddServiceDetailsComponent, AddSqlJobsComponent, AddThresholdAlaramsComponent, AddMailServerSettingsComponent],
  providers: [SacDashBoardService]
})
export class DashboardModule { }
