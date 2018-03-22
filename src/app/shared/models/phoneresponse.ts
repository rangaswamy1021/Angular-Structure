export interface IPhoneResponse {
    Type: string;
    PhoneId: number;
    CustomerId: number;
    PhoneNumber: string;
    IsCommunication: boolean;
    Extension: string;
    UserName: string;
    IsActive: boolean;
    IsActivityRequired: boolean;
    UserId: number;
    LoginId: number;
    CheckBlockList: boolean;
    IsPhoneNumberChanged: boolean;
    IsCreateAccount: boolean;
    Paging: string;
    SubSystem: string;
    ActivitySource: string;
    IsVerified: boolean;
    DayPhone: string;
    EveningPhone: string;
    MobilePhone: string;
    WorkPhone: string;
    Fax: string;
    PhonePreference: string;
    RecordCount:number;
}