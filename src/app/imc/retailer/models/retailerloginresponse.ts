export interface IRetailerLoginResponse {
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
    PasswordAttemptsCount:number;
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
    Theme: string;
    Language: string;
    MiddleName:string;
    PhoneNumber:number;
    RecordsCount:number;
    RetailerUserId:number;
    RetailerUserName:string;
    Status:string;
    UserType:string;
    CustomerId:number;

}
