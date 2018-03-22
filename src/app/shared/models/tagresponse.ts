export interface ITagResponse {
    SerialNumber: string,
    VehicleNumber: string,
    TagType: string,
    TagAlias: string,
    TagStatus: string,
    StartEffectiveDate: Date,
    EndEffectiveDate: Date,
    TagTobeReplaced: string,
    TagReqType: string,
    Protocol: string,
    Mounting: string,
    TagReqDate: Date,
    ReqCount: number,
    CustTagReqId: number,
    TagPurchaseMethodDesc: string,
    ItemCode: string,
    HexTagNumber: string,
    RecCount: number,
    ColumnName: string,
    ColumnValue: string,
    isSelected: boolean,
    TagDeliveryMethod: string,
    fulfillVisible:boolean,
    isAccountSelected: boolean,
    IsNonRevenue:boolean,
    LocationId:number
}