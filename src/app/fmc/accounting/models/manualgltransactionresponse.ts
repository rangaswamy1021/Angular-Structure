import { ISystemActivities } from "../../../shared/models/systemactivitiesrequest";

export interface IManualGLtransactionResponse {

ManualGLTxnId:number,
PostingDate:Date,
PostingDate_YYYYMM:number,
ManualGLTxnDesc:string,
IsApproved:boolean,
User:string,
TxnAmount:number,
ReCount:number

}