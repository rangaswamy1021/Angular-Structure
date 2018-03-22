
export interface IRefundResponse {
    ModeofPayment: string,
    AccountID: number,
    Amount: number,
    AccountHolderName: string,
    VoucherId: string,
    IsVoucherId: boolean,
    AccountStatus: string,
    TotalCount: number,
    ActivityType: string,
    UpdatedUser: string,
    CreatedUser: string,
    ExceptionRRID: number,
    RefundRequestState: string,
    TxnTypeId: number,
    SubSystem: string,
    RefundRequestedDate: Date,
    CreatedDate: Date,
    RefundType: string,
    RRID: number;

    checked: boolean;
    isProcessRefund: boolean
    istxtAmountEnable: boolean
    isModeOfPaymentEnable: boolean
    isSelectIndividual: boolean
    OriginalAmount: number,
}