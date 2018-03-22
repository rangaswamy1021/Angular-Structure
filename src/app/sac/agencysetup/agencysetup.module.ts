import { SharedModule } from './../../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManageAgencyComponent } from './manage-agency.component';
import { AgencyRegistrationComponent } from './agency-registration.component';
import { AgencyAdditionalInfoComponent } from './agency-additional-info.component';
import { ManageLanesComponent } from './manage-lanes.component';
import { ManageLocationsComponent } from './manage-locations.component';
import { ManagePlazasComponent } from './manage-plazas.component';
import { PlazaRegistrationComponent } from './plaza-registration.component';
import { PlazaAdditionalInfoComponent } from './plaza-additional-info.component';
import { PopoverModule } from "ngx-bootstrap";
import { NgxPaginationModule } from "ngx-pagination/dist/ngx-pagination";
import { AgencySetupService } from './services/agencysetup.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PopoverModule.forRoot(),
    NgxPaginationModule,
    SharedModule
  ],
  declarations: [ManageAgencyComponent, AgencyRegistrationComponent, AgencyAdditionalInfoComponent, ManageLanesComponent, ManageLocationsComponent, ManagePlazasComponent, PlazaRegistrationComponent, PlazaAdditionalInfoComponent],
  providers: [AgencySetupService]
})
export class AgencysetupModule { }
