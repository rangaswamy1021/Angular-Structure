import { PaymentMode } from './../../../payment/constants';
export interface ICNSysTxns {
    CustomerId: number;
    VoucherNo: String;
    TxnType: PaymentMode;
    TxnId: number;
    TxnAmount: number;
    TotalTxnAmount: number;
    ReCount: number;
}