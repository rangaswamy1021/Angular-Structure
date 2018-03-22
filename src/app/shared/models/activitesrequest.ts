import { ISystemActivities } from './systemactivitiesrequest';
export interface IActivityRequest {
        LookUpTypeCode: string;
        CustomerId: number;
        Type: string;
        Activity: string;
        Linkid: number;
        Subsystem: string;
        LinkSourceName: string;
        PerformedBy: string;
        ActivitySource: string;
        User: string;
        SystemActivities: ISystemActivities;
        AlertDescription: string;
        AlertStatus: number;
        StartDate: string;
        EndDate: string;
        ActivityDate: Date;
        ActivityId: number;
        SortColumn: string;
        SortDir: number;
        PageNumber: number;
        PageSize: number;
        AlertId: number;
        IsSearchEventFired: boolean;
        IsPageLoad: boolean;
}
