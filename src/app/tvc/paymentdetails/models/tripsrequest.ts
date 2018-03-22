export class ITripsRequest {
    CitationId: number
    TripId: number
    ViolatorId: number
    VehicleNumber: string
    StartDate: Date
    EndDate: Date
    StatusCode: string
    SortColumn: string
    SortDirection: number
    PageNumber: number
    PageSize: number
    UserId: number
    LoginId: number
    UserName: string
    IsPageLoad: boolean
    IsSearch: boolean
    DateofTravel: Date
    IsDateRequired: boolean
    InvoiceNo: string
    TotalTripFeesAmts: number
    TripTotalOutstandingAmt: number
    TripPaymentAmt: number
    CurrentPageForPager: number
    TransactionTypeCode: string
    TopN: number

}