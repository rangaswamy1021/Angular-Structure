export interface IViolatorsearchRequest {
    Soundex: number;
    ViolatorID: number;
    LoggedUserId: number;
    TripId: number;
    TxnId: number;
    LicensePlate: string;
    ViolatorFirstName: string;
    ViolatorSecondName: string;
    IsViolation: boolean;
    TotalRecords: number;
    SortColumn: string;
    SortDir: boolean;
    PageNumber: number;
    PageSize: number;
    LoginId: number;
    UserName: string;
    IsSearch: boolean;
    IsBackToSearch: boolean;
    Address: string;
    InvoiceNumber: string;
    InvoiceBatchId: string;
}
