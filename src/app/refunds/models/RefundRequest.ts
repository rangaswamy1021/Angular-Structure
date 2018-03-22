import { IPaging } from "../../shared/models/paging";
import { IRefundQueue } from "./RefundQueue";
import { IMakePaymentrequest } from '../../payment/models/makepaymentrequest';

export interface IRefundRequest {
    SubSystem: string,
    RefundType: string,
    AccountID: number,
    FirstName: string,
    LastName: string,
    LoginId: number,
    LoggedUserID: number,
    LoggedUserName: string,
    IsSearchEventFired: boolean,
    ActivitySource: string,
    PageIndex: IPaging,
    Amount: string,
    AccountStatus: string,
    ActivityType: string,
    UpdatedUser: string,
    CreatedUser: string,
    ExceptionRRID: number,
    RefundRequestState: string,
    TxnTypeId: number,
    RefundRequestedDate: Date,
    CreatedDate: Date,
    ModeofPayment: string,
    objIlRefundQueue: IRefundQueue[],
    RRID: number,
    StartDate: string,
    EndDate: string
    BalanceType: string
    PaymentRequest:IMakePaymentrequest;
}