import { ISystemActivities } from "../../../shared/models/systemactivitiesrequest";

export interface IcloseFiscalyearRequest {
FiscalYearId:number,
user:string,
SystemActivity: ISystemActivities,
loginId:number,
userId:number,
activitySource:string
}