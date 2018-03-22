export interface IViolatorSearchContextResponse{
    ViolatorID: number,
    InvoiceNumber: string,
    InvoiceBatchId: string,
    TripId: number,
    LicensePlate: string,
    Address: string,
    ViolatorFirstName: string,
    ViolatorSecondName: string,
    IsNavigatedFromAccountSummary: boolean,   
    pageIndex: number 
}