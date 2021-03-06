import { IPaging } from './../../../shared/models/paging';
export interface IExceptionListResponse {
    WatchListID: number,
    CustomerID: number,
    VehicleNumber: string,
    VehicleState: string,
    VehicleCountry: string,
    TagID: string,
    Comments: string,
    IsActive: boolean,
    UserName: string,
    StartEffectiveDate: Date,
    EndEffectiveDate: Date,
    Paging: IPaging
}