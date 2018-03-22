import { ReturnPurchaseOrderComponent } from './orders/return-purchase-order.component';
import { AddContractComponent } from "./contract/add-contract.component";
import { ContractSearchComponent } from "./contract/contract-search.component";
import { VendorCompanyComponent } from "./vendor/vendor-company.component";
import { VendorSearchComponent } from "./vendor/vendor-search.component";
import { VendorContactComponent } from "./vendor/vendor-contact.component";
import { SearchWarrantyComponent } from "./warranty/search-warranty.component";
import { AddInventoryComponent } from "./inventory/add-inventory.component";
import { InventoryTrackingComponent } from "./inventory/inventory-tracking.component";
import { PurchaseOrderDetailsComponent } from "./orders/purchase-order-details.component";
import { PurchaseOrderSearchComponent } from "./orders/purchase-order-search.component";
import { TagsHistoryComponent } from "./inventory/tags-history.component";
import { AuthGuard } from "../common/guard.guard";
import { ManageFulfillmentComponent } from "./fulfillment/manage-fulfillment.component";
import { CustomerFulfillmentComponent } from "./fulfillment/customer-fulfillment.component";
import { PosOutletFulfillmentComponent } from "./fulfillment/pos-outlet-fulfillment.component";
import { ShipmentBatchInformationComponent } from "./shipment/shipment-batch-information.component";
import { ShipmentSearchComponent } from "./shipment/shipment-search.component";
import { ReceiveShipmentDetailsComponent } from "./shipment/receive-shipment-details.component";
import { ShipmentDetailsComponent } from "./shipment/shipment-details.component";
import { VerifyShipmentDetailsComponent } from "./shipment/verify-shipment-details.component";
import { ManageBulkTagsComponent } from "./inventory/manage-bulk-tags.component";
import { RetailerSearchComponent } from "./retailer/retailer-search.component";
import { RetailerOrderDetailsComponent } from "./retailer/retailer-order-details.component";
import { RetailerMakePaymentComponent } from "./retailer/retailer-make-payment.component";
import { RetailerUsersSearchComponent } from "./retailer/retailer-users-search.component";
import { RetailerContactComponent } from "./retailer/retailer-contact.component";
import { RetailerCompanyComponent } from "./retailer/retailer-company.component";
import { RetailerBusinessComponent } from "./retailer/retailer-business.component";
import { RetailerBankComponent } from "./retailer/retailer-bank.component";
import { ReturnPurchaseOrderDetailsComponent } from "./orders/return-purchase-order-details.component";
import { TestReceivedShipmentComponent } from "./shipment/test-received-shipment.component";
import { ImcDashboardComponent } from './dashboard/imc-dashboard.component';
import { RetailerFulfillmentComponent } from './retailer/retailer-fulfillment.component';
import { ViewExpiringTagsComponent } from './reports/view-expiring-tags.component';
import { TagInventoryComponent } from './reports/tag-inventory.component';
import { PurchaseOrderItemsReturnedComponent } from './reports/purchase-order-items-returned.component';
import { FacilitycodeTagToHexadecimalComponent } from './reports/facilitycode-tag-to-hexadecimal.component';
import { TagHistoryComponent } from './reports/tag-history.component';
import { WarrantyTrackingComponent } from './reports/warranty-tracking.component';
import { TagsRequestsByLocationComponent } from "./distribution/tags-requests-by-location.component";
import { TagsDistributionToLocationComponent } from "./distribution/tags-distribution-to-location.component";


export const imcChildren = [
    {
        path: "contract",
        children:
        [
            {
                path: "manage-contract",
                component: AddContractComponent,
                canActivate: [AuthGuard]
            }
        ]
    },
    {
        path: "vendor",
        children:
        [
            {
                path: "vendor-search",
                component: VendorSearchComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'vendor-search/:Message',
                component: VendorSearchComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'vendor-company/:vendorId',
                component: VendorCompanyComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'vendor-company',
                component: VendorCompanyComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'vendor-contact',
                component: VendorContactComponent,
                canActivate: [AuthGuard]
            }
        ]
    },
    {
        path: "warranty",
        children:
        [
            {
                path: "search-warranty",
                component: SearchWarrantyComponent,
                canActivate: [AuthGuard]
            },
        ]
    },
    {
        path: "inventory",
        children:
        [
            {
                path: "add-inventory",
                component: AddInventoryComponent,
                canActivate: [AuthGuard]
            },
            {
                path: "inventory-tracking",
                component: InventoryTrackingComponent,
                canActivate: [AuthGuard]
            },
            {
                path: "manage-bulk-tags",
                component: ManageBulkTagsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: "inventory-tracking/:message",
                component: InventoryTrackingComponent,
                canActivate: [AuthGuard]
            },
            {
                path: "tags-history/:serialNumber",
                component: TagsHistoryComponent,
                canActivate: [AuthGuard]
            }
        ]
    },
    {
        path: "orders",
        children:
        [
            {
                path: "purchase-order-details",
                component: PurchaseOrderDetailsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: "purchase-order-search",
                component: PurchaseOrderSearchComponent,
                canActivate: [AuthGuard]
            },
            {
                path: "return-purchase-order",
                component: ReturnPurchaseOrderComponent,
                canActivate: [AuthGuard]
            },
            {
                path: "return-purchase-order-details",
                component: ReturnPurchaseOrderDetailsComponent,
                // canActivate: [AuthGuard]
            }
        ]
    },
    {
        path: "fulfillment",
        children:
        [
            {
                path: "manage-fulfillment",
                component: ManageFulfillmentComponent,
                canActivate: [AuthGuard]
            },
            {
                path: "customer-fulfillment",
                component: CustomerFulfillmentComponent,
                canActivate: [AuthGuard]
            },
            {
                path: "pos-outlet-fulfillment",
                component: PosOutletFulfillmentComponent,
                canActivate: [AuthGuard]
            }

        ]
    },
    {
        path: "shipment",
        children:
        [
            {
                path: "shipment-batch-information",
                component: ShipmentBatchInformationComponent,
                canActivate: [AuthGuard]
            },
            {
                path: "shipment-search",
                component: ShipmentSearchComponent,
                //canActivate: [AuthGuard]
            },
            {
                path: "shipment-search/:Message",
                component: ShipmentSearchComponent,
                //canActivate: [AuthGuard]
            },
            {
                path: "receive-shipment-details",
                component: ReceiveShipmentDetailsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: "shipment-details",
                component: ShipmentDetailsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: "verify-shipment-details",
                component: VerifyShipmentDetailsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: "test-received-shipment",
                component: TestReceivedShipmentComponent,
                //canActivate: [AuthGuard]
            }
        ]
    },
    {
        path: "retailer",
        children:
        [
            {
                path: "retailer-search",
                component: RetailerSearchComponent,
                canActivate: [AuthGuard]
            },
            {
                path: "retailer-order-details/:retailerID",
                component: RetailerOrderDetailsComponent,
                //canActivate: [AuthGuard]
            }
            ,
            {
                path: "retailer-bank",
                component: RetailerBankComponent,
                canActivate: [AuthGuard]
            }
            ,
            {
                path: "retailer-business",
                component: RetailerBusinessComponent,
                canActivate: [AuthGuard]
            }
            ,
            {
                path: "retailer-company",
                component: RetailerCompanyComponent,
                canActivate: [AuthGuard]
            },
            {
                path: "retailer-contact",
                component: RetailerContactComponent,
                canActivate: [AuthGuard]
            },
            {
                path: "retailer-users-search/:retailerID",
                component: RetailerUsersSearchComponent,
                //canActivate: [AuthGuard]
            },
            {
                path: "retailer-make-payment",
                component: RetailerMakePaymentComponent,
                canActivate: [AuthGuard]
            },
            {
                path: "retailer-fulfillment",
                component: RetailerFulfillmentComponent,
                canActivate: [AuthGuard]
            },

        ]
    },
    {
        path: "dashboard",
        children:
        [
            {
                path: "imc-dashboard",
                component: ImcDashboardComponent,
                //canActivate: [AuthGuard]
            }
        ]
    },
    {
        path: "reports",
        children:
        [

            {
                path: "tag-inventory",
                component: TagInventoryComponent,
                //canActivate: [AuthGuard]
            },
            {
                path: "facilitycode-tag-to-hexadecimal",
                component: FacilitycodeTagToHexadecimalComponent,
                //canActivate: [AuthGuard]
            },
            {
                path: "purchase-order-items-returned",
                component: PurchaseOrderItemsReturnedComponent,
                //canActivate: [AuthGuard]
            },
            {
                path: "view-expiring-tags",
                component: ViewExpiringTagsComponent,
                //canActivate: [AuthGuard]
            },
            {
                path: "tag-history",
                component: TagHistoryComponent,
                //canActivate: [AuthGuard]
            },
            {
                path: "warranty-tracking",
                component: WarrantyTrackingComponent,
                //canActivate: [AuthGuard]
            }
        ]
    },
    {
        path: "distribution",
        children: [
            {
                path: "tags-distribution-to-location",
                component: TagsDistributionToLocationComponent,
                canActivate: [AuthGuard]
            },
            {
                path: "tags-requests-by-location",
                component: TagsRequestsByLocationComponent,
                canActivate: [AuthGuard]
            }

        ]
    }
]