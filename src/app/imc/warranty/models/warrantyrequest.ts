import { ActivitySource } from "../../../shared/constants";


export interface IWarrantRequest {
    WarrantyId: number,
    WarrantyName: string,
    WarrantyTypeId: string,
    WarrantyInMonths: number,
    WarrantyDesc: string,
    CreatedUser: string,
    UpdatedUser: string,
    ContractId: number,
    OnSearchClick: string,
    UserId: number,
    LoginId: number,
    User: string,
    ActivitySource: string,
    PageNumber: number,
    PageSize: number,
    SortColumn: string,
    SortDirection: boolean,
    ContractStatus:number
}