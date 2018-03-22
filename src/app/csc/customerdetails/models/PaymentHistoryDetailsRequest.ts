import { ISystemActivities } from "../../../shared/models/systemactivitiesrequest";
import { SubSystem, ActivitySource, TxnTypeCategories } from '../../../shared/constants';
import { IPaging } from '../../../shared/models/paging';

export interface IPaymentHistoryDetailsRequest {

    CustomerID: number,
    StartDate: Date,
    EndDate: Date,
    PageNumber: number,
    PageSize: number,
    SortColumn: string,
    SortDirection: boolean,
    PaymentHistoryActivityInd: boolean,
    PaymentHistoryLoadActivity: boolean,
    SystemActivity: ISystemActivities
    ActivityType: ActivitySource
    PerformedBy: string;
    ActivitySource: string;
    TxnTypeCategory
    SubSystem: string
    ActivityCategoryType: string
    TxnTypeCategories: TxnTypeCategories
    paging: IPaging
    IsSearchEventFired: boolean;

}
