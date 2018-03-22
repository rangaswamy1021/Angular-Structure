
import { ISystemActivities } from "../../../shared/models/systemactivitiesrequest";

export interface IFinanceByCategoryReq {
    StartDate: any,
    EndDate: any,
    IsSearch: boolean,
    CustomerId: number,
    IsVariance: number,
    SystemActivity: ISystemActivities,
    LoginId: number,
    UserId: number,
    User: string,
    ActivitySource: boolean

}
