
export interface IPurchaseOrderSearchResponse {
    VendorId: number,
    VendorName: string,
    POStatus: string,
    PurchaseOrderDate: Date,
    LocationPath: string,
    PurchaseOrderNumber: string,
    OldPurchaseOrderNumber: string,
    PurchaseOrderId: number,
    RecCount: number,
    ContractId: number,
    ContractName: string,
    WarrantyId: number,
    WarrantyName: string,
    WarrantyInMonths: number,
    MinOrderLevel:number,
    MaxOrderLevel:number,
    ItemName:string,
    ItemDesc:string,
    ItemCode:string,
    ItemQuantity:number,
    ItemId:number,
    CompanyName:string,
    ItemPrice:string,
    UpdatedUser:string
 
}

