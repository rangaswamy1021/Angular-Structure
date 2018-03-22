import { IPaging } from "./paging";

export interface ITransactionRequest {
AccountId:number;
TripId:number;
VehicleNumber:string;
Entry_TripDateTime:Date;
Exit_TripDateTime:Date;
 SortColumn: string;
 SortDir: number;
 PageNumber: number;
 PageSize: number;
 ReCount: number;
TollTransactionTypeCode:string;
IsPageLoad: boolean;
}
