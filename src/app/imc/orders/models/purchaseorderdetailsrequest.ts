import { IPurchaseOrderLineItemRequest } from './purchaseorderlineitemsrequest';
import { IPurchaseOrderSearchRequest } from './purchaseorderseacrhrequest';
import { IPurchaseOrderSearchResponse } from "./purchaseorderseacrhresponse";
export interface IPurchaseOrderDetailRequest {
    PurchaseOrderNumber: string,
    PurchaseOrderId: number,
    PurchaseOrderDate,
    VendorId: number,
    PurchaseOrderStatus: string,
    ContractId: number,
    WarrantyId: number,
    LocationPath: string,
    UpdatedDate: Date,
    UpdatedUser: string,
    PurchaseOrderLineItemsList: IPurchaseOrderLineItemRequest[],
    VendorName: string,
    ContractName: string,
    WarrantyInMonths: number,
    WarrantyName: string,
    IsReturnPO: boolean,
    UserId: number,
    LoginId: number,
    User: string,
    ActivitySource: string
    ItemId: number,
    ItemName: string,
    ItemQuantity: number,

}