export interface IBalanceResponse{
    TollBalance: number;
    RewardBalance: number;
    CollectionBalance: number;
    ViolationBalance: number;
    TagDepositeBalance: number;
    OtherDepositBalance: number;
    PromoBalance: number;
    RefundBalance: number;
    BalanceAmount: number;
    IsCustomer: boolean;
    ViolationDepositBalance: number;
    LastAdjustmentAmount: number;
    LastReversalAmount: number;
    LastRefundAmount: number;
    AdminHearBalance: number;
    RequestedAmount: number;
    PostpaidBalance: number;
    EMIBalance: number;
    EligibleOverPaymentAmount: number;
    RewardPoint: number;
    RewardBalances: number;
    CSVRewardIds: string;
    AnonymousBalance: number;
    AdvancePayment: number;
    
}