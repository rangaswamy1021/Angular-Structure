import { ISystemActivities } from "../../../shared/models/systemactivitiesrequest";

export interface ITransactionReq {
    StartDate: any,
    EndDate: any,
    SystemActivity: ISystemActivities,
    LoginId: number,
    UserId: number,
    User: string,
    ActivitySource: boolean,
    IsViewed: boolean,
    DateType: number,
    HOSTTRXN_RECEIVED: number,
    HOSTTRXN_ACKNOWLEDGED: number,
    HOSTTRXN_ERROR: number,
    TRXN_INPROCESS:number,
    Source: string,
    ReconType: string,
    Count: number,
    Amount: number
}