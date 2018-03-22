import { IPaging } from "../../../shared/models/paging";

export interface ILocationRequest {
    LocationName:string,
    LocationCode:string,
    AgencyId:number,
    Description:string,
    LocationId:number,
    Paging: IPaging,
    PerformedBy:string,
    RecordCount:number,
    ActivitySource:string,
    UserId:number,
    LoginId:number,
    viewFlag:string,
    isOwned: boolean,
    isNonRevenue: boolean
    }