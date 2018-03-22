import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VendorSearchComponent } from './vendor-search.component';
import { VendorContactComponent } from './vendor-contact.component';
import { VendorCompanyComponent } from './vendor-company.component';
import { VendorService } from './services/vendor.service';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddAddressComponent } from "../../shared/address/add-address.component";
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from "../../shared/shared.module";


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PopoverModule.forRoot(),
    NgxPaginationModule,
    SharedModule,
  ],
  declarations: [VendorSearchComponent, VendorContactComponent, VendorCompanyComponent,],
  providers: [VendorService]
})
export class VendorModule { }