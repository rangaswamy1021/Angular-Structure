export interface IPaymentPlanConfig {
    MinAmount: number;
    MaxAmount: number;
    MaxTerm: number;
    TermType: string;
    PaymentPlanID: number;
    PageSize: number;
    PageNumber: number
}