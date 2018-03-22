import { ActivitySource, SubSystem, SourceOfEntry, RevenueCategory, AccountStatus, CustomerStatus, UserType } from "../../../shared/constants";
import { IAddressRequest } from "../../../shared/models/addressrequest";
import { IPhoneRequest } from "../../../shared/models/phonerequest";
import { IEmailRequest } from "../../../shared/models/emailrequest";
import { IPaging } from "../../../shared/models/paging";


export interface IretailerRequest {
    CustomerId: number;
    FirstName: string
    MiddleName: string
    LastName: string
    Gender: string
    Title: string
    Suffix: string
    NameType: string;
    PerformedBy: string
    UserType:UserType;
    CustomerStatus:CustomerStatus;
    MembershipType: string;   //enum
    ParentId: number
    AccountStatus:string;
    SourceOfEntry:string;
    RevenueCategory:string;
    ContactId: number;
    UserName: string;
    Password: string
    RetypePassword: string
    CurrentPasswordExpiryDate: Date;
    SubSystem: string;
    ActivitySource: string;
    AddressList: IAddressRequest[],
    PhoneList: IPhoneRequest[],
    EmailList: IEmailRequest[],
    Paging: IPaging,
    PageNumber: number,
    PageSize: number,
    SortColumn: string,
    SortDirection: boolean;
    AccountStatusCode: string;
    IsActivityRequired: number;
    UserId: number;
    LoginId: number;
    SearchFlag: string;
    IsBackToSearch: boolean;
    TotalRecords: number;
    RecordsCount: number;
    User:string;
    AccountId:number;
   

}
// export interface RetailerLoginRequest {
//     AccountId: number;
//     UserName: string;
//     Password: string;
//     CurrentPasswordExpiryDate: Date;
//     PerformedBy: string;
//     RoleName: string;
//     RetailerLoginId: number;
//     LastLoginDateTime: Date;
//     LastPasswordModifiedDate: Date;
//     EmailAddress: string;
//     IsLocked: boolean;
//     ActivitySource: string;
//     SubSystem: string;
//     PasswordAttemptsCount; number;
//     IsActive: boolean;
//     FirstName: string;
//     LastName: string;
//     CreatedUser: string;
//     CreatedDate: Date;
//     UpdatedUser: string;
//     UpdatedDate: Date;
//     RetypePassword: string;
//     CheckPassword: boolean;
//     OldPassword: string;

// }
// export interface RetailerLoginResponse {
//     AccountId: number;
//     UserName: string;
//     Password: string;
//     CurrentPasswordExpiryDate: Date;
//     PerformedBy: string;
//     RoleName: string;
//     RetailerLoginId: number;
//     LastLoginDateTime: Date;
//     LastPasswordModifiedDate: Date;
//     EmailAddress: string;
//     IsLocked: boolean;
//     ActivitySource: string;
//     SubSystem: string;
//     PasswordAttemptsCount; number;
//     IsActive: boolean;
//     FirstName: string;
//     LastName: string;
//     CreatedUser: string;
//     CreatedDate: Date;
//     UpdatedUser: string;
//     UpdatedDate: Date;
//     RetypePassword: string;
//     CheckPassword: boolean;
//     OldPassword: string;
//     Theme: string;
//     Language: string;
// }
// export interface RetailerUserRequest {
//     RetailerUserId: number;
//     CustomerId: number;
//     RetailerUserName: number;
//     RoleName: string;
//     RetailerLoginId: number;
//     FirstName: string;
//     MiddleName: string;
//     LastName: string;
//     EmailAddress: string;
//     PhoneNumber: string;
//     IsActive: boolean;
//     Status: string;
//     PerformedBy: string;
//     RetailerLoin: RetailerLoginRequest;
//     Paging: IPaging;
//     SubSystem: SubSystem;
//     ActivitySource: ActivitySource;
//     UserId: Number;
//     LoginId: Number;
//     SearchActivity: Boolean;
//     SearchFlag: string;
//     IsEmailCheck: boolean;
//     RoleFlag: number;
// }
// export interface RetailerUserResponse {
//     RetailerUserId: number;
//     CustomerId: number;
//     RetailerUserName: number;
//     RoleName: string;
//     RetailerLoginId: number;
//     FirstName: string;
//     MiddleName: string;
//     LastName: string;
//     EmailAddress: string;
//     PhoneNumber: string;
//     IsActive: boolean;
//     Status: string;
//     PerformedBy: string;
//     RetailerLoin: RetailerLoginRequest;
//     Paging: IPaging;
//     SubSystem: SubSystem;
//     ActivitySource: ActivitySource;
//     UserId: Number;
//     LoginId: Number;
//     SearchActivity: Boolean;
//     SearchFlag: string;
//     IsEmailCheck: boolean;
//     RoleFlag: number;
//     RecordsCount:number;
//     UserType:string;
// }