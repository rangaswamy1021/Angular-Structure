import { ISystemActivities } from "../../../shared/models/systemactivitiesrequest";

export interface IFiscalyearRequest {
    systemActivities:ISystemActivities,
    FiscalYearId:number,
    FiscalYearName:any,
    FiscalYearDesc:string,
    StartDate:any,
    EndDate:any,
    User:string
    
}