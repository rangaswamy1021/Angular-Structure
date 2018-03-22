import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchWarrantyComponent } from './search-warranty.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WarrantyService } from "./services/warranty.service";
import { PopoverModule } from 'ngx-bootstrap/popover';
import { SharedModule } from "../../shared/shared.module";
import { NgxPaginationModule } from 'ngx-pagination';




@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PopoverModule.forRoot(),
    NgxPaginationModule,
    SharedModule
  ],
  declarations: [SearchWarrantyComponent],
  providers:[WarrantyService]
})
export class WarrantyModule { }