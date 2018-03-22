export interface IRetailerLoginRequest {
    AccountId: number;
    UserName: string;
    Password: string;
    CurrentPasswordExpiryDate: Date;
    PerformedBy: string;
    RoleName: string;
    RetailerLoginId: number;
    LastLoginDateTime: Date;
    LastPasswordModifiedDate: Date;
    EmailAddress: string;
    IsLocked: boolean;
    ActivitySource: string;
    SubSystem: string;
    PasswordAttemptsCount: number;
    IsActive: boolean;
    FirstName: string;
    LastName: string;
    CreatedUser: string;
    CreatedDate: Date;
    UpdatedUser: string;
    UpdatedDate: Date;
    RetypePassword: string;
    CheckPassword: boolean;
    OldPassword: string;
    LoginInfo: IRetailerLoginInfoRequest;
}
export interface IRetailerLoginInfoRequest {
   IPAddress:string;
   MachineName:string;
   MACAddress:string;
   Application:string;
   UserName:string;
   PasswordAttemptsCount:number;
   UrlRefferer:string;
   BrowserDetails:string;
   RequestedUrl:string;
   OutCome:string;
   PerformedBy:string;
   LogIn:Date;
   LogInType:string; 
}
export interface IRetailerLoginInfoResponse {
   IPAddress:string;
   MachineName:string;
   MACAddress:string;
   Application:string;
   UserName:string;
   PasswordAttemptsCount:number;
   UrlRefferer:string;
   BrowserDetails:string;
   RequestedUrl:string;
   OutCome:string;
   PerformedBy:string;
   LogIn:Date;
   LogInType:string; 
}