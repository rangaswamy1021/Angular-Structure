import { ISystemActivities } from "../../../shared/models/systemactivitiesrequest";
// import { IPaging } from './../../../shared/models/paging';

export interface IGeneralJournalRequest {
    SystemActivity: ISystemActivities,
    SortColumn: string,
    SortDir: number,
    PageNumber: number,
    PageSize: number,
    GLTxnId: number,
    CustomerId: number,
    LinkId: number,
    TxnTypeLineItemId: number,
    TxnTypeCategoryId: number,
    ChartofAccountId: number,
    PostingDate: Date,
    DebitAmount: number,
    CreditAmount: number,
    TxnAmount: number,
    Description: String,
    LinkSourceName: string,
    AccountName: string,
    TxnType: string,
    StartDate: any,
    EndDate: any,
    IsSearch: boolean,
    ReCount: number
}