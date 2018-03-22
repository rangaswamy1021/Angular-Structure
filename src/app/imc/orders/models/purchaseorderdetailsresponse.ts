import { IPurchaseOrderItemResponse } from "./purchaseorderitemresponse";

export interface IPurchaseOrderDetailResponse {
    Address: string,
    CEOName: string,
    PhoneNumber: string,
    EmailAddress: string,
    PurchaseOrderNumber: string,
    PurchaseOrderId: number,
    PurchaseOrderDate: Date,
    VendorId: number,
    ContractId: number,
    WarrantyId: number,
    PurchaseOrderLineItems : IPurchaseOrderItemResponse[]
    VendorName: string,
    ContractName: string,
    ContractNumber: string,
    WarrantyInMonths: number,
    WarrantyName: string,
    PhoneType: string,
    DayPhoneNumber:string,
    FAddress:string,
    CompanyName:string,
    RecCount:number,
    ItemName:string,
    ItemID:number
}