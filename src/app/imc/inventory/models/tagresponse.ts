export interface ITagResponse {
    SerialNumber: string,
    TagStatus: string,
    TagType: string,
    TagName: string,
    FacilityCode: string,
    Location: string,
    ManufactureDate: Date,
    HexTagNumber: string,
    StartEffectiveDate: Date,
    StatusDate: Date,
    EndEffectiveDate: Date,
    TagAlias: string,
    CreatedBy: string,
    UpdatedBy: string,
    TagReqType: string,
    CustTagReqId: number,
    ReqCount: number,
    TagPurchaseMethod: string,
    TagDeliveryMethod: string,
    TagReqComment: string,
    TagReqDate: Date,
    CustomerId: number,
    TagTobeReplaced: string,
    IsReplacedTagReturned: boolean,
    LocationId: number,
    VehicleId: number,
    RecCount: number,
    CustomerName: string,
    InventoryId: number,
    TagId: number,
    ColumnName: string,
    ColumnValue: string,
    WarrantyEndDate: Date,
    ItemCode: string,
    AssignedOrReturnedType: string,
    VehicleNumber: string,
    ResultCount: number,
    TagCount: number,
    ItemCount: number,
    ThresholdCount: number,
    IsTagRequired: boolean,
    Mounting: string,
    Protocol: string,
    TagPurchaseMethodDesc: string,
    POId: number,
    POName: string,
    PurchaseOrderDate: Date,
    POItemCount: number,
    isSelected:boolean,
      PreviousTagStatus:string,
      IsVehicleTags:string,
    
}