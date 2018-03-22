import { IAddressRequest } from "./addressrequest";
import { AccountIntegration, PaymentMode } from "../constants";
import { AccountStatus } from "../../shared/constants";
import { ICreditcardpaymentrequest } from "./creditcardpaymentrequest";
import { IInvoiceRequest } from "../../invoices/models/invoicesrequest";
import { ITripsRequest } from "../../tvc/paymentdetails/models/tripsrequest";
import { IEMIDetailsRequest } from "../../tvc/paymentdetails/models/EMIDetailsRequest";
import { IRequestCreditCard } from "../../tvc/paymentdetails/models/RequestCreditCard";

export interface IViolationPaymentrequest extends IAddressRequest {

    AccountIntegration: AccountIntegration,
    Description: string,
    AccountStatus: AccountStatus,
    TxnAmount: number,
    CustomerId: number,
    UserName: string,
    PaymentMode: PaymentMode,
    CustomerParentPlan: string,
    ICNId: number,
    LoginId: number,
    UserId: number,
    PaymentProcess: string,

    CreditCardPayment: ICreditcardpaymentrequest,
    CreditCardServiceTax: number,
    IsAddNewCardDetails: boolean,
    IsNewAddress: boolean,

    BankName: string,
    AccoutName: string,
    AccountNumber: string,
    BankRoutingNumber: string,
    IsAddNewBankDetails: boolean,

    Name: string,
    Address: string,
    IsPayment: boolean,
    ChequeDate: string,
    ChequeNumber: string,
    CheckRoutingNumber: string,
    AnonymousID: number,
    PaymentID: number,

    MODate: string,
    MONumber: string,

    TripIds: string,
    PaymentFor: string,
    objListInvoices: IInvoiceRequest[],
    objListTrips: ITripsRequest[],
    LstEMIDetails: IEMIDetailsRequest[],
    ViolationProcess: string,
    PaymentType: string,
    DownPaymentAmount: number,
    TotalPaymentPlanAmount: number,
    DepositAmount: number,
    TermPaymnetAmount: number,
    PaymentDate:Date,
    MobileNo: string,
    Email: string,
    MonthlyTerms: number,
    Terms: string,

    NavProcess: string,
    requestCreditCard: IRequestCreditCard,
    IsAutoDebit: boolean,
    IsFullPayment: boolean,
    objEMIRequest: any;

}
