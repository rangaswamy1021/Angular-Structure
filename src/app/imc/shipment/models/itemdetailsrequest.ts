export interface IItemDetailsRequest {
    ShipmentID: number,
    UserId: number,
    LoginId: number,
    User: string,
    ActivitySource: string,
    SortDirection: number,
    SortColumn: string,
    PageNumber: number,
    PageSize: number,
    OnPageLoad: boolean,
    OnSearchClick:boolean
}