import { IPaging } from './../../../shared/models/paging';
import { ISystemActivities } from './../../../shared/models/systemactivitiesrequest';
export interface IManageRolesRequest {

    RoleName: string,
    UserName: string,
    UserId: number,
    RoleId: number,
    IsActive: boolean,
    CreatedUser: string,
    UpdateddUser: string,
    RoleDescription: string,
    LoginId: number,
    IsExist: boolean,
    IsDelete: boolean,
    ActionCode: string,
    FeaturesCode: string,
    SystemActivity: ISystemActivities,
}

export interface ISearchRolesRequest {
    RoleName: string,
    Paging: IPaging,
    SystemActivity: ISystemActivities,
}
