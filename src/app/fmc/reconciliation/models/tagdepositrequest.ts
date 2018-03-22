import { ISystemActivities } from "../../../shared/models/systemactivitiesrequest";
import { IPaging } from "../../../shared/models/paging";

export interface ITagDepositReq {

    PageNumber: number,
    PageSize: number,
    User: string,
    SortColumn: string,
    ReCount: number,
    SortDir:string,
    StartDate: any,
    EndDate: any,
    IsSearch: boolean,
    CustomerId: number,
    IsVariance: number,
    SystemActivity: ISystemActivities,
    LoginId: number,
    UserId: number,
    ActivitySource: boolean,
    ResultCount:number

}





