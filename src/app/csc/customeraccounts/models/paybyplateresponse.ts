export interface IPayByPlateResponse {
    AccountId: number,
    VehicleNumber: string,
    Letter1: boolean,
    Letter2: boolean,
    PbyPDate: Date,
    EndDate: Date,
    Notice: number,
    VehicleState: string,
    TagID: string,
    PbyPCustId: number;
}