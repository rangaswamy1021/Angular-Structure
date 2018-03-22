import { ActivitySource } from "../../shared/constants";

export interface IVehicleResponse {
    VehicleId: number,
    CustomerId: number,
    VehicleNumber: string,
    VehicleClass: string,
    VehicleClassDesc: string,
    TagType: string,
    Make: string,
    Model: string,
    Color: string,
    Year: number,
    RCNumber: string,
    StartEffectiveDate: any,
    EndEffectiveDate: any,
    VehicleStatus: string,
    IsTemporaryNumber: boolean,
    State: string,
    Country: string,
    IsProtected: boolean,
    IsExempted: boolean,
    ModelDescription: string,
    StateName: string,
    CountryName: string,
    MakeDescription: string,
    RecordCount: number,
    Vehicle_Description: string,
    VehicleDescription: string,
    UpdatedDateTime: Date,
    TagSerialNumber: string,
    IsTagAvailable: boolean,
    ContractType: string,
    TagRevenueType: boolean
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

export interface IVehicleClass {
    Name: string,
    TagFee: number,
    Code: string,
    TagDeposit: number,
    ThresholdAmount: number,
    UserName: string,
    VehicleClassDesc: string,
}

