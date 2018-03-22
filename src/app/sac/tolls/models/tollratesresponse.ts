export interface ITollRatesResponse {
    TollRateName: string;
    LaneType: number;
    TxnMethod: string;
    TollHdrId: number;
    Class2L: number;
    Class2H: number;
    Class3L: number;
    Class3H: number;
    Class4H: number;
    Class5H: number;
    Class6H: number;
    Class7H: number;
    RecordCount: number;
    FromTime: number;
    ToTime: number;
    TimeRange: string;
}