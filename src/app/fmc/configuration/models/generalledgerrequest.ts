import { IPaging } from "../../../shared/models/paging";
import { ISystemActivities } from "../../../shared/models/systemactivitiesrequest";

export interface IGeneralLedgerRequest {
    StartDate: Date,
    EndDate: Date,
    ChartOfAccountId: number,
    SystemActivity: ISystemActivities,
    User: string,
    LoginId: number,
    UserId: number,
    ActivitySource: string,
    TxnDate: Date,
    AccountName: string,
    DebitAmount: number,
    CreditAmount: number,
    OpeningBalance: number,
    RunningBalance: number,
    TxnDescription: string,
    IsSearch: boolean,
    IsViewed:boolean,
  
}