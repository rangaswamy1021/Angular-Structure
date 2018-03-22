import { ActivitySource, SubSystem } from "../../shared/constants";

export interface IAddressRequest {
    AddressId: number,
    CustomerId: number,
    Line1: string,
    Line2: string,
    Line3: string,
    City: string,
    State: string,
    Country: string,
    Zip1: string,
    Zip2: string,
    Type: string,
    UserName: string,
    IsActive: boolean,
    IsPreferred: boolean,


    SubSystem: SubSystem,
    ActivitySource: ActivitySource,
    IsActivityRequired: boolean,
    UserId: number,
    LoginId: number,
    CountryName: string,
    StateName: string,
    CheckBlockList: boolean,
    IsInvalidAddress: boolean,
    ReasonCode: string,
    IsShipmentupdateAddress: boolean
}