
import { ISystemActivities } from "../../../shared/models/systemactivitiesrequest";

export interface IProfileRequest {
  SortDirection:boolean;
  PageNumber:number;
  PageSize:number;
  ActivitySource:string;
  AccountId:number;
  SortColumn:string;
  ContactId:number;
  OrganisationName:string;
  Title:string;
  Suffix:string;
  FirstName:string;
  MiddleName:string;
  LastName:string;
  Gender:string;
  PerformBy:string;
  SubSystem:string;
  IsActivityRequired:boolean;
  SystemActivities: ISystemActivities;
  NameType:string;
  DOB:Date;
  CheckBlockList:boolean;
}