import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UpdateTagsConfigurationComponent } from './update-tags-configuration.component';
import { GetTagsConfigurationsComponent } from './get-tags-configurations.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ConfigurationService } from "./services/configuration.service";
import { GeneralConfigurationsComponent } from './general-configurations.component';
import { PaymentPlanConfigurationsComponent } from './payment-plan-configurations.component';
import { BulkEmailsComponent } from './bulk-emails.component';
import { IncludeMessageToInvoiceComponent } from './include-message-to-invoice.component';
import { ComplaintTurnAroundTimeComponent } from './complaint-turn-around-time.component';
import { HelpdeskManagersEmailSettingsComponent } from './helpdesk-managers-email-settings.component';
import { AccordionModule, BsDatepickerModule, PopoverModule } from "ngx-bootstrap";
import { DateTimePickerModule } from "ng-pick-datetime/picker.module";
import { NgxPaginationModule } from "ngx-pagination/dist/ngx-pagination";
import { SharedModule } from '../../shared/shared.module';
import { LowReplenishmentThreholdComponent } from './low-replenishment-threhold.component';
import { MyDateRangePickerModule } from 'mydaterangepicker';
import { MyDatePickerModule } from 'mydatepicker';
import { AuditLogFeaturesConfigurationComponent } from './audit-log-features-configuration.component';
import { LoadBalancingConfigurationsForMbsComponent } from './load-balancing-configurations-for-mbs.component';



@NgModule({
  imports: [
    CommonModule,
    MyDateRangePickerModule,
    MyDatePickerModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    AccordionModule.forRoot(),
    DateTimePickerModule,
    BsDatepickerModule.forRoot(),
    PopoverModule.forRoot(),
    NgxPaginationModule,
    SharedModule,

  ],
  declarations: [GetTagsConfigurationsComponent, UpdateTagsConfigurationComponent, GeneralConfigurationsComponent,
     PaymentPlanConfigurationsComponent, BulkEmailsComponent,
    IncludeMessageToInvoiceComponent, ComplaintTurnAroundTimeComponent, HelpdeskManagersEmailSettingsComponent, LowReplenishmentThreholdComponent, AuditLogFeaturesConfigurationComponent, LoadBalancingConfigurationsForMbsComponent],

  providers: [ConfigurationService]
})
export class ConfigurationModule { }
