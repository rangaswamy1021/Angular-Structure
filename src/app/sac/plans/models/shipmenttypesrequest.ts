export interface IShipmentTypesRequest{
    ServiceTypeId: number;
    ServiceTypeName: string;
    ServiceDescription: string;
    Cost: number;
    IsActive: boolean;
    PageNumber: number;
    PageSize: number;
    SortColumn: string;
    SortDir: number;
    LoginId: number;
    UserId: number;
    PerformedBy: string;
    ActivitySource: string;
    Operation: string;
}