
import { ISystemActivities } from "../../../shared/models/systemactivitiesrequest";
import { IPaging } from "../../../shared/models/paging";

export interface IReconcilitionReq {
    Paging:IPaging,
    PageNumber: number,
    PageSize: number,
    User: string,
    SortColumn: string,
    SortDir: number,
    SystemActivity: ISystemActivities,
    StartDate: any,
    EndDate: any,
    IsSearch: boolean,
    CustomerId: number,
    IsVariance: number     
    
}