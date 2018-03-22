
import { IPhoneRequest } from './../../../shared/models/phonerequest';
import { IEmailRequest } from "../../../shared/models/emailrequest";

export interface ICreateViolatorRequest {
    AccountId: number,
    FirstName: string,
    LastName: string,
    MiddleName: string,
    Gender: string,
    Title: string,
    Suffix: string,
    CreatedUser: string,
    CustomerId: number,
    Line1: string,
    Line2: string,
    Line3: string,
    City: string,
    State: string,
    Country: string,
    Zip1: string,
    Zip2: string,
    IsPreferred: boolean,
    UserName: string,
    IsActive: boolean,
    EmailAddress: string,
    PhoneNumber: string,
    IsCommunication: boolean,
    Extension: string
    UserType: string,//enum
    SubSystem: string,//enum
    ActivitySource: string,//enum
    PhoneType: string,
    AddressType: string,
    EmailType: string,
    CitationCSV: string,
    ICNId: number,
    UserId: number,
    LoginId: number,
    TxnDate: Date,
    NonliabilityReasonCode: string,
    Comments: string,
    PhoneList: IPhoneRequest[],
    EmailList: IEmailRequest[],
    VehicleNumber: string,
    NextScheduleDate: Date,
    StartEffectiveDate: Date,
    EndEffectiveDate: Date,
    DocumentPath:string,
    NonLiabilityReasonCode:string,
    Activitysource:string
}