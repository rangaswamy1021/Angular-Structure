import { ISystemActivities } from "../../../shared/models/systemactivitiesrequest";

export interface IGetJournalLineItemsRequest {
    GLTxnId: number,
    SystemActivity: ISystemActivities
}