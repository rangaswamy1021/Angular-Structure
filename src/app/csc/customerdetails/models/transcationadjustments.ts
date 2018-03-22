import { ISystemActivities } from './../../../shared/models/systemactivitiesrequest';
export interface IRequestTranscationAdjustment{
    adjustmentId: number;
    transcationadjustment: any;
    AmountType: string;
    amount:number;
    AdjustmentCategoryId:number;
    ReasonCode:string;
    Description:string;
    AdjustmentDate :Date;
    ApprovedStatusDate :Date;
    AppTxnTypeCode:string;
    Amount:number;
    TransferCustomerId:number;
    DrCr_Flag:string;
    ICNId:number;
    LoginId:number;
    UserId:number;
    PageSize:number;
    SortDir : number;
    SubSystem:string;
    TxnType:string;
    TxnTypeDesc:string;
    IsPostpaidCustomer:boolean;
    User:string;    
    ActivitySource:string;

    CustomerTripId:number;

    AccStatusCode:string;

    TripProblemId:number;

    CustomerId:number;

    Check:string;

    AdjustmentCategory:string;
    TxnAmount:number;
    SystemActivity:ISystemActivities;
}