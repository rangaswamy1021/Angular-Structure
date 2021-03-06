export interface IVepVehicleContextResponse {
    DriverName: string,
    DrivingLicenceNo: string,
    VehicleNo: string,
    VehicleClass: string,
    VehicleState: string,
    VehicleCountry: string,
    LocationCode: string,
    LocationName: string,
    PlazaCode: string,
    PlazaName: string,
    PassType: string,
    PurchasedDate: Date,
    StartEffectiveDate: any,
    EndEffectiveDate: any,
    Amount: string,     
    CCName:string,
    CCType:string,
    CCMonth:number,
    CCYear:number,
    CCNumber:number,
    Address1:string,
    Address2:string,
    Address3:string,
    City:string,
    State:string,
    Zip1:number,
    Zip2:number,
    Country:string,
    ServiceTax:string,    
    TotalAmount:string,
    ReferenceNo:string,
    TxnDateTime:Date,
    LoginId:number,
    UserId:number,
    UserName:string,
    PaymentId:number;
    CustomerId:number;    
    VEPTarrifId:number;
}