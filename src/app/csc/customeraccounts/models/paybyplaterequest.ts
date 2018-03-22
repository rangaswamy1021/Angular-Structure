export interface IPayByPlateRequest {
    AccountId: number,
    VehicleNumber: string,
    Letter1: boolean,
    Letter2: boolean,
    CurrentDateTime: Date,
    SubSystem: string,
    ActivitySource: string,
    UpdatedUser: string,
    StartDate: string,
    EndDate: string,
    PbyPCustId: number,
    VehicleState: string,
    TagID: string
}