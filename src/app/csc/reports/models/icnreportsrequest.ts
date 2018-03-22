import { ISystemActivities } from "../../../shared/models/systemactivitiesrequest";
import { IPaging } from "../../../shared/models/paging";

export interface ICNReportsRequest {
  SortDirection: number;
  SortColumn: string;
  PageNumber: number;
  PageSize: number;
  ICNId: number;
  PostingDate: any;
  TxnStartDate: Date;
  TxnEndDate: Date;
  PaymentMode: string;
  UserId: number;
  SearchFlag: boolean;
  User: string;
  ActivityTypeDescription: string;
  ActionCode: string;
  FeaturesCode: string;
  LoginId: number;
  KeyValue: string;
  ActivitySource: string;
  ClerkId: number;
  IsOptional: boolean;
  ICNStatus: string;
  dtRevenueDate: Date;
  dtEndDate: Date;
  ReCount: number;
  PageIndex: IPaging;
  LoggedUserID: number;
  LoggedUserName: string;
  IsSearchEventFired: boolean;
  LocationCode: string;
  LocationName: string;
}