export interface IRecentPaymentsResponse{
PaymentMode: string,
ToltalAmountPaid: number,
CardType: string,
ExpDate: string,
CardNumber: string,
RebillAmount: number,
RebillType: string,
ThresholdAmount: number,
IsManualHold: boolean,
CCTypeDesc:string,
PrefixSuffix:string,
LowBalanceAmount:number
}