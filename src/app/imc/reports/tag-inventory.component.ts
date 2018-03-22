import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidationErrors } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ImcReportsService } from "./services/report.service";
import { ITagSummaryRequest } from "./models/tagummaryrequest";
import { ITagSummaryResponse } from "./models/tagsummaryresponse";
import { ActivitySource, Actions, Features } from "../../shared/constants";
import { SessionService } from "../../shared/services/session.service";
//import { Features } from "../constants";
import { CommonService } from "../../shared/services/common.service";
import { Router } from "@angular/router";
import { IUserEvents } from "../../shared/models/userevents";
import { IUserresponse } from "../../shared/models/userresponse";
import { MaterialscriptService } from "../../shared/materialscript.service";
import { IOperationalLocationsRequest } from "../../sac/usermanagement/models/operationallocationsrequest";
import { IOperationalLocationsResponse } from "../../sac/usermanagement/models/operationallocationsresponse";
import { IPaging } from "../../shared/models/paging";
import { DistributionService } from "../distribution/services/distribution.service";
declare var $: any
@Component({
    selector: 'app-tag-inventory',
    templateUrl: './tag-inventory.component.html',
    styleUrls: ['./tag-inventory.component.scss']
})
export class TagInventoryComponent implements OnInit {
    paging: IPaging;
    tagInventoryForm: FormGroup;
    tagSummaryResponse = [];
    getLocationRequest: IOperationalLocationsRequest = <IOperationalLocationsRequest>{};
    dropdownResponse: IOperationalLocationsResponse[];
    userEventRequest: IUserEvents = <IUserEvents>{};
    sessionContextResponse: IUserresponse;
    tagStatusesResponse: any[];
    customerAccountStatusesResponse: any[];
    tagSummaryRequest: ITagSummaryRequest = <ITagSummaryRequest>{}
    afterSearch: boolean = false;
    disableSearchbtn: boolean;
    msgFlag: boolean;
    msgType: string;
    msgTitle: string;
    msgDesc: string;
    constructor(
        private reportsService: ImcReportsService,
        private _context: SessionService,
        private commonService: CommonService,
        private router: Router,
        private distributionServices: DistributionService,
         private materialscriptService: MaterialscriptService) { }

    ngOnInit() {
        this.materialscriptService.material();
        this.sessionContextResponse = this._context.customerContext;
        if (this.sessionContextResponse == null) {
            let link = ['/'];
            this.router.navigate(link);
        }
        this.disableSearchbtn = !this.commonService.isAllowed(Features[Features.TAGINVENTORY], Actions[Actions.SEARCH], "")
        let userEvent = this.userEvents();
        userEvent.ActionName = Actions[Actions.VIEW];
        this.commonService.checkPrivilegeswithAuditLog(userEvent).subscribe(res => { });
        this.tagInventoryForm = new FormGroup({
            'location': new FormControl('', )
        });
        this.getLocations();
        this.generateReport();
    }
   userEvents(): IUserEvents {
        this.userEventRequest.FeatureName = Features[Features.TAGINVENTORY];
        this.userEventRequest.ActionName = Actions[Actions.VIEW];
        this.userEventRequest.PageName = this.router.url;
        this.userEventRequest.CustomerId = 0;
        this.userEventRequest.RoleId = parseInt(this.sessionContextResponse.roleID);
        this.userEventRequest.UserName = this.sessionContextResponse.userName;
        this.userEventRequest.LoginId = this.sessionContextResponse.loginId;
        return this.userEventRequest;
    }
    getAllCustomerAccountStatuses() {
        this.reportsService.getAllCustomerAccountStatuses().subscribe(
            res => {
                this.customerAccountStatusesResponse = res;
            }, err => {
                this.msgType = 'error';
                this.msgFlag = true;
                this.msgDesc = err.statusText.toString();
                this.msgTitle = '';
                return;
            });
    }
    generateReport() {
        this.tagSummaryResponse = [];
        let location = this.tagInventoryForm.controls["location"].value;
        this.tagSummaryRequest.LocationId = this.tagInventoryForm.controls["location"].value;
        this.tagSummaryRequest.User = this._context.customerContext.userName;
        this.tagSummaryRequest.UserId = this._context.customerContext.userId;
        this.tagSummaryRequest.LoginId = this._context.customerContext.loginId;
        this.tagSummaryRequest.FeaturesCode = Features[Features.TAGINVENTORY];
        this.tagSummaryRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
        $('#pageloader').modal('show');
        let userEvent = this.userEvents();
        userEvent.ActionName = Actions[Actions.SEARCH];
        this.reportsService.getTagReportSummary(this.tagSummaryRequest, userEvent).subscribe(
            res => {

                res.forEach(element => {
                    if (element.Location == null) {
                        element.Location = "Total : ";
                    }
                    this.tagSummaryResponse.push(element);
                });
                $('#pageloader').modal('hide');
            }, err => {
                $('#pageloader').modal('hide');
                this.msgType = 'error';
                this.msgFlag = true;
                this.msgDesc = err.statusText.toString();
                this.msgTitle = '';
                return;
            });
    }
    setOutputFlag(e) {
        this.msgFlag = e;
    }
    resetForm() {

        this.tagInventoryForm.reset();
        this.tagInventoryForm.controls["location"].setValue("");
        this.generateReport();
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
    getLocations() {
        this.getLocationRequest.LocationCode = '';
        this.getLocationRequest.LocationName = '';
        this.paging = <IPaging>{};
        this.paging.PageNumber = 1;
        this.paging.PageSize = 100;
        this.paging.SortColumn = "LOCATIONCODE";
        this.paging.SortDir = 1;
        this.getLocationRequest.Paging = this.paging;
        this.getLocationRequest.viewFlag = "VIEW";
        this.getLocationRequest.UserId = this._context.customerContext.userId;
        this.getLocationRequest.LoginId = this._context.customerContext.loginId;
        this.getLocationRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
        this.getLocationRequest.PerformedBy = this._context.customerContext.userName;
        this.distributionServices.getOperationalLocations(this.getLocationRequest).subscribe(
            res => {
                this.dropdownResponse = res;
                console.log(res);
            });
    }
}