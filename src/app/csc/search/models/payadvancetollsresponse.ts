export interface IPayAdvanceTollResponse {
    CustomerId: Number,
    FirstName: String,
    LastName: String,
    VehicleNo : String,
    StartEffectiveDate: Date,
    EndEffectiveDate:Date,
    Amount:Number,
    CurrentBalance:Number,
    TollAmount:Number,
    RecordCount:number;

}