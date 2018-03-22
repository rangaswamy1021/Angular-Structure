
import { ISystemActivities } from "../../../shared/models/systemactivitiesrequest";
//import { IPaging } from "../../../shared/models/paging";

export interface ICustomerActivitesRequest {

    Type: string,
    Activity: string,
    ActivityDate: Date,
    PerformedBy: string,
    Linkid: number,
    LinkSourceName: string,
    CustomerId: number,
    ActivityId: number,
    User: string,
    Subsystem: string,
    AlertId: number,
    AlertDescription: string,
    AlertStatus: number,
    IsPageLoad: boolean,
    IsSearchEventFired: boolean,
    StartDate: string,
    EndDate: string,
//    Paging: IPaging

    PageNumber: number,
    PageSize: number,
    SortColumn: string,
    SortDir: number,
    SystemActivities: ISystemActivities

}
