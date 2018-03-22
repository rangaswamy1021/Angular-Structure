import { ISystemActivities } from './../../../shared/models/systemactivitiesrequest';

export interface IAccountGroupsRequest {
    accountgroupid: string,
   accountgroupcode: string,
    accountgroupdesc: string,
    User: string,
    UserId: number,
    LoginId: number,
    SystemActivities: ISystemActivities;
    PageNumber: number,
    PageSize: number,
    ReCount: number,
    IsPaging:number,

}