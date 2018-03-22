export interface IInventoryRequest {
  SerialNumber:number;
  FacilityCode:string;
  LoginId: number;
  User: string;
  UserId: number;
  SearchFlag: boolean;
  ActivitySource: string;
  LocationId:number;
}