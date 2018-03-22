import { ActivitySource } from "../../../shared/constants";

export interface ItagHistoryRequest {
SortDirection: boolean,
  SortColumn: string;
  PageNumber: number;
  PageSize: number;
  UserId: number;
  LoginId: number;
  HexTagNumber: string,
 SerialNumber: string,
 TagId:number,
 FacilityCode:string,
  User: string,
  ActivitySource:string,
  OnSearchClick : boolean,
  HexTagID:number,
LocationId:number


}