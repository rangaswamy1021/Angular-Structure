import { ISystemActivities } from "../../../shared/models/systemactivitiesrequest";
import { ActivitySource } from "../../../shared/constants";

export interface ISecurityRequest{
    AccountId:number;
    UserName:string;
    Password:string;
    UpdatedUser:string;
    LastPasswordModifiedDate:Date;
    CurrentPasswordExpiryDate:Date;
    ActivitySource:ActivitySource;
    SubSystem:string;
    SystemActivity: ISystemActivities;
    ParentId:number;
    IsActivityRequired: boolean;
}