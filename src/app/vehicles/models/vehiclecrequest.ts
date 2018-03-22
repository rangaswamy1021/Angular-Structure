import { ActivitySource, SubSystem } from "../../shared/constants";

export interface IVehicleRequest {
    AccountId: number,
    ActivitySource: ActivitySource,
    CheckBlockList: boolean,
    Color: string,
    ContractType: string,
    Country: string,
    Current: Date,
    DeactivatedDate: Date,
    EndEffectiveDate,
    FilePath: string,
    FutureClosureDate: any,
    IsExempted: boolean,
    IsProtected: boolean,
    IsTemporaryNumber: boolean,
    LoginId: number,
    Make: string,
    Model: string,
    OldTagType: string,
    OldVehicleNumber: string,
    PageNumber: number,
    PageSize: number,
    RCNumber: string,
    SearchVehicleActivityInd: boolean,
    SortColumn: string,
    SortDirection: boolean,
    Source: string,
    StartEffectiveDate,
    State: string,
    Subsystem: SubSystem,
    SystemUserActivityInd: boolean,
    TagSerialNum: string,
    TagType: string,
    UserId: number,
    UserName: string,
    VehicleClass: string,
    VehicleClassDesc: string,
    VehicleHistoryActivity: boolean,
    VehicleId: number,
    VehicleLoadActivityInd: boolean,
    VehicleNumber: string,
    VehicleSearchActivityInd: boolean,
    VehicleStatus: string,
    Year: number,
    IsSelected: boolean,
    CurrentDateTime:any;
}

export interface ISearchVehicle {

    accountId: number,
    VehicleId: number,
    StartEffectiveDate: Date,
    EndEffectiveDate: string,
    UserName: string,
    vehicleNumber: string,
    VehicleStatus: string,
    DeactivatedDate: string,
    ActivitySource: ActivitySource,
    Subsystem: SubSystem,
    SortColumn: string,
    SortDirection: boolean,
    PageNumber: number,
    PageSize: number,
    SearchVehicleActivityInd: boolean,
    SystemUserActivityInd: boolean,
    VehicleLoadActivityInd: boolean,
    LoginId: number,
    UserId: number,
    ContractType: string,
}
