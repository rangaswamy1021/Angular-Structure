import { Component, OnInit } from '@angular/core';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { FormGroup, FormControl, Validators } from "@angular/forms"
import { IsystemActivityrequest } from "../../csc/dashboard/models/systemactivitiesrequest";
import { ICategoryTypesResponse } from "./models/categoryresponse";
import { ActivitySource, Features, Actions } from "../../shared/constants";
import { SessionService } from "../../shared/services/session.service";
import { ICategoryTypesRequest } from "./models/categoryrequest";
import { IPaging } from "../../shared/models/paging";
import { ISystemActivities } from "../../shared/models/systemactivitiesrequest";
import { ConfigurationService } from "./services/configuration.service";
import { IUserEvents } from "../../shared/models/userevents";
import { CommonService } from '../../shared/services/common.service';
import { Router } from "@angular/router";
import { IUserresponse } from "../../shared/models/userresponse";
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
    selector: 'app-category-types',
    templateUrl: './category-types.component.html',
    styleUrls: ['./category-types.component.scss']
})
export class CategoryTypesComponent implements OnInit {
    msgDesc: string;
    msgType: string;
    msgFlag: boolean;
    sessionContextResponse: IUserresponse;
    disableUpdateButton: boolean;
    disableCreateButton: boolean;
    categoryType: {
        id: number;
        Value: string;
    }[];
    element: any;
    categoryid: any;
    addData: boolean;
    updateData: boolean;
    validateAlphabetsPattern: any = "[a-zA-Z]+";
    Status: string;
    errorMessage: string;
    successMessage: string;
    addDetails: boolean;
    updateDetails: boolean;
    systemactivities: ISystemActivities;
    enterNewCategoryTypeDetail: boolean;
    enterNewCategoryTypeDetails: boolean = false;
    categoryTypeResponse: ICategoryTypesResponse;
    Paging: IPaging;
    p: number;
    pageItemNumber: number = 10;
    startItemNumber: number = 1;
    endItemNumber: number;
    totalRecordCount: number;
    categoryTypeReq: ICategoryTypesRequest;
    categoryTypeRes: ICategoryTypesResponse[];
    getCategoryType: any;
    addNewCategoryTypeFrom: FormGroup;
    enterCategoryTypeDetails: boolean;
    addNewCategoryTypeDetails: boolean = true;
    readOnly: boolean = false;
    defaultStatus: number = 0;
    statuses = [
        {
            id: 0,
            Value: 'Active'
        },

        {
            id: 1,
            Value: 'Inactive'
        }
    ];

    constructor(private configurationService: ConfigurationService, private commonService: CommonService, private sessionContext: SessionService, private router: Router, private materialscriptService: MaterialscriptService) { }
    ngOnInit() {
        this.materialscriptService.material();
        this.sessionContextResponse = this.sessionContext.customerContext;
        this.addNewCategoryTypeFrom = new FormGroup({
            name: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(100), Validators.pattern(this.validateAlphabetsPattern)]),
            description: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(250)]),
            rdostatus: new FormControl(''),
        });
        let userEvents: IUserEvents = <IUserEvents>{};
        this.userEventsCalling(userEvents);
        userEvents.ActionName = Actions[Actions.VIEW];
        this.disableCreateButton = !this.commonService.isAllowed(Features[Features.CATEGORYTYPES], Actions[Actions.CREATE], "");
        this.disableUpdateButton = !this.commonService.isAllowed(Features[Features.CATEGORYTYPES], Actions[Actions.UPDATE], "");
        this.p = 1;
        this.endItemNumber = this.pageItemNumber;
        this.getCategoryTypeDetails(this.p, userEvents);

    }

    setOutputFlag(e) { this.msgFlag = e; }

    cancelCategoryType() {
        this.enterNewCategoryTypeDetail = false;
        this.errorMessage = "";
        this.successMessage = "";
        this.addNewCategoryTypeFrom.reset()
    }

    addNewCategoryType() {
        this.defaultStatus = 0;
        this.enterNewCategoryTypeDetail = true;
        this.addDetails = true;
        this.updateDetails = false;
        this.errorMessage = "";
        this.successMessage = "";
        this.addNewCategoryTypeFrom.get('name').enable();
    }

    submitNewCategoryTypeDetails() {
    }

    pageChanged(event) {
        this.p = event;
        this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
        this.endItemNumber = ((this.p) * this.pageItemNumber);
        if (this.endItemNumber > this.totalRecordCount)
            this.endItemNumber = this.totalRecordCount;
        this.getCategoryTypeDetails(this.p);
    }

    getCategoryTypeDetails(pageNumber: number, userEvents?: IUserEvents): void {
        this.categoryTypeReq = <ICategoryTypesRequest>{};
        this.categoryTypeReq.pageSize = 10;
        this.categoryTypeReq.pageNumber = pageNumber;
        this.categoryTypeReq.sortDir = 1;
        this.categoryTypeReq.sortColumn = "CategoryName";
        this.systemactivities = <ISystemActivities>{};
        this.systemactivities.LoginId = this.sessionContextResponse.loginId;
        this.systemactivities.UserId = this.sessionContextResponse.userId;
        this.systemactivities.User = this.sessionContextResponse.userName;
        this.systemactivities.IsViewed = true;
        this.systemactivities.ActivitySource = ActivitySource[ActivitySource.Internal];
        this.categoryTypeReq.systemActivity = this.systemactivities;
        this.configurationService.getCategoryTypes(this.categoryTypeReq, userEvents).subscribe(
            res => {
                this.categoryTypeRes = res;
                this.totalRecordCount = this.categoryTypeRes[0].ReCount;
                if (this.totalRecordCount < this.pageItemNumber) {
                    this.endItemNumber = this.totalRecordCount;
                }
            }
        )
    }
    setradio(a: string) {
        this.Status = a;
    }

    CreateFinanceCategoryTypes() {
        let userEvents: IUserEvents = <IUserEvents>{};
        this.userEventsCalling(userEvents);
        userEvents.ActionName = Actions[Actions.CREATE];
        this.categoryTypeReq.categoryName = this.addNewCategoryTypeFrom.controls['name'].value;
        this.categoryTypeReq.categoryDesc = this.addNewCategoryTypeFrom.controls['description'].value;
        if (this.addNewCategoryTypeFrom.controls['rdostatus'].value == 0) {
            this.categoryTypeReq.status = "Active";
        }
        else {
            this.categoryTypeReq.status = "Inactive";
        }
        this.systemactivities.LoginId = this.sessionContext.customerContext.loginId;
        this.systemactivities.UserId = this.sessionContext.customerContext.userId;
        this.systemactivities.User = this.sessionContext.customerContext.userName;
        this.systemactivities.IsViewed = true;
        this.systemactivities.ActivitySource = ActivitySource[ActivitySource.Internal];
        this.categoryTypeReq.systemActivity = this.systemactivities;
        if (this.addNewCategoryTypeFrom.valid) {
            this.configurationService.createCategoryTypes(this.categoryTypeReq, userEvents).subscribe(
                res => {
                    if (res) {
                        this.getCategoryTypeDetails(this.p);
                        this.msgFlag = true;
                        this.msgType = 'success'
                        this.msgDesc = 'Category Type has been created successfully.'
                        this.addNewCategoryTypeFrom.reset();
                    }
                    this.enterNewCategoryTypeDetail = false;
                }
                , err => {
                    this.msgFlag = true;
                    this.msgType = 'error'
                    this.msgDesc = err.statusText;
                });
        }
        else {
            this.validateAllFormFields(this.addNewCategoryTypeFrom);
        }
    }

    editCategoryType(categorytype) {
        this.addNewCategoryTypeFrom.controls['name'].setValue(categorytype.CategoryName);
        this.addNewCategoryTypeFrom.controls['description'].setValue(categorytype.CategoryDesc);
        if (categorytype.Status.toString().toLowerCase() == 'active') {
            this.defaultStatus = 0;
        }
        else {
            this.defaultStatus = 1;
        }
        this.errorMessage = "";
        this.successMessage = "";
        this.addNewCategoryTypeFrom.get('name').disable();
        this.enterNewCategoryTypeDetail = true;
        this.addDetails = false;
        this.updateDetails = true;
        this.categoryid = categorytype.CategoryId;
        this.materialscriptService.material();

    }

    UpdateFinanceCategoryTypes() {
        let userEvents: IUserEvents = <IUserEvents>{};
        this.userEventsCalling(userEvents);
        userEvents.ActionName = Actions[Actions.UPDATE];
        this.updateDetails = true;
        this.addDetails = false;
        this.categoryTypeReq.categoryId = this.categoryid;
        this.categoryTypeReq.categoryName = this.addNewCategoryTypeFrom.controls['name'].value;
        this.categoryTypeReq.categoryDesc = this.addNewCategoryTypeFrom.controls['description'].value;
        this.categoryTypeReq.status = this.addNewCategoryTypeFrom.controls['rdostatus'].value;
        if (this.addNewCategoryTypeFrom.controls['rdostatus'].value == 0) {
            this.categoryTypeReq.status = "Active";
        }
        else {
            this.categoryTypeReq.status = "Inactive";
        }
        this.systemactivities.LoginId = this.sessionContext.customerContext.loginId;
        this.systemactivities.UserId = this.sessionContext.customerContext.userId;
        this.systemactivities.User = this.sessionContext.customerContext.userName;
        this.systemactivities.IsViewed = true;
        this.systemactivities.ActivitySource = ActivitySource.Internal.toString();
        this.configurationService.updateCategoryTypes(this.categoryTypeReq, userEvents).subscribe(
            res => {
                if (res) {
                    this.msgFlag = true;
                    this.msgType = 'success'
                    this.msgDesc = 'Category Type has been updated successfully.'
                    this.getCategoryTypeDetails(this.p);
                    this.enterNewCategoryTypeDetail = false;
                }
                else {
                    this.msgFlag = true;
                    this.msgType = 'error'
                    this.msgDesc = 'Error while updating the Category Type'
                }
            });
    }

    validateAllFormFields(formGroup: FormGroup) {
        Object.keys(formGroup.controls).forEach(controlName => {
            const control = formGroup.get(controlName);
            if (control instanceof FormControl) {

                if (control.invalid) {
                }
                control.markAsTouched({ onlySelf: true });
            } else if (control instanceof FormGroup) {
                this.validateAllFormFields(control);
            }
        });
    }
    userEventsCalling(userEvents) {
        userEvents.FeatureName = Features[Features.CATEGORYTYPES];
        userEvents.PageName = this.router.url;
        userEvents.CustomerId = 0;
        userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
        userEvents.UserName = this.sessionContextResponse.userName;
        userEvents.LoginId = this.sessionContextResponse.loginId;
    }
}

