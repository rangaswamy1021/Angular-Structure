
import { ISystemActivities } from "../../../shared/models/systemactivitiesrequest";

export interface ITransactionRevenueReq {
    StartDate:any,
    EndDate:any,
    IsSearch: boolean,
    CustomerId: number,
    TransactionCategory: string,
    SystemActivity: ISystemActivities,
    LoginId: number,
    UserId: number,
    User: string,
    ActivitySource: boolean,
}
