export interface IPaymentPlanConfigRequest {
    MaxTerm: number;
    MinAmount: number;
    MaxAmount: number;
    TermType: string;
    PaymentPlanID: number
    Updateduser: string;
    PageNumber: number;
    PageSize: number;
    SortColumn: string
    SortDirection: number;
}