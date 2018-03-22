import { ICustomerProfile } from "./CustomerProfile";
import { IAmountDetails } from "./AmountDetails";
import { IBillingDetails } from "./BillingDetails";
import { IActivities } from "./Activities";
import { ISearchPayment } from "./SearchPayment";
import { IBalances } from "./Balances";
import { IPaymentResponse } from "./PaymentResponse";

export interface IRefundProcess {
    AccountID: number,
    RefundType: string,
    RRID: number,
    ModeofPayment: string,
    Amount: number,
    PrintDate: string,
    RRType: string,
    RPAmount: string,
    RRAcountStatus: string,

    CustomerProfile: ICustomerProfile,

    AmountDetails: IAmountDetails,
    PaymentResponse: IPaymentResponse

    BillingDetails: IBillingDetails,
    Balances: IBalances,

    ILActivities: IActivities,

    SearchPayment: ISearchPayment,
    
}