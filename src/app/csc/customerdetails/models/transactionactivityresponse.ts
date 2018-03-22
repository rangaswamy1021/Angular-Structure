export interface ITransactionActivityResponse {
    CustomerTripId?: number,
    TripId?: number,
    Entry_TripDateTime?: number,
    Exit_TripDateTime?: number,
    TravelTime?: Date,
    EntryPlazaName?: string,
    ExitPlazaName?: string,
    DiscountAmount?: number,
    FeeAmounts?: number,
    OutStandingAmount?: number,
    LocationName?: string,
    VehicleNumber?: string,
    TollAmount?: number,
    TagId?: string,
    ProblemId?: number,
    TripNumber?: number,
    PageNumber?: number,
    ReCount?: number,
    LaneName?: string,
    ProblemStatus?: string,
    TripStageId?: number,
    TollTransactionTypeCode?: number,
    TransactionAmount?: number,
    TripStatusCode?: number,
    PostedDate: string,
    selected: boolean
}