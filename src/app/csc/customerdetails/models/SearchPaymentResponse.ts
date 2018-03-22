
export interface ISearchPaymentResponse {

    Date: Date,
    Activity: string,
    PreviousBalance: number,
    TxnAmount: number,
    CurrentBalance: number,
    Description: string,
    RecCount: number
    ParentPaymentMode: string,
    PaymentMode: string
    VoucherNo: string
    PaymentStatus: string,
    isReversed: boolean,
    PaymentId:number,
    PreviousBalanceTxt: string,
    TxnAmountTxt: string,
    CurrentBalanceTxt: string
}
