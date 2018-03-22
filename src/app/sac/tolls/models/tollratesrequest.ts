import { IPaging } from '../../../shared/models/paging';
export interface ITollRatesRequest{
    TollRateId:Number,
    TollRateHdrId:Number,
    TollRateName:String,
    VehicleClass:String,
    TollAmount:String,
    LaneType:String,
    Class2L:Number,
    Class2H:Number,
    Class3L:Number,
    Class3H:Number,
    Class4H:Number,
    Class5H:Number,
    Class6H:Number,
    Class7H:Number,
    TxnMethod:String,
    ActivitySource:String,
    IsActive: Boolean;
    Paging:IPaging,
    LoginId:Number,
    UserId:Number,
    ViewFlag:Boolean,
    PerformedBy:String
}