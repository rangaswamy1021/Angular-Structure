import { AccountStatus, UserType, CustomerStatus, SourceOfEntry, ActivitySource } from '../../../shared/constants';
import { IAddressRequest } from '../../../shared/models/addressrequest';
import { IPhoneRequest } from '../../../shared/models/phonerequest';
import { IEmailRequest } from '../../../shared/models/emailrequest';

export interface IvendorRequest {
    VendorId: number,
    CompanyName: string,
    CeoName: string,
    WebSite: string,
    AddressType: string,
    Status: string,
    BusinessType: string,
    BusinessNature: string,
    CreditAffordAble: string,
    CreatedUser: string,
    UpdatedUser: string,
    UserTypeId: number,
    UserType: string,
    CustomerStatus: string,
    AccountStatus: string,
    ParentId: number,
    SourceOfEntry: string,
    RevenueCategory: string,
    IsParent: boolean,
    InitiatedBy: string,
    AddressList : IAddressRequest[],
    PhoneList: IPhoneRequest[],
    EmailList: IEmailRequest[],
    TagSupplierId: string,
    VendorUserType: string,
    UserId: number,
    LoginId: number,
    KeyValue: string,
    User: string,
    SearchFlag: string,
    VendorName: string,
    ActivitySource: string,
    PageNumber: number,
    PageSize: number,
    SortColumn: string,
    SortDirection: boolean;
}