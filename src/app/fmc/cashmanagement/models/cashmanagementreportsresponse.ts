
export interface IcashManagementReportResponse {
    ItemCount: number,
    ItemType: null,
    BeginofAmount: number,
    EndofAmount: number,
    ChangeFundID: number,
    Date: Date,
    StartDate: Date,
    EndDate: Date,
    RevenueAmount: number,
    ReceivedBalance: number,
    FloatAmount: number,
    FloatTotalAmount: number,
    ReceivedTotalAmount: number,
    FloatDenomination: [
        {
            FloatHundreds: number,
            FloatFifties: number,
            FloatTwenties: number,
            FloatTens: number,
            FloatFives: number,
            FloatTwos: number,
            FloatOnes: number,
            FloatHalfs: number,
            FloatQuarters: number,
            FloatDimes: number,
            FloatNickles: number,
            FloatPennies: number,
            FloatSource: string,
            FloatDate: Date,
            FloatTotalAmount: number,
            FloatUserID: number,
            SourceofFloat: string ,
            FloatUserName: null
            }
        ],
ReceivedDenomination: [
    {
        ReceiveHundreds:number,
        ReceiveFifties: number,
        ReceiveTwenties: number,
        ReceiveTens: number,
        ReceiveFives: number,
        ReceiveTwos: number,
        ReceiveOnes: number,
        ReceiveHalfs: number,
        ReceiveQuarters: number,
        ReceiveDimes: number,
        ReceiveNickles: number,
        ReceivePennies: number,
        ReceivedSource: string,
        ReceivedFloatDate: Date,
        ReceivedTotalAmount: number,
        ReceivedUserID: number,
        SourceofReceive: string,
        ReceiveUserName: null
    }]
    
}