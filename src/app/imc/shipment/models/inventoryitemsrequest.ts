export interface IInventoryItemRequest {
    CustomerId: number,
    ItemType: string,
    FacilityCode: string,
    ItemID: number,
    ItemStatus: string,
    InvStatusDate: Date,
    HexTagID: string,
    LocationID: number,
    ShipmentID: number,
    BatchID: number,
    ManufactureDate: Date,
    ItemCode: string,
    CreatedUser: string,
    SerialNumber: string,
    WarrantyStartDate: any,
    WarrantyEndDate: any
}