
import { ISystemActivities } from "../../../shared/models/systemactivitiesrequest";

export interface IAccountsubgroupsrequest{
    SystemActivities: ISystemActivities,
    SortColumn: string,
    SortDir: number,
    PageNumber: number,
    PageSize: number,
    ReCount: number,
    IsPaging:number,
    user:string,
    Description:string,
    AccountSubGroupId:number,
    AccountGroupCode:string,
    AccountSubGroupCode:string;
}