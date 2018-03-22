import { IPaging } from "../../../shared/models/paging";

export interface ITagDepositRes {
    Paging: IPaging
    StartDate: Date,
    EndDate: Date,
    IsSearch: boolean,
    CustomerId: number,
    IsVariance: number,
    SystemActivity: any,
    PaymentMode: string,
    ApplicationCount: number,
    FinanceCount: number,
    VarianceCount: number,
    ApplicationAmount: number,
    FinanceAmount: number,
    ReCount: number,
    SortColumn: null,
    SortDir: number,
    PageNumber: number,
    PageSize: number,
    ResultCount: number,
    AppEndingBal:number,
    FinEndingBal:number
}


