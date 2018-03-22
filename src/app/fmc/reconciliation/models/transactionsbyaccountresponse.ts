import { IPaging } from "../../../shared/models/paging";

export interface IReconciliationRes {
    Paging: IPaging
    StartDate: Date,
    EndDate: Date,
    IsSearch: boolean,
    CustomerId: number,
    IsVariance: number,
    SystemActivity: any
    AppTrips: number,
    FinTrips: number,
    AppVioTrips: number,
    FinVioTrips: number,
    ReCount: number,
    SortColumn: null,
    SortDir: number,
    PageNumber: number,
    PageSize: number,
}