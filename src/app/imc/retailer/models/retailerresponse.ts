import { ActivitySource, SubSystem, SourceOfEntry, RevenueCategory, AccountStatus, CustomerStatus, UserType } from "../../../shared/constants";
import { IAddressRequest } from "../../../shared/models/addressrequest";
import { IPhoneRequest } from "../../../shared/models/phonerequest";
import { IEmailRequest } from "../../../shared/models/emailrequest";
import { IPaging } from "../../../shared/models/paging";


export interface IretailerResponse {
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
    MembershipType:string;   //enum
    ParentId: number
    AccountStatus
    SourceOfEntry
    RevenueCategory
    ContactId: number;
    UserName: string;
    Password: string
    RetypePassword: string
    CurrentPasswordExpiryDate :Date;
    SubSystem: SubSystem;
    ActivitySource: ActivitySource;
    AddressList: IAddressRequest[],
    PhoneList: IPhoneRequest[],
    EmailList: IEmailRequest[],
    Paging:IPaging, 
    AccountStatusCode: string;
    IsActivityRequired: number;
    UserId: number;
    LoginId: number;
    SearchFlag: string;
    IsBackToSearch: boolean;
    TotalRecords: number;
    Line1: string,
    Line2: string,
    Line3: string,
    City: string,
    State: string,
    Country: string,
    Zip1: string,
    Zip2: string,
    FullAddress: string,
    PhoneType: string,
    PhoneNumber: string,
    Extension: string,
    EmailAddress: string,
    strIfWorkPhoneExtension: string,
    FullPhoneEmail: string,
    TotalCount: number,
    VendorStatus: number,
    IsCommEmailOne: boolean,
    IsCommEmailTwo: boolean,
    IsCommDayPhone: boolean,
    IsCommEveningPhone: boolean,
    IsCommMobilePhone: boolean,
    IsCommWorkPhone: boolean,
    DayPhoneNumber: string,
    EveningPhoneNumber: string,
    Fax: string,
    MobileNumber: string,
    WorkPhoneNumber: string,
    PrimaryEmailAddress: string,
    SecondaryEmailAddress: string,
    FAddress: string,
    PrimaryEmailId: number,
    SecondaryEmailId: number,
    MobilePhoneId: number,
    DayPhoneId: number,
    EveningPhoneId: number,
    WorkPhoneId: number,
    FaxId: number,
    Comm_Email: string,
    Comm_Phone: string,
    RecordsCount :number;
    InvoiceStatus:string;
    POSRequestId:number;

}