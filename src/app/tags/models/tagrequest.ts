import { IShipmentAdressRequest } from './tagshipmentaddressrequest';

export interface ITagRequest {
    SerialNumber: string,
    TagStatus: string,
    PreviousTagStatus: string,
    TagType: string,
    TagName: string,
    FacilityCode: string,
    TagLocation: string,
    ManufactureDate: Date,
    HexTagNumber: string,
    StartEffectiveDate: string,
    StatusDate: Date,
    EndEffectiveDate: string,
    TagAlias: string,
    UserName: string,
    TagReqType: string,//TollPlus.TBOS.Enums.TagRequestType
    CustTagReqId: number,
    ReqCount: number,
    TagPurchaseMethod: number,
    TagDeliveryMethod: number,
    TagReqComment: string,
    TagReqDate: Date,
    CustomerId: number,
    TagTobeReplaced: string,
    IsReplacedTagReturned: boolean,
    VehicleId: number,
    VehicleClassId: string,
    FulfilledQty: number,
    SubSystem: string,//TollPlus.TBOS.Enums.Subsystem
    ActivityType: string,//TollPlus.TBOS.Enums.ActivityType
    ActivitySource: string,//TollPlus.TBOS.Enums.ActivitySource
    AdjustmentReason: string,
    ShipmentId: number,
    PurchaseOrderNumber: string,
    WarrantyEndDate: Date,
    ICNId: number,
    LoginId: number,
    UserId: number,
    TagSearchActivityInd: boolean,
    PreviousDate: Date,
    IsPageLoad: boolean,
    IsSearch: boolean,
    RMANumber: string,
    AssignedOrReturnedType: string,
    ItemCode: string,
    TagDeliveryOption: string,
    ShipmentAddress: IShipmentAdressRequest[],
    TotalRequiredAmount: number,//decimal
    IsNotification: boolean,
    PreviousTagAlias: string,
    Mounting: string,
    Protocol: string,
    TagPurchaseMethodCode: string,
    SplitCustomerId: number,
    SortColumn: string,
    SortDirection: boolean,
    PageNumber: number,
    PageSize: number,
    RevenueCategory:string
    LocationId:number
}

export interface IAssignTagRequest {
    FullAddress: string,
    FullName: string    
}
