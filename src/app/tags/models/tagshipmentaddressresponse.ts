import { IPaging } from '../../shared/models/paging';

export interface IShipmentAdressResponse {
    CustomerId:number,
    AddressId:number,
    Type:string,
    Line1:string,
    Line2:string,
    Line3:string,
    City:string,
    State:string,
    Country:string,
    Zip1:string,
    Zip2:string,
    IsPreferred:boolean,
    IsActive:boolean,
    TypeDescription:string,
    IsValid:boolean
}

export interface ICommonResponse {
    CountryCode: string,
    CountryId: number,
    CountryName: string,
    CustomerId: number,
    LookUpTypeCode: string,
    LookUpTypeCodeDesc: string,
    LookUpTypeCodeId: number,
    ParentLookUpTypeCodeId: number,
    ReturnValue: string[],
    StateCode: string,
    StateId: number,
    StateName: string,
    UserName: string
}

export interface ICommon {
    LookUpTypeCode: string,
    CountryCode: string
}