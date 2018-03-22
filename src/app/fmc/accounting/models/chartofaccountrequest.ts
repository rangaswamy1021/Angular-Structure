import { ISystemActivities } from "../../../shared/models/systemactivitiesrequest";

export interface IchartofAccountRequest {
    AccountGroupCode: string,
    AccountSubGroupCode: string,
    ChartOfAccountId: number,
    AccountName: string,
    ParentChartOfAccountId: string,
    LowerBound: number,
    UpperBound: number,
    Status: string,
    IsControlAccount: string,
    NormalBalanceType: string,
    LegalAccountID: string,
    User: string,
    SystemActivities: ISystemActivities,
    SortColumn: string,
    PageNumber: number,
    PageSize: number,
    SortDir:any,
    ReCount:number
}