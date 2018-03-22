import { CommonService } from './../../shared/services/common.service';
import { IUserEvents } from './../../shared/models/userevents';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { IManageRolesResponse } from './models/rolesresponse';
import { ActivitySource, Features, Actions } from './../../shared/constants';
import { ISystemActivities } from './../../shared/models/systemactivitiesrequest';
import { IPaging } from './../../shared/models/paging';
import { IManageRolesRequest, ISearchRolesRequest } from './models/rolesrequest';
import { IUserresponse } from './../../shared/models/userresponse';
import { UserManagementService } from './services/usermanagement.service';
import { SessionService } from './../../shared/services/session.service';
import { Component, OnInit } from '@angular/core';
import { MaterialscriptService } from "../../shared/materialscript.service";

declare var $: any;
@Component({
  selector: 'app-manage-roles',
  templateUrl: './manage-roles.component.html',
  styleUrls: ['./manage-roles.component.scss']
})
export class ManageRolesComponent implements OnInit {
  gridArrowISACTIVE: boolean;
  gridArrowROLEDESCRIPTION: boolean;
  gridArrowRoleName: boolean;
  sortingDirection: boolean;
  sortingColumn: any;

  sessionContextResponse: IUserresponse;
  constructor(private userManagementService: UserManagementService, private sessionContext: SessionService, private router: Router,
    private commonService: CommonService, private materialscriptService: MaterialscriptService) { }

  pageItemNumber: number = 10;
  currentPage: number = 1;
  startItemNumber: number = 1;
  endItemNumber: number = this.pageItemNumber;
  totalRecordCount: number;
  paging: IPaging;
  systemActivity: ISystemActivities;
  searchResponse: IManageRolesResponse[];
  isRoleName: boolean;
  addRole: boolean;
  active = 'Active';
  inActive = 'Inactive';
  commentTextLength: number = 255;
  roleId: number;
  addForm: FormGroup;
  searchForm: FormGroup;
  isActive: boolean = false;
  validateAlphabetsPattern = "[a-zA-Z]*";
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  isUpdate: boolean = false;
  isDelete: boolean = false;
  roleNamePrevious: string = '';
  roleNameExists: boolean = false;
  roleName: string = '';
  objResponse: any;
  roleIdVisible: boolean = false;
  disabledCreate: boolean = false;
  disabledUpdate: boolean = false;
  disabledDelete: boolean = false;
  disabledSearch: boolean = false;

  ngOnInit() {
    this.gridArrowRoleName = true;
    this.materialscriptService.material();
    this.sessionContextResponse = this.sessionContext.customerContext;
    this.initiateFormValues();
    this.initiateSearchValues();
    let userEvents = <IUserEvents>{};
    userEvents.ActionName = Actions[Actions.VIEW];
    this.userEventsCalling(userEvents);
    this.getRoles(true, userEvents);

    this.disabledSearch = !this.commonService.isAllowed(Features[Features.ROLES], Actions[Actions.SEARCH], "");
    this.disabledCreate = !this.commonService.isAllowed(Features[Features.ROLES], Actions[Actions.CREATE], "");
    this.disabledUpdate = !this.commonService.isAllowed(Features[Features.ROLES], Actions[Actions.UPDATE], "");
    this.disabledDelete = !this.commonService.isAllowed(Features[Features.ROLES], Actions[Actions.DELETE], "");
  }
  initiateFormValues() {
    this.addForm = new FormGroup({
      roleName: new FormControl('', Validators.compose([Validators.required, Validators.minLength(1), Validators.maxLength(50), Validators.pattern(this.validateAlphabetsPattern)])),
      roleDesc: new FormControl('', Validators.compose([Validators.required, Validators.minLength(1), Validators.maxLength(150)])),
      active: new FormControl({ value: '' })
    });
  }
  initiateSearchValues() {
    this.searchForm = new FormGroup({
      searchRole: new FormControl('', Validators.compose([Validators.required, Validators.minLength(1), Validators.maxLength(50), Validators.pattern(this.validateAlphabetsPattern)]))
    });
  }
  pageChanged(event) {
    this.currentPage = event;
    this.startItemNumber = (((this.currentPage) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.currentPage) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    this.getRoles(false);
  }
  getRoles(boolIsViewed, userEvents?: IUserEvents) {
    var getRoleReq = <ISearchRolesRequest>{};
    this.paging = <IPaging>{};
    this.paging.PageNumber = this.currentPage;
    this.paging.PageSize = this.pageItemNumber;
    // this.paging.SortColumn = "RoleName";
    this.paging.SortColumn = this.sortingColumn;
    this.paging.SortDir = this.sortingDirection == false ? 1 : 0;
    getRoleReq.Paging = this.paging;
    this.systemActivity = <ISystemActivities>{};
    this.systemActivity.UserId = this.sessionContextResponse.userId;
    this.systemActivity.LoginId = this.sessionContextResponse.loginId;
    this.systemActivity.User = this.sessionContextResponse.userName;
    this.systemActivity.FeaturesCode = "ROLES";
    this.systemActivity.ActionCode = "VIEW";
    this.systemActivity.IsViewed = boolIsViewed;
    this.systemActivity.ActivitySource = ActivitySource[ActivitySource.Internal];
    getRoleReq.SystemActivity = this.systemActivity;
    this.userManagementService.SearchRoles(getRoleReq, userEvents).subscribe(res => {
      this.searchResponse = res;
      if (this.searchResponse != null && this.searchResponse.length > 0) {
        this.totalRecordCount = this.searchResponse[0].ReCount;
        if (this.totalRecordCount < this.pageItemNumber) {
          this.endItemNumber = this.totalRecordCount;
        }
      }
    },
      (err) => {
        this.errorMessageBlock(err.statusText.toString());
      },
      () => {
      });
  }

  searchRole() {
    this.isRoleName = true;
    this.currentPage = 1;
    this.startItemNumber=1;
    this.endItemNumber=10;
    let userEvents = <IUserEvents>{};
    userEvents.ActionName = Actions[Actions.SEARCH];
    this.userEventsCalling(userEvents);
    this.getRoleName(true, userEvents);
  }

  getRoleName(boolIsSearch, userEvents?: IUserEvents) {
    var searchRoleReq = <ISearchRolesRequest>{};
    if (this.searchForm.valid) {
      searchRoleReq.RoleName = this.searchForm.value.searchRole.trim();
      this.paging = <IPaging>{};
      this.paging.PageNumber = this.currentPage;
      this.paging.PageSize = this.pageItemNumber;
      this.paging.SortColumn = "RoleName";
      this.paging.SortDir = 1;
      searchRoleReq.Paging = this.paging;
      this.systemActivity = <ISystemActivities>{};
      this.systemActivity.UserId = this.sessionContextResponse.userId;
      this.systemActivity.LoginId = this.sessionContextResponse.loginId;
      this.systemActivity.User = this.sessionContextResponse.userName;
      this.systemActivity.FeaturesCode = "ROLES";
      this.systemActivity.ActionCode = "SEARCH";
      this.systemActivity.IsSearch = boolIsSearch;
      this.systemActivity.ActivitySource = ActivitySource[ActivitySource.Internal];
      searchRoleReq.SystemActivity = this.systemActivity;
      this.userManagementService.GetRoles(searchRoleReq, userEvents).subscribe(res => {
        this.searchResponse = res;
        if (this.searchResponse != null && this.searchResponse.length > 0) {
          this.totalRecordCount = this.searchResponse[0].ReCount;
          if (this.totalRecordCount < this.pageItemNumber) {
            this.endItemNumber = this.totalRecordCount;
          }
        }
      },
        (err) => {
          this.errorMessageBlock(err.statusText.toString());
        },
        () => {
        });
    }
    else {
      this.validateAllFormFields(this.searchForm);
    }
  }
  searchReset(): void {
    this.searchForm.reset();
    this.isRoleName = false;
    this.currentPage = 1;
    this.startItemNumber = 1;
    this.endItemNumber = 10;
    this.getRoles(false);
    let rootSele = this;
    setTimeout(function () {
      rootSele.materialscriptService.material();
    }, 0)
  }

  addNewRole(): void {
    this.addRole = true;
    this.isUpdate = false;
  }

  cancelClick(): void {
    this.materialscriptService.material();
    this.addForm.reset();
 
    this.materialscriptService.material();
    this.addRole = false;
       this.roleNameExists=false;
  }

  descEvent(event: any) {
    this.commentTextLength = 255 - event.target.value.length
  }

  submitRoles() {
    let userEvents = <IUserEvents>{};
    userEvents.ActionName = Actions[Actions.CREATE];
    this.userEventsCalling(userEvents);
    this.isUpdate = false;
    this.isDelete = false;
    if (this.addForm.valid) {
      let rolesReq: IManageRolesRequest = <IManageRolesRequest>{};
      if (this.roleNameExists) {
        this.errorMessageBlock("Role Name already exists");
        return;
      }
      this.assignCommonParameters(rolesReq);
      this.userManagementService.createRoles(rolesReq, userEvents).subscribe(res => {
        if (res) {
          this.successMessageBlock("Role has been created successfully.");
          this.addForm.reset();
          this.searchForm.reset();
          this.addRole = false;
          this.getRoles(false);
        }
        else {
          this.errorMessageBlock("Error while creating the Role.");
        }
      },
        (err) => {
          this.errorMessageBlock(err.statusText.toString());
        },
        () => {
        });
    }
    else {
      this.validateAllFormFields(this.addForm);
    }
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(controlName => {
      const control = formGroup.get(controlName);
      if (control instanceof FormControl) {
        if (control.invalid) {
          console.log(controlName);
          console.log(control.errors);
        }
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  resetClick(): void {

    this.addForm.reset();
    this.roleNameExists=false;
    this.materialscriptService.material();
  }

  editClick(objResponse): void {
    this.addRole = true;
    this.isUpdate = true;
    this.initiateFormValues();
    this.roleNameExists = false;
    this.roleId = objResponse.RoleId;
    this.roleName = objResponse.RoleName;
    this.addForm.patchValue({
      roleName: objResponse.RoleName,
      roleDesc: objResponse.RoleDescription,

    });
    this.isActive = objResponse.IsActive;
    let rootSele = this;
    setTimeout(function () {
      rootSele.materialscriptService.material();
    }, 0)
  }

  updateRoles() {
    this.isDelete = false;
    this.isUpdate = true;
    let userEvents = <IUserEvents>{};
    userEvents.ActionName = Actions[Actions.UPDATE];
    this.userEventsCalling(userEvents);
    if (this.addForm.valid) {
      let rolesReq: IManageRolesRequest = <IManageRolesRequest>{};
      if (this.roleNameExists) {
        this.errorMessageBlock("Role Name already exists");
        return;
      }
      this.assignCommonParameters(rolesReq);
      this.userManagementService.updateRoles(rolesReq, userEvents).subscribe(res => {
        if (res) {
          this.successMessageBlock("Role has been updated successfully.");
          this.addForm.reset();
          this.addRole = false;
          this.getRoles(false);
          this.searchForm.reset();
        }
        else {
          this.errorMessageBlock("Error while updating the Role.");
        }
      },
        (err) => {
          this.errorMessageBlock(err.statusText.toString());
        },
        () => {
        });
    }
    else {
      this.validateAllFormFields(this.addForm);
    }
  }

  deactivatePopup(deactiveRowValues) {
    this.objResponse = deactiveRowValues;
    this.msgType = 'alert';
    this.msgFlag = true;
    this.msgDesc = 'Are you sure you want to deactivate this Role ?';
  }

  deactivateRole() {
    this.isUpdate = false;
    this.isDelete = true;
    let userEvents = <IUserEvents>{};
    userEvents.ActionName = Actions[Actions.DELETE];
    this.userEventsCalling(userEvents);
    let rolesReq: IManageRolesRequest = <IManageRolesRequest>{};
    rolesReq.RoleId = this.objResponse.RoleId;
    rolesReq.RoleName = this.objResponse.RoleName;
    rolesReq.RoleDescription = this.objResponse.RoleDescription;
    this.assignCommonParameters(rolesReq);
    this.userManagementService.updateRoles(rolesReq, userEvents).subscribe(res => {
      if (res) {
        this.successMessageBlock("Role has been deactivated successfully.");
        this.addForm.reset();
        this.addRole = false;
        this.getRoles(false);
        this.searchForm.reset();
      }
      else {
        this.errorMessageBlock("Error while deactivating the Role.");
      }
    },
      (err) => {
        this.errorMessageBlock(err.statusText.toString());
      },
      () => {
      });
  }

  assignCommonParameters(rolesReq: IManageRolesRequest) {
    if (!this.isDelete) {
      rolesReq.RoleName = this.addForm.value.roleName.trim();
      rolesReq.RoleDescription = this.addForm.value.roleDesc.trim();
    }
    rolesReq.IsActive = this.isActive;
    rolesReq.CreatedUser = this.sessionContextResponse.userName;
    rolesReq.LoginId = this.sessionContextResponse.loginId;
    rolesReq.UserId = this.sessionContextResponse.userId;
    rolesReq.FeaturesCode = "ROLES";
    if (this.isUpdate) {
      rolesReq.RoleId = this.roleId;
      rolesReq.UpdateddUser = this.sessionContextResponse.userName;
      rolesReq.IsDelete = !this.isActive;
      rolesReq.ActionCode = "UPDATE";
      if (this.roleName.toUpperCase() == rolesReq.RoleName.toUpperCase()) {
        rolesReq.IsExist = true;
      }
      else {
        rolesReq.IsExist = false;
      }
    }
    if (this.isDelete) {
      rolesReq.IsActive = false;
      rolesReq.IsExist = true;
      rolesReq.IsDelete = true;
      rolesReq.ActionCode = "DELETE";
    }
    let objSystemActivities: ISystemActivities = <ISystemActivities>{};
    objSystemActivities.LoginId = this.sessionContextResponse.loginId;
    objSystemActivities.UserId = this.sessionContextResponse.userId;
    objSystemActivities.User = this.sessionContextResponse.userName;
    objSystemActivities.ActivitySource = ActivitySource[ActivitySource.Internal];
    rolesReq.SystemActivity = objSystemActivities;
  }

  isRoleNameExists() {
    if (this.addForm.controls["roleName"].valid && this.roleNamePrevious != this.addForm.value.roleName) {
      var strRoleName = this.addForm.value.roleName;
      this.userManagementService.checkIsExistRoleName(strRoleName).subscribe(res => {
        if (res)
          this.roleNameExists = true;
        else
          this.roleNameExists = false;
        console.log(res);
      });
    }
    else
      this.roleNameExists = false;
  }

  userEventsCalling(userEvents) {
    userEvents.FeatureName = Features[Features.ROLES];
    userEvents.ActionName = userEvents.ActionName;
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
  }
  errorMessageBlock(errorMsg) {
    this.msgType = 'error';
    this.msgFlag = true;
    this.msgDesc = errorMsg;
  }
  successMessageBlock(successMsg) {
    this.msgType = 'success';
    this.msgFlag = true;
    this.msgDesc = successMsg;
  }
  setOutputFlag(event, duration) {
    this.msgFlag = event;
  }
  userAction(event) {
    if (event) {
      this.deactivateRole();
    }
  }

  sortDirection(SortingColumn) {
    this.gridArrowRoleName = false;
    this.gridArrowROLEDESCRIPTION = false;
    this.gridArrowISACTIVE = false;


    this.sortingColumn = SortingColumn;
    if (this.sortingColumn == "RoleName") {
      this.gridArrowRoleName = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    else if (this.sortingColumn == "ROLEDESCRIPTION") {
      this.gridArrowROLEDESCRIPTION = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    else if (this.sortingColumn == "ISACTIVE") {
      this.gridArrowISACTIVE = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    this.getRoles(true, null);
  }

}
