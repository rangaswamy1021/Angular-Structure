
import { IPaging } from "../../../shared/models/paging";

export interface IVEPTariffsRequest {
    VEPPassId: number,
    LocationCode: string,
    PlazaCode: string,
    PassType: string,
    VehicleClass: string,
    StartEffectiveDate: any,
    EndEffectiveDate: any,
    Amount: string,
    IsActive: boolean,
    MaxTrips: number,
    CreatedUser: string,
    UserId: number,
    Action: string,
    LoginId: number,
    ViewFlag: boolean,
    Paging: IPaging,
    Status: string
}