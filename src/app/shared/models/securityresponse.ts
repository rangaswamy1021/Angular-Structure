import { ISystemActivities } from "./systemactivitiesrequest";
import { ActivitySource } from "../constants";

export interface ISecurityResponse {
    AccountId:number;
    UserName:string;
    Password:string;
    Pin: string;
    CurrentPasswordExpiryDate:Date;
    UpdatedUser:string;
    UpdatedDate: Date;
    LastLoginDateTime: Date;
    PasswordAttemptsCount: number;
    IsLocked: boolean;
    LastPasswordModifiedDate:Date;
    Question: string;
    Answer: string;
    LoginId: number;
    ActivitySource:ActivitySource;
    SubSystem:string;
    FirstName: string;
    LastName: string;
    EmailId: string;
    AccountStatus: string;
}