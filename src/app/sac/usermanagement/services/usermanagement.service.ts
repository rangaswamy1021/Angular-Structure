import { IUserEvents } from './../../../shared/models/userevents';
import { IPaging } from './../../../shared/models/paging';
import { IManageUserResponse } from './../models/manageuser.response';
import { IManageUserRequest } from './../models/manageuser.request';
import { Observable } from 'rxjs';
import { ICSRRelationsResponse } from './../../../shared/models/csrrelationsresponse';
import { ICSRRelationsRequest } from './../../../shared/models/csrrelationsrequest';
import { IManageRolesResponse } from './../models/rolesresponse';
import { ISearchRolesRequest, IManageRolesRequest } from './../models/rolesrequest';
import { Injectable } from '@angular/core';
import { HttpService } from '../../../shared/services/http.service';
import { IManageTransactionTypesRequest } from '../models/managetransactiontypesrequest';
import { ISystemActivities } from "../../../shared/models/systemactivitiesrequest";
import { SiteHirerachyResponse } from "../models/sitehirerachyreponse";
import { IPrivilegeWrapper } from '../models/privilegesresponse';
import { IOperationalLocationsRequest } from "../models/operationallocationsrequest";
import { IOperationalLocationsResponse } from "../models/operationallocationsresponse";

@Injectable()
export class UserManagementService {
    constructor(private http: HttpService) { }
    private userManagementUrl = 'UserManagement/';

    getSiteHirerachy(systemActivities: ISystemActivities,userevents ?:IUserEvents): Observable<SiteHirerachyResponse[]> {
        return this.http.postHttpMethod(this.userManagementUrl + 'GetSiteHirerachy', JSON.stringify(systemActivities),userevents);
    }
    getTxnTypes(): Observable<any> {
        return this.http.getHttpWithoutParams(this.userManagementUrl + 'GetTxnTypes/');
    }

    getTxnTypesByRoleId(roleId: number): Observable<any> {
        return this.http.postHttpMethod(this.userManagementUrl + 'GetTxnTypesByRoleId', roleId);
    }

    insertTransactionTypes(objRequestManageTxnType: IManageTransactionTypesRequest, userEvents: IUserEvents): Observable<boolean> {
        return this.http.postHttpMethod(this.userManagementUrl + 'InsertTransactionTypes', objRequestManageTxnType, userEvents);
    }

    SearchRoles(searchRoleReq: ISearchRolesRequest, userEvents: IUserEvents): Observable<IManageRolesResponse[]> {
        return this.http.postHttpMethod(this.userManagementUrl + 'SearchRoles', searchRoleReq, userEvents);
    }

    GetRoles(searchRoleReq: ISearchRolesRequest, userEvents: IUserEvents): Observable<IManageRolesResponse[]> {
        return this.http.postHttpMethod(this.userManagementUrl + 'GetRoles', searchRoleReq, userEvents);
    }

    createRoles(createRoleReq: IManageRolesRequest, userEvents: IUserEvents): Observable<boolean> {
        return this.http.postHttpMethod(this.userManagementUrl + 'CreateRoles', JSON.stringify(createRoleReq), userEvents);
    }

    updateRoles(updateRoleReq: IManageRolesRequest, userEvents: IUserEvents): Observable<boolean> {
        return this.http.putHttpMethod(this.userManagementUrl + 'UpdateRoles', JSON.stringify(updateRoleReq), userEvents);
    }

    checkIsExistRoleName(strRoleName: string): Observable<boolean> {
        return this.http.postHttpMethod(this.userManagementUrl + 'IsExistRoleName', JSON.stringify(strRoleName));
    }
    getInternalUsers(): Observable<any> {
        return this.http.getHttpWithoutParams(this.userManagementUrl + 'GetInternalUsers/');
    }


    bindUsers(objUsers: IManageUserRequest, paging: IPaging, userEvents: IUserEvents): Observable<IManageUserResponse[]> {
        var obj = { 'objUsers': objUsers, 'paging': paging }
        return this.http.postHttpMethod(this.userManagementUrl + 'BindUsers', obj, userEvents);
    }

    bindSubSytemUrsByRoleName(rolename: string): Observable<IManageUserResponse[]> {
        var obj = { 'rolename': rolename }
        return this.http.postHttpMethod(this.userManagementUrl + 'GetSubsystemsandUrlsbyRoleName', JSON.stringify(obj));
    }
    bindLevels(): Observable<string> {
        //var obj = { 'rolename':rolename }
        return this.http.getHttpWithoutParams(this.userManagementUrl + 'GetLevels');
    }

    addUser(reqUser: IManageUserRequest, reqUserList: IManageUserRequest[],userEvents?:IUserEvents): Observable<number> {
        var obj = { 'objUsers': reqUser, 'objUsersList': reqUserList }
        return this.http.postHttpMethod(this.userManagementUrl + 'AddUser', JSON.stringify(obj),userEvents);
    }
    getLocations(reqUser: IManageUserRequest): Observable<IManageUserResponse[]> {
        return this.http.postHttpMethod(this.userManagementUrl + 'GetLocations',JSON.stringify(reqUser));
    }
    deactivateUser(userReq: IManageUserRequest, userEvents?: IUserEvents): Observable<boolean> {
        var obj = { 'objUsers': userReq }
        return this.http.postHttpMethod(this.userManagementUrl + 'DeactivateUser', JSON.stringify(obj),userEvents);
    }

    resetPassWord(userReq: IManageUserRequest, userEvents?: IUserEvents): Observable<boolean> {
        var obj = { 'objUsers': userReq }
        return this.http.postHttpMethod(this.userManagementUrl + 'ResetPassword', JSON.stringify(obj),userEvents);

    }

    getCustomerProfile(uesrId: number, systemActivities: ISystemActivities): Observable<IManageUserResponse> {
        var obj = { 'userId': uesrId, 'systemActivities': systemActivities }
        return this.http.postHttpMethod(this.userManagementUrl + 'GetProfileByAccountId', JSON.stringify(obj));
    }

    getSubSystemsAndUrlsbyUserId(uesrId: number): Observable<IManageUserResponse[]> {
        var obj = { 'userId': uesrId }
        return this.http.postHttpMethod(this.userManagementUrl + 'GetSubSystemsAndUrlsbyUserId', JSON.stringify(obj));
    }

    getLevelsByUserId(uesrId: number): Observable<IManageUserResponse[]> {
        var obj = { 'userId': uesrId }
        return this.http.postHttpMethod(this.userManagementUrl + 'GetLevelsByUserId', JSON.stringify(obj));
    }

    updateUser(reqUser: IManageUserRequest, reqUserList: IManageUserRequest[], userEvents?: IUserEvents): Observable<IManageUserResponse[]> {
        var obj = { 'objUsers': reqUser, 'objUsersList': reqUserList }
        return this.http.postHttpMethod(this.userManagementUrl + 'UpdateUser', JSON.stringify(obj),userEvents);
    }
    addCsrRelation(addCsrReq: ICSRRelationsRequest, userEvents?: IUserEvents): Observable<boolean> {
        return this.http.postHttpMethod(this.userManagementUrl + 'AddCsrRelation', JSON.stringify(addCsrReq), userEvents);
    }
    getCsrRelation(getCsrReq: ICSRRelationsRequest, userEvents?: IUserEvents): Observable<ICSRRelationsResponse[]> {
        return this.http.postHttpMethod(this.userManagementUrl + 'GetCsrRelation', JSON.stringify(getCsrReq), userEvents);
    }
    updateCsrRelation(updateCsrReq: ICSRRelationsRequest, userEvents?: IUserEvents): Observable<boolean> {
        return this.http.putHttpMethod(this.userManagementUrl + 'UpdateCsrRelation', JSON.stringify(updateCsrReq), userEvents);
    }
    deleteCsrRelation(deleteCsrReq: ICSRRelationsRequest, userEvents?: IUserEvents): Observable<boolean> {
        return this.http.putHttpMethod(this.userManagementUrl + 'DeleteCsrRelation', JSON.stringify(deleteCsrReq), userEvents);
    }

    getSiteHierarchybyRoleId(roleId): Observable<SiteHirerachyResponse[]> {
        return this.http.postHttpMethod(this.userManagementUrl + 'GetSiteHierarchyByRoleId', JSON.stringify(roleId));
    }

    CreateWebPages(roleId, siteHierarchyReq, userEvents): Observable<boolean> {
        var obj = { 'roleId': roleId, 'siteHierarchyReq': siteHierarchyReq, }
        return this.http.postHttpMethod(this.userManagementUrl + 'CreateWebPages', JSON.stringify(obj), userEvents);
    }

    createPrivileges(privilegeWrapper: IPrivilegeWrapper[], userEvents?: IUserEvents) {
        return this.http.postHttpMethod(this.userManagementUrl + 'CreatePrivileges', privilegeWrapper, userEvents);
    }

    getPrivilegesbyRole(systemActivities: ISystemActivities): Observable<IPrivilegeWrapper[]> {
        return this.http.postHttpMethod(this.userManagementUrl + 'GetPrivilegesbyRole', systemActivities);
    }



    getAllRoles(systemActivities: ISystemActivities, userEvents?: IUserEvents): Observable<IManageRolesResponse[]> {
        return this.http.postHttpMethod(this.userManagementUrl + 'GetAllRoles', systemActivities, userEvents);
    }

    unlock(sysActivity: ISystemActivities, userEvents?: IUserEvents): Observable<boolean> {
        var obj = { 'SystemActivity': sysActivity }
        return this.http.postHttpMethod(this.userManagementUrl + 'Unlock', JSON.stringify(obj), userEvents);
    }

    verifyUser(userName: string) {
        var obj = { 'userName': userName }
        return this.http.postHttpMethod(this.userManagementUrl + 'VerifyUser', JSON.stringify(obj));
    }

     GetOperationalLocations(objRequestLocation: IOperationalLocationsRequest, userEvents: IUserEvents): Observable<IOperationalLocationsResponse[]> {
        return this.http.postHttpMethod(this.userManagementUrl + 'GetOperationalLocations', objRequestLocation, userEvents);
    }

    CreateOperationalLocation(objRequestLocation: IOperationalLocationsRequest, userEvents: IUserEvents): Observable<number> {
        return this.http.postHttpMethod(this.userManagementUrl + 'CreateOperationalLocation', JSON.stringify(objRequestLocation), userEvents);
    }

    UpdateOperationalLocation(objRequestLocation: IOperationalLocationsRequest, userEvents: IUserEvents): Observable<boolean> {
        return this.http.postHttpMethod(this.userManagementUrl + 'UpdateOperationalLocation', JSON.stringify(objRequestLocation), userEvents);
    }

    verifyEmailExist(txtEmail:string):Observable<boolean>
    {
        return this.http.postHttpMethod(this.userManagementUrl + 'VerifyEmailExist',JSON.stringify(txtEmail));
    }

}