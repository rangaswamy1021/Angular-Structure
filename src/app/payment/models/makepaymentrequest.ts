import { AccountIntegration, PaymentMode, AccountStatus, RevenueCategory } from "../constants";
import { ICreditcardpaymentrequest } from "./creditcardpaymentrequest";
import { IAddressRequest } from "./addressrequest";
import { ITagrequests } from "./tagrequests";
export interface IMakePaymentrequest extends IAddressRequest {
    AccountIntegration: AccountIntegration,
    Description: string,
    AccountStatus: AccountStatus,
    TxnAmount: number,
    PlanFee: number,
    CustomerId: number,
    UserName: string,
    IsPostpaidCustomer: boolean,
    CustomerCCorBankAccountId: number,
    IsCollectionCustomer: boolean,
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
    PromoCode: string
    ReplenishmentType: string,
    PlanID: number,
    OtherPlanFee: number,
    RevenueCategory: RevenueCategory,
    TagDeliveryOption: string;
    TagDeliveryMethod: number;
    StatementCycle: string,
    InvoiceIntervalId: number;
    InvoiceAmount: number,
    InvoiceDay: string,
    ShipmentAddress: IAddressRequest[],
    TagRequests: ITagrequests[];
    FeatureName: string;
}
