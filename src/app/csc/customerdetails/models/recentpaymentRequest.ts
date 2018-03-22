import { IPaging } from "../../../shared/models/paging";
export interface IRecentPaymentRequest {
IsProtected:boolean;
Paging :IPaging;
AccountId:number;
  SortColumn: string,
    SortDir: number,
    PageNumber: number,
    PageSize: number,
    
}

