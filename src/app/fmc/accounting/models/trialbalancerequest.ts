import { ISystemActivities } from "../../../shared/models/systemactivitiesrequest";

export interface ITrailBalanceRequest {
    StartDate: any,
    EndDate: any,
    User: string,
    SystemActivities: ISystemActivities
}