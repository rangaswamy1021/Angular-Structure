import { NgxPaginationModule } from 'ngx-pagination';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagePagesComponent } from './manage-pages.component';
import { ManagePrivilegesComponent } from './manage-privileges.component';
import { ManageRolesComponent } from './manage-roles.component';
import { ManageUsersComponent } from './manage-users.component';
import { CsrRelationsComponent } from './csr-relations.component';
import { ManageTransactionTypesComponent } from './manage-transaction-types.component';
import { PopoverModule } from 'ngx-bootstrap';
import { UserManagementService } from "./services/usermanagement.service";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {SelectModule} from 'ng2-select';
import { SharedModule } from "../../shared/shared.module";
import { OperationalLocationsComponent } from './operational-locations.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PopoverModule.forRoot(),
    NgxPaginationModule,
    SelectModule,
    SharedModule
  ],
  providers: [UserManagementService],
  declarations: [ ManagePagesComponent, ManagePrivilegesComponent, ManageRolesComponent,
    ManageUsersComponent, CsrRelationsComponent, ManageTransactionTypesComponent,  OperationalLocationsComponent]
})
export class UsermanagementModule { }
