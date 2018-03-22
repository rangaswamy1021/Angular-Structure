export enum TagRequestType {
    All,
    New,
    Additional,
    Replace
}

export enum PurchaseOrderStatus {
    All,
    PoCreated,
    ReceivedFull,
    ReceivedPartial,
    PoCancelled
}

export enum TagStatus {
    InventoryNew,
    InventoryRecycled,
    InventoryAnaheim,
    Assigned,
    Replaced,
    Expired,
    Lost,
    Stolen,
    Missing,
    StolenCollection,
    Returned,
    ReturnedGood,
    ReturnedDefective,
    ReturnedDamaged,
    ReturnedCollection,
    DestroyedObsolete,
    DestroyedDisposal,
    ShippedDefective,
    ShippedDamaged,
    VendorReturn,
    InventoryRetailer,
    Shipped,
    Found,
    TagInactive,
    Void
}

export enum RetailerStatus {
    ACTIVE,
    INACTIVE

}
export enum ShipmentStatus {
    All,
    ShipPartial,
    ShippedFull
}
export const POAndShipmentMAxValue = "POAndShipmentMAxValue";

export const applicationParam = "applicationParam";
export const tagSupplierID = "tagSupplierID";
export const TagReaderStatus = "TagReaderStatus";

export enum Features {
    IMCREPORTS
}
export enum Locations {
    NTTACentral
}
