import { ISystemActivities } from "../../shared/models/systemactivitiesrequest";

export interface IParentPaymentModes {
    CustomerID: number;
    PageNumber: number;
    PageSize: number;
    SortColumn: string;
    SortDirection: number;
    StartDate: Date;
    EndDate: Date;
    ActivityCategoryType: string;
    PaymentHistoryActivityInd: boolean;
    PaymentHistoryLoadActivity: boolean;
    SystemActivity: ISystemActivities;
    Subsystem: string;
    TxnTypeCategory: string;
    PaymentStatus: string;
}