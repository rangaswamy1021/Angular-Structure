export interface ISearchPayment {
    PaymentMode: string
    CardType: string
    AccountNumber: string
    Description: string
    VoucherNo: string
    TxnAmount: number
    RPPaymentMode: string
    RPTxnAmount: string
    Date: Date
}