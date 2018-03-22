import { ISystemActivities } from "../../../shared/models/systemactivitiesrequest";

export interface ISpecialJournalRequest {
    StartDate: any,
    EndDate: any,
    SpecialJournalId: number,
    ChartOfAccountId: number,
    CustomerId: number,
    PageNumber: number,
    PageSize: number,
    User: string,
    SortColumn: string,
    SortDir: number,
    SystemActivities: ISystemActivities
}