export interface IBalanceResponse {
    LastAdjustmentAmount: number,
    LastReversalAmount: number;
    LastRefundAmount: number;
    TagDepositeBalance: number;
    RefundBalance: number;
    TollBalance: number;
    ViolationBalance: number;
    PostpaidBalance: number;
    CollectionBalance: number;
    RewardPoint: number;
    RewardBalance: number;
    CSVRewardIds: string,
    BalanceAmount: number,
    RequestedAmount:number,
}