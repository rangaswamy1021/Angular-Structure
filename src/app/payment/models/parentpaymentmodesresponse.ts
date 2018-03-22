import { ISystemActivities } from "../../shared/models/systemactivitiesrequest";

export interface IParentPaymentModesResponse {
    CustomerId: number;
    Date: Date;
    PaymentMode: string;
    ParentPaymentMode: string;
    VoucherNo: string;
    TxnAmount: number;
    Subsystem: string;
    ActivityType: string;
    PaymentStatus: string;
    ParentPaymentId: number;
    PaymentId: number;
    RecCount: number;
    isAllowReverse: boolean;
}

export interface IPaymentActivities{
    Key: string;
    Value: string;
}
