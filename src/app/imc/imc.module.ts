
import { DocumentdetailsService } from './../csc/documents/services/documents.details.service';
import { imcChildren } from './imc.route';
import { RouterModule } from '@angular/router';
import { ShipmentModule } from './shipment/shipment.module';
import { OrdersModule } from './orders/orders.module';
import { PurchaseOrderSearchComponent } from './orders/purchase-order-search.component';
import { ReturnPurchaseOrderComponent } from './orders/return-purchase-order.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContractModule } from "./contract/contract.module";
import { VendorModule } from "./vendor/vendor.module";
import { WarrantyModule } from "./warranty/warranty.module";
import { InventoryModule } from "./inventory/inventory.module";
import { DatePipe } from '@angular/common';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { ImcDashboardComponent } from './dashboard/imc-dashboard.component';
import { RetailerModule } from "./retailer/retailer.module";
import { FulfillmentModule } from "./fulfillment/fulfillment.module";
import { ImcDashboardModule } from "./dashboard/imc-dashboard.module";
import { ReportsModule } from './reports/reports.module';
import { DistributionModule } from "./distribution/distribution.module";
@NgModule({
  imports: [
    CommonModule,
    ContractModule,
    VendorModule,
    WarrantyModule,
    OrdersModule,
    InventoryModule,   
    ShipmentModule,
    RouterModule.forChild(imcChildren),
    PopoverModule.forRoot(),
    RetailerModule,
    FulfillmentModule,
     ImcDashboardModule,
     ReportsModule,
     DistributionModule
    
  ],
  declarations: [],
    //RetailerBankComponent,
     //RetailerCompanyComponent, RetailerContactComponent, RetailerBusinessComponent, RetailerMakePaymentComponent, RetailerOrderDetailsComponent, RetailerUsersSearchComponent, RetailerFulfillmentComponent],
  providers:[DocumentdetailsService]
})
export class ImcModule { }


