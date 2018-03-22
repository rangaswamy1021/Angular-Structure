import { IPurchaseOrderLineItemRequest } from './purchaseorderlineitemsrequest';
export interface IPurchaseOrderSearchRequest {
    PurchaseOrderNumber: string,
    OldPurchaseOrderNumber: string,
    StartDate: string,
    EndDate: string,
    PurchaseOrderStatus: string,
    POStatus: string,
    UserId: number,
    LoginId: number,
    User: string,
    OnSearchClick: boolean,
    ActivitySource: string,
    OnPageLoad: boolean,
    SortColumn: string,
    SortDirection: boolean,
    PageNumber: number,
    PageSize: number,
    WarrantyId: number,
    LocationPath: string,
    VendorId: number,
    ContractId: number,
    PurchaseOrderLineItemsList: IPurchaseOrderLineItemRequest[]
    timePeriod:any,
    type:string,
 
}
