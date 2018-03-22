import { IPaging } from './paging';
export interface ICSRRelationsResponse {
    InternalUserId: number;
    InternalUserName:string;
    CustomerIds: string;
    TagIds: string;
    VehicleNumbers: string;
    FullName:string;
    CreatedUser: string;
    UpdatedUser:string;
    UserName: string;
    UserId: number;
    LoginId: number;
    Paging:IPaging;
 }