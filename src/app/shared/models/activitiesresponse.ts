import { ISystemActivities } from "./systemactivitiesrequest";

export interface IActivityResponse {
    LookUpTypeCode: string;
    Type: string;
    Activity: string;
    Recount: number;
    StartDate: string;
    EndDate: string;
    ActivityDate: Date;
    PerformedBy: string;
    Linkid: number;
    LinkSourceName: string;
    CustomerId: number;
    ActivityId: number;
    User: string;
    ActivitySource; string;
    Subsystem: string;
    SortColumn: string;
    SortDir: number;
    PageNumber: number;
    PageSize: number;
    AlertId: number;
    AlertDescription: string;
    AlertStatus: number;
    SystemActivities: ISystemActivities;
    IsSearchEventFired: boolean;
    IsPageLoad: boolean;
}
