
export interface IShipmentAdressRequest {
    CustomerId:number,
    AddressId:number,
    Type:string,
    Line1:string,
    Line2:string,
    Line3:string,
    City:string,
    State:string,
    Country:string,
    Zip1:string,
    Zip2:string,
    IsPreferred:boolean,
    IsActive:boolean,
    TypeDescription:string,
    IsValid:boolean,
    ActivitySource:string,//enum
    SubSystem:string,//enum
    UserName:string,
    IsActivityRequired:boolean,
    IsShipmentupdateAddress:boolean
}