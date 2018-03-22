export interface IVEPTariffsResponse {
    VEPPassId: number,
    Location: string,
    Plaza: string,
    PassType: string,
    VehicleClass: string,
    StartEffectiveDate: Date,
    EndEffectiveDate: Date,
    Amount: string,
    IsActive: boolean,
    MaxTrips: number,
    RecordCount: number
}