import { IPaging } from './paging';
export interface IPhoneRequest {

    PhoneId: number;
    CustomerId: number;
    Type: string;
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
    SubSystem: string;
    ActivitySource: string;
    Paging: IPaging;
}