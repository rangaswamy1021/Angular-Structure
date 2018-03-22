import { fail } from 'assert';
import { IUserEvents } from './../../shared/models/userevents';
import { debug } from 'util';
import { CommonService } from './../../shared/services/common.service';
import { ActivitySource, CustomerStatus, SubSystem, Features, Actions } from './../../shared/constants';
import { ISystemActivities } from './../../shared/models/systemactivitiesrequest';
import { IManageUserResponse } from './models/manageuser.response';
import { Router } from '@angular/router';
import { UserManagementService } from './services/usermanagement.service';
import { SessionService } from './../../shared/services/session.service';
import { IManageUserRequest } from './models/manageuser.request';
import { IUserresponse } from './../../shared/models/userresponse';
import { IPaging } from './../../shared/models/paging';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, NgForm, FormArray, FormsModule } from '@angular/forms';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MaterialscriptService } from "../../shared/materialscript.service";
declare var $: any;
@Component({
    selector: 'app-manage-users',
    templateUrl: './manage-users.component.html',
    styleUrls: ['./manage-users.component.scss']
})
export class ManageUsersComponent implements OnInit {
    gridArrowUserRole: boolean;
    gridArrowIsActive: boolean;
    gridArrowIsLocked: boolean;
    gridArrowEmail: boolean;
    sortingColumn: any;
    sortingDirection: boolean;
    gridArrowUSERNAME: boolean;
    ddlSearchLocation: any;
    paging: IPaging;
    locationResponse: IManageUserResponse[];
    locationsRequest: IManageUserRequest;
    userRequest: IManageUserRequest = <IManageUserRequest>{};
    addSubsytem: IManageUserRequest[] = [];
    userResponse: IManageUserResponse[] = [];
    subSystemUrls: IManageUserResponse[] = [];

    urls = [];
    levels: string;
    sessionContextResponse: IUserresponse;
    isEnableAddDiv: boolean = false;
    isUpdateEnable: boolean = false;
    isEnableSubSystem: boolean = false;
    roles = [];
    ddlRole: string = "";
    txtUserName: string;
    ddlStatus: string = "";
    txtEmail: string;
    txtAddUname: string;
    txtaddFname: string;
    txtAddLname: string;
    txtAddEmail: string;
    emailCheck: string;
    ddlAddRoles: string = "";
    ddlAddLocation: string = "";
    ddlAddLeveL: string = "";
    chkAddStatus: string;
    chkAddDomain: string;
    accId: number;
    isError: boolean = false;
    errorMessage: string;
    isSuccess: boolean = false;
    successMessage: string = "";
    isEnableAddbtn: boolean = true;
    userId: number;
    uNameCheck: string;
    pageHeading: string = "Add New User";
    isActiveCheck: boolean = false;
    userForm: FormGroup;
    objConfirm: any;
    objConfirmUnlock: any;
    objConfirmReset: any;
    isUserExist: boolean = false;
    msgFlag: boolean = false;
    msgType: string = "";
    msgDesc: string = "";
    msgTitle: string = "";
    msgFlagReset: boolean = false;
    msgTypeReset: string = "";
    msgDescReset: string = "";
    msgTitleReset: string = "";
    msgFlagDeactive: boolean = false;
    msgTypeDeactive: string = "";
    msgDescDeactive: string = "";
    msgTitleDeactive: string = "";
    isInValidSearch: boolean = false;
    validateEmailPattern = "^[A-Za-z0-9]([_\\.\\-\\+]?[a-zA-Z0-9])*@([A-Za-z0-9]+)([\\.\\-]?[a-zA-Z0-9])*\\.([A-Za-z]{2,6})$";
    @ViewChild('searchForm') public searchForm: NgForm;
    @ViewChild('addForm') public addForm: NgForm;
    constructor(private sessionContext: SessionService, private router: Router, private manageUserService: UserManagementService,
        private commonService: CommonService, private materialscriptService: MaterialscriptService) { }
    p: number = 1;
    pageItemNumber: number = 10;
    dataLength: number;
    startItemNumber: number = 1;
    endItemNumber: number;
    istxtAddRequired: boolean = false;
    isEdit: boolean = false;
    isUserSearch: boolean;
    disableAddButton: boolean;
    disableUpdateButton: boolean;
    disableDeleteButton: boolean;
    disableResetPwd: boolean;
    disableUnlock: boolean;
    pageChanged(event) {
        this.p = event;
        this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
        this.endItemNumber = ((this.p) * this.pageItemNumber);
        if (this.endItemNumber > this.dataLength)
            this.endItemNumber = this.dataLength;
    }
    userAction(event) {
        if (event) {
            this.unlock();
        }
    }
    userActionReset(event) {
        if (event) {
            this.resetPass();
        }
    }

    userActionDeactive(event) {
        if (event) {
            this.deactivateUser();
        }
    }

    ngOnInit() {
        this.gridArrowUSERNAME = true;
        this.materialscriptService.material();
        this.sessionContextResponse = this.sessionContext.customerContext;
        if (this.sessionContextResponse == null) {
            let link = ['/'];
            this.router.navigate(link);
        }
        this.bindUsers(Actions[Actions.VIEW]);
        this.getRoles();
        this.getLocations();
        this.ddlSearchLocation = "";
        this.isUserSearch = !this.commonService.isAllowed(Features[Features.USERS], Actions[Actions.SEARCH], "")
        this.disableAddButton = !this.commonService.isAllowed(Features[Features.USERS], Actions[Actions.CREATE], "");
        this.disableUpdateButton = !this.commonService.isAllowed(Features[Features.USERS], Actions[Actions.UPDATE], "");
        this.disableDeleteButton = !this.commonService.isAllowed(Features[Features.USERS], Actions[Actions.DELETE], "");
        this.disableResetPwd = !this.commonService.isAllowed(Features[Features.USERS], Actions[Actions.RESETPASSWORD], "");
        this.disableUnlock = !this.commonService.isAllowed(Features[Features.USERS], Actions[Actions.UNLOCK], "");
    }

    bindUsers(userEventsActionName: string) {
        //;
        let paging: IPaging = <IPaging>{};
        paging.PageNumber = 1;
        paging.PageSize = 100;
        // paging.SortColumn = "UserName";
        paging.SortColumn = this.sortingColumn;
        paging.SortDir = this.sortingDirection == false ? 1 : 0;
        this.userRequest.IsSearch = false;
        this.userRequest.IsViewed = true;
        this.userRequest.LoginId = this.sessionContextResponse.loginId;
        this.userRequest.UserId = this.sessionContextResponse.userId;
        if (userEventsActionName == Actions[Actions.VIEW]) {
            this.userRequest.LocationCode = '';
        }
        let userEvents: IUserEvents;
        if (userEventsActionName) {
            userEvents = <IUserEvents>{};
            userEvents.FeatureName = Features[Features.USERS];
            userEvents.ActionName = userEventsActionName;
            userEvents.PageName = this.router.url;
            userEvents.CustomerId = 0;
            userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
            userEvents.UserName = this.sessionContextResponse.userName;
            userEvents.LoginId = this.sessionContextResponse.loginId;
        }
        this.manageUserService.bindUsers(this.userRequest, paging, userEvents).subscribe(
            res => {
                this.userResponse = res;
                if (this.userResponse != null) {
                    this.dataLength = this.userResponse.length;
                    if (this.dataLength < this.pageItemNumber) {
                        this.endItemNumber = this.dataLength
                    }
                    else {
                        this.endItemNumber = this.pageItemNumber;
                    }
                }
            }
        );
    }

    search() {
        if ((this.txtEmail == null || this.txtEmail == '') && (this.txtUserName == null || this.txtUserName == '')
            && (this.ddlRole == null || this.ddlRole == '' || this.ddlRole == undefined)
            && (this.ddlSearchLocation == null || this.ddlSearchLocation == '' || this.ddlSearchLocation == undefined)
            && (this.ddlStatus == null || this.ddlStatus == '' || this.ddlStatus == undefined)) {
            this.isInValidSearch = true;
            return;
        }
        this.isInValidSearch = false;
        if (this.txtEmail != null && this.txtEmail != '') {
            this.userRequest.Email = this.txtEmail;
        }
        if (this.txtUserName != null && this.txtUserName != '') {
            this.userRequest.UserName = this.txtUserName;
        }
        if (this.ddlRole != null && this.ddlRole != '' && this.ddlRole != undefined) {
            this.userRequest.RoleName = this.ddlRole;
        }
        if (this.ddlSearchLocation != null && this.ddlSearchLocation != '' && this.ddlSearchLocation != undefined) {
            let locationCode = this.locationResponse.filter(item => item.LocationName == this.ddlSearchLocation)[0].LocationCode;
            this.userRequest.LocationCode = locationCode;
        }
        if (this.ddlStatus != null && this.ddlStatus != '' && this.ddlStatus != undefined) {
            if (this.ddlStatus == "Active") {
                this.userRequest.Active = "1";
            }
            else {
                this.userRequest.Active = "0";
            }
        }
        this.bindUsers(Actions[Actions.SEARCH]);
    }

    verifyUser() {
        this.isUserExist = false;
        this.isError = false;
        this.errorMessage = '';
        this.manageUserService.verifyUser(this.txtAddUname).subscribe(
            res => {
                if (res) {
                    this.isUserExist = true;
                    this.msgFlag = true;
                    this.msgType = 'error';
                    this.msgTitle = '';
                    this.msgDesc = 'UserName Already Exist';
                }
            })
    }
    getRoles() {
        this.commonService.getRoles(this.setSystemActivities()).subscribe(res => {
            this.roles = res;
        })
    }
    getLocations() {
        this.locationsRequest = <IManageUserRequest>{};
        this.locationsRequest.LocationCode = '';
        this.locationsRequest.LocationName = '';
        this.locationsRequest.SortColumn = 'LOCATIONCODE';
        this.locationsRequest.SortDir = 1;
        this.locationsRequest.PageNumber = 1;
        this.locationsRequest.PageSize = 100;
        this.manageUserService.getLocations(this.locationsRequest).subscribe(res => {
            this.locationResponse = res;
            console.log(this.locationResponse)
        })
    }
    approveUnlock(selectedRow) {
        this.objConfirmUnlock = selectedRow;
        this.msgFlag = true;
        this.msgType = 'alert';
        this.msgDesc = 'Are you sure you want to Unlock the User ?';
    }
    unlock() {
        var systemActivities = <ISystemActivities>{};
        systemActivities.UserId = this.sessionContextResponse.userId;
        systemActivities.LoginId = this.sessionContextResponse.loginId;
        systemActivities.User = this.sessionContextResponse.userName;
        systemActivities.ActionCode = "UNLOCK";
        systemActivities.FeaturesCode = "USERS";
        systemActivities.IsViewed = false;
        systemActivities.ActivitySource = ActivitySource[ActivitySource.Internal];
        systemActivities.CustomerId = this.objConfirmUnlock.UserId;
        let userEvents: IUserEvents;
        userEvents = <IUserEvents>{};
        userEvents.FeatureName = Features[Features.USERS];
        userEvents.ActionName = Actions[Actions.UNLOCK];
        userEvents.PageName = this.router.url;
        userEvents.CustomerId = 0;
        userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
        userEvents.UserName = this.sessionContextResponse.userName;
        userEvents.LoginId = this.sessionContextResponse.loginId;
        this.manageUserService.unlock(systemActivities, userEvents).subscribe(
            res => {
                if (res) {
                    this.msgFlag = true;
                    this.msgType = 'success';
                    this.msgTitle = '';
                    this.msgDesc = 'User account has been unlocked successfully';
                    this.bindUsers(Actions[Actions.VIEW]);
                }

            },
            err => {
                console.log(err);
                this.msgFlag = true;
                this.msgType = 'error';
                this.msgTitle = '';
                this.msgDesc = err.statusText;
            })
    }
    approveReset(selectedRow) {
        this.objConfirmUnlock = selectedRow;
        this.msgFlagReset = true;
        this.msgTypeReset = 'alert';
        this.msgTitleReset = '';
        this.msgDescReset = 'Are you sure you want to reset the password for this user ?';
    }
    resetPass() {
        let userReq = <IManageUserRequest>{};
        userReq.IsActive = userReq.IsDomain = false;
        userReq.CreatedUser = this.sessionContextResponse.userName;
        userReq.UpdatedUser = this.sessionContextResponse.userName;
        userReq.UserName = this.objConfirmUnlock.UserName;
        userReq.Email = this.objConfirmUnlock.Email;
        userReq.UserId = this.objConfirmUnlock.UserId;
        var systemActivities = <ISystemActivities>{};
        userReq.UserId = this.sessionContextResponse.userId;
        systemActivities.LoginId = this.sessionContextResponse.loginId;
        systemActivities.User = this.sessionContextResponse.userName;
        systemActivities.ActionCode = "RESETPASSWORD";
        systemActivities.FeaturesCode = "USERS";
        systemActivities.IsViewed = false;
        systemActivities.ActivitySource = ActivitySource[ActivitySource.Internal];
        userReq.SystemActivity = systemActivities
        let userEvents: IUserEvents;
        userEvents = <IUserEvents>{};
        userEvents.FeatureName = Features[Features.USERS];
        userEvents.ActionName = Actions[Actions.RESETPASSWORD];
        userEvents.PageName = this.router.url;
        userEvents.CustomerId = 0;
        userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
        userEvents.UserName = this.sessionContextResponse.userName;
        userEvents.LoginId = this.sessionContextResponse.loginId;
        this.manageUserService.resetPassWord(userReq, userEvents).subscribe(
            res => {
                this.msgFlag = true;
                this.msgType = 'success';
                this.msgTitle = '';
                this.msgDesc = 'Password has been reset successfully';
            },
            err => {
                console.log(err);
                this.msgFlag = true;
                this.msgType = 'error';
                this.msgTitle = '';
                this.msgDesc = err.statusText;
            })
    }

    approveDiactivate(selectedRow) {
        this.objConfirm = selectedRow;
        this.msgFlagDeactive = true;
        this.msgTypeDeactive = 'alert';
        this.msgTitleDeactive = '';
        this.msgDescDeactive = 'Are you sure you want to deactivate the User ?';
    }

    deactivateUser() {
        let userReq = <IManageUserRequest>{};
        userReq.IsActive = userReq.IsDomain = false;
        userReq.CreatedUser = this.sessionContextResponse.userName;
        userReq.UpdatedUser = this.sessionContextResponse.userName;
        userReq.UserName = this.objConfirm.UserName;
        userReq.Email = this.objConfirm.Email;
        userReq.UserId = this.objConfirm.UserId;
        let locationCode = this.locationResponse.filter(item => item.LocationName == this.objConfirm.LocationName)[0].LocationCode;
        userReq.LocationCode = locationCode;
        var systemActivities = <ISystemActivities>{};
        systemActivities.LoginId = this.sessionContextResponse.loginId;
        systemActivities.User = this.sessionContextResponse.userName;
        systemActivities.ActionCode = "VIEW";
        systemActivities.FeaturesCode = "USERS";
        systemActivities.IsViewed = false;
        systemActivities.ActivitySource = ActivitySource[ActivitySource.Internal];
        userReq.SystemActivity = systemActivities;
        let userEvents: IUserEvents;
        userEvents = <IUserEvents>{};
        userEvents.FeatureName = Features[Features.USERS];
        userEvents.ActionName = Actions[Actions.DELETE];
        userEvents.PageName = this.router.url;
        userEvents.CustomerId = 0;
        userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
        userEvents.UserName = this.sessionContextResponse.userName;
        userEvents.LoginId = this.sessionContextResponse.loginId;
        this.manageUserService.deactivateUser(userReq, userEvents).subscribe(
            res => {
                if (res) {
                    this.bindUsers(Actions[Actions.VIEW]);
                    this.msgFlag = true;
                    this.msgType = 'success';
                    this.msgTitle = '';
                    this.msgDesc = 'User account has been deactivated successfully';
                }
            },
            err => {
                console.log(err);
                this.msgFlag = true;
                this.msgType = 'error';
                this.msgDesc = err.statusText;
            })
    }
    updateUser() {
        if (!this.addForm.valid) {
            this.validateAllFormFields(this.addForm);
            return;
        }
        if (this.isUserExist) {
            this.msgFlag = true;
            this.msgType = 'error';
            this.msgTitle = '';
            this.msgDesc = 'UserName Already Exist';
            return;
        }
        let email = this.txtAddEmail;
        if (this.emailCheck != this.txtAddEmail) {
            this.manageUserService.verifyEmailExist(email).subscribe(res => {
                if (res) {
                    this.msgFlag = true;
                    this.msgType = 'error';
                    this.msgTitle = '';
                    this.msgDesc = 'Email Already Exist';
                    return;
                }
                else
                {
                    let userReq = <IManageUserRequest>{};
        userReq.UserId = this.userId;
        userReq.CreatedUser = this.sessionContextResponse.userName;
        userReq.UpdatedUser = this.sessionContextResponse.userName;
        userReq.LoginId = this.sessionContextResponse.loginId;
        userReq.Email = this.txtAddEmail;
        userReq.IsActive = this.isActiveCheck;
        userReq.RoleName = this.ddlAddRoles;
        let locationCode = this.locationResponse.filter(item => item.LocationName == this.ddlAddLocation)[0].LocationCode;
        userReq.LocationCode = locationCode;
        userReq.IsPrimary = true;
        userReq.UserName = this.txtAddUname;
        userReq.FirstName = this.txtaddFname;
        userReq.LastName = this.txtAddLname;
        userReq.IsDomain = false;
        if (this.txtAddUname.toUpperCase() == this.uNameCheck.toUpperCase()) {
            userReq.IsExist = true;
        }
        else
            userReq.IsExist = false;
        this.addSubsytem.forEach(
            x => x.RoleName = this.ddlAddRoles)
        let userEvents: IUserEvents;
        userEvents = <IUserEvents>{};
        userEvents.FeatureName = Features[Features.USERS];
        userEvents.ActionName = Actions[Actions.UPDATE];
        userEvents.PageName = this.router.url;
        userEvents.CustomerId = 0;
        userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
        userEvents.UserName = this.sessionContextResponse.userName;
        userEvents.LoginId = this.sessionContextResponse.loginId;
        $('#pageloader').modal('show');
        this.manageUserService.updateUser(userReq, this.addSubsytem, userEvents).subscribe(
            res => {
                if (res) {
                    this.getRoles();
                    console.log(this.addSubsytem);
                    this.cancel();
                    this.msgFlag = true;
                    this.msgType = 'success';
                    this.msgTitle = '';
                    this.msgDesc = 'User account has been updated successfully';
                }
            },
            err => {
                console.log(err);
                this.msgFlag = true;
                this.msgType = 'error';
                this.msgTitle = '';
                this.msgDesc = err.statusText;
            }
        );
        $('#pageloader').modal('hide');
                }
            }, err => {
                console.log(err);
                this.msgFlag = true;
                this.msgType = 'error';
                this.msgDesc = err.statusText;
            }
            );
        }
        else {
            let userReq = <IManageUserRequest>{};
            userReq.UserId = this.userId;
            userReq.CreatedUser = this.sessionContextResponse.userName;
            userReq.UpdatedUser = this.sessionContextResponse.userName;
            userReq.LoginId = this.sessionContextResponse.loginId;
            userReq.Email = this.txtAddEmail;
            userReq.IsActive = this.isActiveCheck;
            userReq.RoleName = this.ddlAddRoles;
            let locationCode = this.locationResponse.filter(item => item.LocationName == this.ddlAddLocation)[0].LocationCode;
            userReq.LocationCode = locationCode;
            userReq.IsPrimary = true;
            userReq.UserName = this.txtAddUname;
            userReq.FirstName = this.txtaddFname;
            userReq.LastName = this.txtAddLname;
            userReq.IsDomain = false;
            if (this.txtAddUname.toUpperCase() == this.uNameCheck.toUpperCase()) {
                userReq.IsExist = true;
            }
            else
                userReq.IsExist = false;
            this.addSubsytem.forEach(
                x => x.RoleName = this.ddlAddRoles)
            let userEvents: IUserEvents;
            userEvents = <IUserEvents>{};
            userEvents.FeatureName = Features[Features.USERS];
            userEvents.ActionName = Actions[Actions.UPDATE];
            userEvents.PageName = this.router.url;
            userEvents.CustomerId = 0;
            userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
            userEvents.UserName = this.sessionContextResponse.userName;
            userEvents.LoginId = this.sessionContextResponse.loginId;
            $('#pageloader').modal('show');
            this.manageUserService.updateUser(userReq, this.addSubsytem, userEvents).subscribe(
                res => {
                    if (res) {
                        this.getRoles();
                        console.log(this.addSubsytem);
                        this.cancel();
                        this.msgFlag = true;
                        this.msgType = 'success';
                        this.msgTitle = '';
                        this.msgDesc = 'User account has been updated successfully';
                    }
                },
                err => {
                    console.log(err);
                    this.msgFlag = true;
                    this.msgType = 'error';
                    this.msgTitle = '';
                    this.msgDesc = err.statusText;
                }
            );
            $('#pageloader').modal('hide');
        }

    }

    getDetails() {
        var systemActivities = <ISystemActivities>{};
        systemActivities.LoginId = this.sessionContextResponse.loginId;
        systemActivities.User = this.sessionContextResponse.userName;
        systemActivities.ActionCode = "VIEW";
        systemActivities.FeaturesCode = "USERS";
        systemActivities.IsViewed = false;
        systemActivities.ActivitySource = ActivitySource[ActivitySource.Internal];
        this.manageUserService.getCustomerProfile(this.userId, systemActivities).subscribe(
            res => {
                this.txtaddFname = res.FirstName;
                this.txtAddLname = res.LastName;
                let rootSele = this;
                setTimeout(function () {
                    rootSele.materialscriptService.material();
                }, 0)
            }

        )

        this.manageUserService.getSubSystemsAndUrlsbyUserId(this.userId).subscribe(
            res => {
                var result = res;
                for (var i = 0; i < result.length; i++) {
                    if (this.subSystemUrls.filter(x => x.SubSystems.toUpperCase() == result[i].SubSystems.toUpperCase()).length > 0) {
                        this.subSystemUrls.filter(x => x.SubSystems.toUpperCase() == result[i].SubSystems.toUpperCase())[0].IsDefault = result[i].IsDefault;
                        this.subSystemUrls.filter(x => x.SubSystems.toUpperCase() == result[i].SubSystems.toUpperCase())[0].url = result[i].SubSystemURL;
                        this.storeSubSystemValue(result[i].SubSystemURL, result[i].SubSystems);
                        this.storeDefault(result[i].IsDefault, result[i].SubSystems);
                    }
                }
            }
        )
        this.manageUserService.getLevelsByUserId(this.userId).subscribe(
            res => {
                var result = res;
                for (var i = 0; i < result.length; i++) {
                    if (this.subSystemUrls.filter(x => x.SubSystems.toUpperCase() == result[i].SubsystemName.toUpperCase()).length > 0) {
                        this.subSystemUrls.filter(x => x.SubSystems.toUpperCase() == result[i].SubsystemName.toUpperCase())[0].DesignationLevels = result[i].DesignationLevels;
                        this.storeLevles(result[i].DesignationLevels, result[i].SubsystemName);
                    }
                }
            }
        )
    }

    editUser(user: IManageUserResponse) {
        this.materialscriptService.material();
        this.pageHeading = "Update User";
        this.emailCheck = this.txtAddEmail = user.Email;
        this.txtAddUname = this.uNameCheck = user.UserName;
        this.ddlAddRoles = user.RoleName;
        this.ddlAddLocation = user.LocationName;
        this.userId = user.UserId;
        this.isActiveCheck = user.IsActive ? true : false;
        this.isEnableAddbtn = false;
        this.isEnableAddDiv = true;
        this.isUpdateEnable = true;
        this.isEdit = true;
        this.getSubSytemUrls(this.ddlAddRoles);
        let rootSele = this;

    }
    getURL(url: string) {
        return url.split(',');
    }

    storeStatus(status) {
        this.isActiveCheck = status;
    }

    storeDefault(deflt, subSystem) {
        this.addSubsytem.forEach(
            x => {
                x.IsDefault = false;
            })
        this.addSubsytem.filter(x => x.SubSystems == subSystem)[0].IsDefault = deflt;
    }

    storeLevles(level, subSystem) {
        this.addSubsytem.filter(x => x.SubSystems == subSystem)[0].DesignationLevels = level;
    }

    storeSubSystemValue(url, subSytem) {
        this.addSubsytem.filter(x => x.SubSystems == subSytem)[0].SubSystemURL = url;
    }

    getSubSytemUrls(roleName) {
        this.materialscriptService.material();
        if (roleName != "") {
            this.isEnableSubSystem = true;
            this.materialscriptService.material();
        }
        else {
            this.isEnableSubSystem = false;
            this.materialscriptService.material();
            return;

        }

        this.manageUserService.bindSubSytemUrsByRoleName(roleName).subscribe(
            res => {
                this.subSystemUrls = res;
                var i = 1;
                if (this.subSystemUrls && this.subSystemUrls.length > 0) {
                    this.subSystemUrls[0].IsDefault = true;
                    this.addSubsytem = [];
                    this.subSystemUrls.forEach(
                        x => {
                            x.url = "";
                            x.DesignationLevels = "";
                            var req = <IManageUserRequest>{};
                            req.SubSystemURL = "";
                            req.DesignationLevels = "";
                            req.IsDefault = x.IsDefault;
                            req.CreatedUser = this.sessionContextResponse.userName;
                            req.UpdatedUser = this.sessionContextResponse.userName;
                            req.SubSystems = x.SubSystems;
                            console.log(this.addSubsytem);
                            if (this.addSubsytem.filter(y => y.SubSystems == x.SubSystems).length <= 0)
                                this.addSubsytem.push(req);
                            if (i == this.subSystemUrls.length && this.isEdit) {
                                this.getDetails();
                            }
                            i = i + 1;
                            this.materialscriptService.material();
                        })
                }
            }
        );
        this.materialscriptService.material();
    }

    setSystemActivities() {
        var systemActivities = <ISystemActivities>{};
        systemActivities.UserId = this.sessionContextResponse.userId;
        systemActivities.LoginId = this.sessionContextResponse.loginId;
        systemActivities.User = this.sessionContextResponse.userName;
        systemActivities.ActionCode = "VIEW";
        systemActivities.FeaturesCode = "USERS";
        systemActivities.IsViewed = false;
        systemActivities.ActivitySource = ActivitySource[ActivitySource.Internal];
        return systemActivities;
    }

    cancel() {    
        this.resetDiv();
        this.addForm.reset();    
        this.isEnableAddDiv = false;
        this.isEnableAddbtn = true;
        this.isActiveCheck = false;
        this.pageHeading = "Add New User";
    }
    enableAddDiv() {
        this.isEnableAddDiv = true;
        this.isUpdateEnable = false;
        this.isEnableAddbtn = false;
        this.isActiveCheck = false;
        this.txtaddFname = "";
        this.txtAddEmail = "";
        this.txtAddLname = "";
        this.txtAddUname = "";
        this.ddlAddRoles = "";
        this.ddlAddLocation = "";
        this.getSubSytemUrls(this.ddlAddRoles);
        if (this.subSystemUrls != null && this.subSystemUrls.length > 0) {
            this.subSystemUrls.forEach(
                x => {
                    x.url = "";
                    x.DesignationLevels = "";
                }
            )
        }
    }
    doValidation() {
        this.istxtAddRequired = true;
        return;
    }
    validateAllFormFields(formGroup: NgForm) { //{1}  
        Object.keys(formGroup.controls).forEach(controlName => { //{2}
            const control = formGroup.controls[controlName]; //{3}     
            control.markAsTouched({ onlySelf: true });
        });
        this.materialscriptService.material();
    }

    ddlRoleChange() {
        this.isInValidSearch = false;
    }
    verifyEmailExist(email) {
        this.manageUserService.verifyEmailExist(email).subscribe(res => {
            if (res) {
                this.msgFlag = true;
                this.msgType = 'error';
                this.msgTitle = '';
                this.msgDesc = 'Email Already Exist';
            }
        }, err => {
            this.msgFlag = true;
            this.msgType = 'error';
            this.msgTitle = '';
            this.msgDesc = err.statusText;
        }
        )
    }
    addUser() {
        this.materialscriptService.material();
        if (!this.addForm.valid) {
            this.validateAllFormFields(this.addForm);
            return;
        }
        if (this.isUserExist) {
            this.msgFlag = true;
            this.msgType = 'error';
            this.msgTitle = '';
            this.msgDesc = 'UserName Already Exist';
            return;
        }
        let email = this.txtAddEmail;
        this.manageUserService.verifyEmailExist(email).subscribe(res => {
            if (res) {
                this.msgFlag = true;
                this.msgType = 'error';
                this.msgTitle = '';
                this.msgDesc = 'Email Already Exist';
                return;
            }
            else {
                this.userRequest.FirstName = this.txtaddFname;
                this.userRequest.LastName = this.txtAddLname;
                this.userRequest.Email = this.txtAddEmail;
                this.userRequest.RoleName = this.ddlAddRoles;
                let locationCode = this.locationResponse.filter(item => item.LocationName == this.ddlAddLocation)[0].LocationCode;
                this.userRequest.LocationCode = locationCode;
                this.userRequest.IsActive = this.isActiveCheck;
                this.userRequest.UserName = this.txtAddUname;
                this.userRequest.CreatedUser = this.sessionContextResponse.userName;
                this.userRequest.UpdatedUser = this.sessionContextResponse.userName;
                this.userRequest.IsDomain = false;
                this.userRequest.IsExist = false;
                this.addSubsytem.forEach(
                    x => x.RoleName = this.ddlAddRoles)
                console.log(this.addSubsytem);
                let userEvents: IUserEvents;
                userEvents = <IUserEvents>{};
                userEvents.FeatureName = Features[Features.USERS];
                userEvents.ActionName = Actions[Actions.CREATE];
                userEvents.PageName = this.router.url;
                userEvents.CustomerId = 0;
                userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
                userEvents.UserName = this.sessionContextResponse.userName;
                userEvents.LoginId = this.sessionContextResponse.loginId;

                this.userRequest.SubSystemURL = this.addSubsytem.filter(x => x.IsDefault == true)[0].SubSystemURL;
                this.manageUserService.addUser(this.userRequest, this.addSubsytem, userEvents).subscribe(
                    res => {
                        this.accId = res
                        if (this.accId > 0) {
                            this.cancel();
                            this.msgFlag = true;
                            this.msgType = 'success';
                            this.msgTitle = '';
                            this.msgDesc = 'User account has been added successfully';
                        }
                    },
                    err => {
                        console.log(err);
                        this.msgFlag = true;
                        this.msgType = 'error';
                        this.msgDesc = err.statusText;
                    }
                );
            }
        }, err => {
            this.msgFlag = true;
            this.msgType = 'error';
            this.msgTitle = '';
            this.msgDesc = err.statusText;
        }
        )


    }

    resetSubSystem() {
        this.istxtAddRequired = false;
        this.isActiveCheck = false;
        this.isEdit = false;
        this.materialscriptService.material();
        this.addForm.reset();

        this.ddlAddRoles = "";
        this.ddlAddLocation = "";
        this.getSubSytemUrls(this.ddlAddRoles);
    }

    resetDiv() {
        this.searchForm.reset();
        this.ddlRole = "";
        this.getSubSytemUrls(this.ddlRole);
        this.isInValidSearch = false;
        this.userRequest.Email = this.userRequest.UserName = this.userRequest.RoleName = this.userRequest.LocationCode = "";
        this.bindUsers(Actions[Actions.VIEW]);
        this.txtUserName = "";
        this.txtEmail = "";
        this.userRequest.IsActive = false;
        this.ddlStatus = "";
        this.ddlSearchLocation = "";
        this.materialscriptService.material();
        let rootSele = this;
        setTimeout(function () {
            rootSele.materialscriptService.material();
        }, 0)
    }
    setOutputFlag(e) {
        this.msgFlag = e;
    }
    setOutputFlagReset(e) {
        this.msgFlagReset = e;
    }
    setOutputFlagDeactive(e) {
        this.msgFlagDeactive = e;
    }

    sortDirection(SortingColumn) {
        this.gridArrowUSERNAME = false;
        this.gridArrowEmail = false;
        this.gridArrowUserRole = false;
        this.gridArrowIsActive = false;
        this.gridArrowIsLocked = false;

        this.sortingColumn = SortingColumn;
        if (this.sortingColumn == "UserName") {
            this.gridArrowUSERNAME = true;
            if (this.sortingDirection == true) {
                this.sortingDirection = false;
            }
            else {
                this.sortingDirection = true;
            }
        }

        else if (this.sortingColumn == "EmailAddress") {
            this.gridArrowEmail = true;
            if (this.sortingDirection == true) {
                this.sortingDirection = false;
            }
            else {
                this.sortingDirection = true;
            }
        }

        else if (this.sortingColumn == "UserRole") {
            this.gridArrowUserRole = true;
            if (this.sortingDirection == true) {
                this.sortingDirection = false;
            }
            else {
                this.sortingDirection = true;
            }
        }
        else if (this.sortingColumn == "IsActive") {
            this.gridArrowIsActive = true;
            if (this.sortingDirection == true) {
                this.sortingDirection = false;
            }
            else {
                this.sortingDirection = true;
            }
        }

        else if (this.sortingColumn == "IsLocked") {
            this.gridArrowIsLocked = true;
            if (this.sortingDirection == true) {
                this.sortingDirection = false;
            }
            else {
                this.sortingDirection = true;
            }
        }
        this.bindUsers(null);
    }
}
