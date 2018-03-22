import { ISystemActivities } from "../../../shared/models/systemactivitiesrequest";

export interface IActivitiesRequest {
  StartDate: Date;
  EndDate: Date;
  Type: string;
  Activity: string;
  ActivityDate: Date;
  PerformedBy: string;
  Linkid : number;
  LinkSourceName: string;
  CustomerId: number;
  ActivityId: number;
  User: string;
  ActivitySource; string;
  Subsystem: string;
  SortColumn: string;
  SortDir: number;
  PageNumber: number;
  PageSize: number;
  AlertId: number;
  AlertDescription: string;
  AlertStatus: number;
  SystemActivities: ISystemActivities;
  IsSearchEventFired: boolean;
  IsPageLoad: boolean;
  
}