import { IPaging } from "../../../shared/models/paging";
import { SubSystem, ActivitySource } from "../../../shared/constants";
import { IRetailerLoginResponse } from "./retailerloginresponse";


export interface IRetailerUserResponse {
    RetailerUserId: number;
    CustomerId: number;
    RetailerUserName: string;
    RoleName: string;
    RetailerLoginId: number;
    FirstName: string;
    MiddleName: string;
    LastName: string;
    EmailAddress: string;
    PhoneNumber: string;
    IsActive: boolean;
    Status: string;
    PerformedBy: string;
    RetailerLoin: IRetailerLoginResponse;
    Paging: IPaging;
    SubSystem: SubSystem;
    ActivitySource: ActivitySource;
    UserId: Number;
    LoginId: Number;
    SearchActivity: Boolean;
    SearchFlag: string;
    IsEmailCheck: boolean;
    RoleFlag: number;
    RecordsCount: number;
    UserType: string;
    TotalAmount: number;
}
