import { IPaging } from './../../../shared/models/paging';
export interface IVEPPassesRequest
{
DriverName:string,
DrivingLicenceNo:string,
VehicleNo:string,
VehicleClass:string,
VehicleState:string,
VehicleCountry:string,
LocationCode:string,
LocationName:string,
PlazaCode:string,
PlazaName:string,
PassType:string,
PurchasedDate:Date,
StartEffectiveDate:Date,
EndEffectiveDate:Date,
Amount:number,
CreatedUser:string,
UserId:number,
LoginId:number,
Paging:IPaging,
SubSystem:string,
ActivitySource:string,
VEPTarrifId:number,
SessionIndicator:number,
CustomerId:number,
NeedDateFilter:number,
CheckBlockList:boolean,
FirstName:string,
LastName:string,
EmailAddress:string,
PhoneNumber:string,
PaymentStatus:string
}
