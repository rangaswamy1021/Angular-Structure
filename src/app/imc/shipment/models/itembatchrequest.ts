export interface IItemBatchRequest {
    ShipmentID: number,
    BatchType: string,
    BatchDate: Date,
    ActualCount: number,
    ExpectedCount: number,
    BegSerialNum: string,
    EndSerialNum: string,
    CreatedUser: string
}