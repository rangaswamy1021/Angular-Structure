import { ISystemActivities } from "../../../shared/models/systemactivitiesrequest";

export interface IManualGLtransactionRequest {
ManualGLTxnId:number,
CustomerID:number,
PostingDate:Date,
PostingDate_YYYYMM:number,
ManualGLTxnDesc:string,
IsActitvity:boolean,
TxnAmount:number,
IsApproved:boolean,
User:string,
SystemActivity:ISystemActivities,
SortColumn: string,
SortDir: number,
PageNumber: number,
PageSize: number,
ReCount:number

}


