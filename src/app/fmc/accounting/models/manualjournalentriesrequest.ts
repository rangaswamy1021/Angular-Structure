import { ISystemActivities } from "../../../shared/models/systemactivitiesrequest";
import { IManualGLTxnLineItems } from "./manualgltxnlineitems";

export interface IManualJournalEntriesRequest {
    PostingDate: any,
    PostingDate_YYYYMM: any,
    ManualGLTxnDesc: string,
    IsApproved: boolean,
    TxnAmount: number,
    SystemActivity: ISystemActivities,
    glAccountId: number,
    debitOrCredit: number,
    amount: number,
    objManualGLTxnLineItems: IManualGLTxnLineItems[],
    User: string
}
