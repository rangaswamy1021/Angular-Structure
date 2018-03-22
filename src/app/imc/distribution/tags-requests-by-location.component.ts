import { Locations } from './../constants';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ITagsDistributionRespone } from "./models/tagdistributionresponse";
import { ITagsDistributionRequest } from "./models/tagdistributionrequest";
import { ITagConfigurationResponse } from "../../tags/models/tagsconfigurationresponse";
import { DistributionService } from "./services/distribution.service";
import { SessionService } from "../../shared/services/session.service";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { IUserresponse } from "../../shared/models/userresponse";
import { ActivitySource, SubSystem, Features, Actions, defaultCulture } from "../../shared/constants";
import { DatePickerFormatService } from "../../shared/services/datepickerformat.service";

import { IPaging } from "../../shared/models/paging";
import { ITagRequest } from "../../tags/models/tagrequest";
import { CommonService } from "../../shared/services/common.service";
import { Router } from "@angular/router";
import { IUserEvents } from "../../shared/models/userevents";
import { UserManagementService } from "../../sac/usermanagement/services/usermanagement.service";
import { IOperationalLocationsRequest } from "../../sac/usermanagement/models/operationallocationsrequest";
import { IOperationalLocationsResponse } from "../../sac/usermanagement/models/operationallocationsresponse";
import { ICalOptions } from "../../shared/models/datepickeroptions";
import { IMyDrpOptions, IMyInputFieldChanged } from 'mydaterangepicker';
import { MaterialscriptService } from "../../shared/materialscript.service";


declare var $: any;
@Component({
  selector: 'app-tags-requests-by-location',
  templateUrl: './tags-requests-by-location.component.html',
  styleUrls: ['./tags-requests-by-location.component.scss']
})
export class TagsRequestsByLocationComponent implements OnInit {
  disableSearchButton: boolean;
  invalidDate: boolean;
  disableUpdateButton: boolean;
  dropdownResponse: IOperationalLocationsResponse[];
  getLocationRequest: IOperationalLocationsRequest = <IOperationalLocationsRequest>{};
  tagRequestLength: any;
  disableDeleteButton: boolean;
  disableCreateButton: boolean;
  childobject: ITagsDistributionRespone;
  tadreqiddisable: boolean = false;
  TagReqId: any;
  fulfillVisible: boolean;
  commentTextLength: number = 255;
  paging: any;
  hidetag: boolean;
  tagDistributionLocationForm: FormGroup;
  tagDistributionForm: FormGroup;
  //systemActivities: ISystemActivities;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  childFlag: boolean = false;
  tagsArrayCount = [];
  tagRequestlist: ITagsDistributionRequest[] = [];
  isDisabled: boolean = false;
  tagsDistributionRes: ITagsDistributionRespone[];
  tagsDistributionReq: ITagsDistributionRequest = <ITagsDistributionRequest>{};
  getTagconfigResponse: ITagConfigurationResponse[];
  myDateRangePickerOptions: ICalOptions = {
    dateFormat: 'mm/dd/yyyy',
    firstDayOfWeek: 'mo',
    sunHighlight: true,
    height: '34px',
    width: '260px',
    inline: false,
    alignSelectorRight: false,
    indicateInvalidDateRange: true,
    showClearBtn: false,
    showApplyBtn: false,
    showClearDateRangeBtn: false
  };
  constructor(private cdr: ChangeDetectorRef, private distributionServices: DistributionService, private router: Router, private commonService: CommonService, private sessionContext: SessionService, private datePickerFormatService: DatePickerFormatService, private materialscriptService: MaterialscriptService) { }
  sessionContextResponse: IUserresponse;
  pageItemNumber: number = 10;
  currentPage: number = 1;
  startItemNumber: number = 1;
  endItemNumber: number = this.pageItemNumber;
  totalRecordCount: number;

  ngOnInit() {
    this.materialscriptService.material();
    this.tagDistributionForm = new FormGroup({
      "comments": new FormControl(""),
      "tagsList": new FormControl("", [Validators.required])
    }); this.tagDistributionLocationForm = new FormGroup({
      "daterange": new FormControl("")
    });
    this.getLocations();
    // this.tagDistributionForm.controls["tagsList"].setValue("");
    this.disableCreateButton = !this.commonService.isAllowed(Features[Features.LOCATIONSREQUEST], Actions[Actions.REQUEST], "");
    this.disableDeleteButton = !this.commonService.isAllowed(Features[Features.LOCATIONSREQUEST], Actions[Actions.DELETE], "");
    this.disableSearchButton = !this.commonService.isAllowed(Features[Features.LOCATIONSREQUEST], Actions[Actions.SEARCH], "");
    this.disableUpdateButton = !this.commonService.isAllowed(Features[Features.LOCATIONSDISTRIBUTION], Actions[Actions.UPDATE], "");
    this.sessionContextResponse = this.sessionContext.customerContext;
    let date = new Date();
    this.tagDistributionLocationForm.patchValue({
      daterange: {
        beginDate: {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate()
        },
        endDate: {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate()
        }
      }
    });
    this.currentPage = 1;
    let userEvents = <IUserEvents>{};
    userEvents.ActionName = Actions[Actions.VIEW];
    this.userEventsCalling(userEvents);
    this.getTagsDistributionMethods(userEvents);
    this.distributionServices.getActiveTagConfigurations().subscribe(res => {
      this.getTagconfigResponse = res;
      console.log("this.getTagconfigResponse", this.getTagconfigResponse);
    });
  }

  dateResetClick() {
    //  this.insertTagDistribution();
    this.currentPage=1;
    this.endItemNumber=10;
    this.startItemNumber=1;
    this.tagDistributionLocationForm.reset();
    let date = new Date();
    this.tagDistributionLocationForm.patchValue({
      daterange: {
        beginDate: {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate()
        },
        endDate: {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate()
        }
      }
    });
    this.getTagsDistributionMethods();
  }

  cancelClick() {
    this.hidetag = false;
    this.tagDistributionForm.controls['comments'].setValue("");
    this.tagDistributionForm.reset();
  }

  userEventsCalling(userEvents) {
    userEvents.FeatureName = Features[Features.LOCATIONSREQUEST];
    userEvents.ActionName = userEvents.ActionName;
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
  }

  redirectPage(tagResponse: ITagsDistributionRespone) {
    this.childobject = tagResponse;
    this.childFlag = true;
    let Selected = this;
    setTimeout(function () {
      Selected.materialscriptService.material();
    }, 0)
    setTimeout(function () { window.scrollTo(20, document.body.scrollHeight) }, 100);
  }

  pageChanged(event) {
    this.currentPage = event;
    this.startItemNumber = (((this.currentPage) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.currentPage) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    this.getTagsDistributionMethods();
  }

  locationTagDetails() {
    this.hidetag = true;
    this.childFlag = false;
    this.tagDistributionForm.controls['tagsList'].setValue("");
    this.commentTextLength = 255;
  }

  tagDetailsSearch() {

    let userEvents = <IUserEvents>{};
    userEvents.ActionName = Actions[Actions.SEARCH];
    this.userEventsCalling(userEvents);
    this.currentPage = 1;
    this.startItemNumber=1;
    this.endItemNumber=10;
    if (!this.invalidDate)
      this.getTagsDistributionMethods(userEvents);
  }

  getTagsDistributionMethods(userEvents?: IUserEvents) {
    this.tagsDistributionReq = <ITagsDistributionRequest>{};
    let normalDate = this.tagDistributionLocationForm.controls['daterange'].value;
    let parsedDate = this.datePickerFormatService.getFormattedDateRange(normalDate);
    this.tagsDistributionReq.StartDate = new Date(new Date(parsedDate[0]).toLocaleDateString(defaultCulture).replace(/\u200E/g, "")).toDateString();
    this.tagsDistributionReq.EndDate = new Date(new Date(parsedDate[1]).toLocaleDateString(defaultCulture).replace(/\u200E/g, "")).toDateString();
    this.tagsDistributionReq.UserId = this.sessionContextResponse.userId;
    this.tagsDistributionReq.LoginId = this.sessionContextResponse.loginId;
    this.tagsDistributionReq.UserName = this.sessionContextResponse.userName;
    this.tagsDistributionReq.PageNumber = this.currentPage;
    this.tagsDistributionReq.PageSize = this.pageItemNumber;
    this.tagsDistributionReq.SortColumn = "LOCATIONID";
    this.tagsDistributionReq.SortDirection = false;
    this.distributionServices.getLocationRequests(this.tagsDistributionReq, userEvents).subscribe(res => {
      this.tagsDistributionRes = res;
      if (this.tagsDistributionRes != null && this.tagsDistributionRes.length > 0) {
        this.totalRecordCount = this.tagsDistributionRes[0].RecCount;
        if (this.totalRecordCount < this.pageItemNumber) {
          this.endItemNumber = this.totalRecordCount;
        }
      }
    });
  }

  onChange(tagconfig: ITagConfigurationResponse, tagcount: number, row_no) {
    if (this.tagsArrayCount.length > 0) {
      console.log(this.tagsArrayCount.filter(x => x.Protocol == tagconfig.Protocol && x.Mounting == tagconfig.Mounting))
      if (this.tagsArrayCount.filter(x => x.Protocol == tagconfig.Protocol && x.Mounting == tagconfig.Mounting).length > 0) {
        this.tagsArrayCount.filter(x => x.Protocol == tagconfig.Protocol && x.Mounting == tagconfig.Mounting)[0].Tagcount = tagcount;
      }
      else {
        tagconfig.Tagcount = tagcount;
        this.tagsArrayCount[row_no] = tagconfig;
      }
    }
    else {
      tagconfig.Tagcount = tagcount;
      this.tagsArrayCount[row_no] = tagconfig;
    }
  }

  insertTagDistribution() {
    let userEvents = <IUserEvents>{};
    userEvents.ActionName = Actions[Actions.REQUEST];
    this.userEventsCalling(userEvents);
    if (this.tagDistributionForm.valid) {
      this.tagRequestlist = [];
      if (this.tagsArrayCount != null && this.tagsArrayCount.length > 0) {
        for (var i = 0; i < this.tagsArrayCount.length; i++) {
          if (this.tagsArrayCount[i]) {
            var tagRequest = <ITagsDistributionRequest>{};
            tagRequest.LocationName = this.tagDistributionForm.controls['tagsList'].value;
            tagRequest.UserName = this.sessionContextResponse.userName;
            tagRequest.CreatedUser = this.sessionContextResponse.userName;
            tagRequest.UserId = this.sessionContextResponse.userId;
            tagRequest.LoginId = this.sessionContextResponse.loginId;
            tagRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
            tagRequest.TagReqDate = new Date().toLocaleString(defaultCulture).replace(/\u200E/g, "");
            tagRequest.ReqCount = this.tagsArrayCount[i].Tagcount;
            tagRequest.Protocol = this.tagsArrayCount[i].Protocol;
            tagRequest.Mounting = this.tagsArrayCount[i].Mounting;
            tagRequest.TagReqComment = this.tagDistributionForm.controls['comments'].value;
            this.tagRequestlist.push(tagRequest);
          }
        }
        this.distributionServices.insertTagLocationRequest(this.tagRequestlist, userEvents).subscribe(res => {
          if (res) {
            this.successMessageBlock("Tag(s) Location has been requested successfully.");
            this.hidetag = false;
            this.tagDistributionForm.controls['tagsList'].reset();
            this.tagDistributionForm.controls['tagsList'].setValue("");
            this.tagDistributionForm.controls['comments'].setValue("");
            this.tagsArrayCount = [];
            this.currentPage = 1;
            this.getTagsDistributionMethods();
          }
          else {
            this.errorMessageBlock("Error while requesting tag(s) locations");
            this.hidetag = true;
            this.tagsArrayCount = [];
          }
        },
          (err) => {
            this.errorMessageBlock(err.statusText.toString());
            this.hidetag = true;
          },
          () => {
          });

      } else {
        this.errorMessageBlock("Please select atleast one tag");
      }
    } else {
      this.tagDistributionForm.controls["tagsList"].markAsTouched({ onlySelf: true });
    }
  }
  getLocations() {
    this.getLocationRequest.LocationCode = '';
    this.getLocationRequest.LocationName = '';
    this.paging = <IPaging>{};
    this.paging.PageNumber = 1;
    this.paging.PageSize = 1000;
    this.paging.SortColumn = "LOCATIONCODE";
    this.paging.SortDir = 1;
    this.getLocationRequest.Paging = this.paging;
    this.getLocationRequest.viewFlag = "VIEW";
    this.getLocationRequest.UserId = this.sessionContext.customerContext.userId;
    this.getLocationRequest.LoginId = this.sessionContext.customerContext.loginId;
    this.getLocationRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.getLocationRequest.PerformedBy = this.sessionContext.customerContext.userName;
    this.distributionServices.getOperationalLocations(this.getLocationRequest).subscribe(
      res => {
        this.dropdownResponse = res;
        for (var i in this.dropdownResponse) {
          this.dropdownResponse = this.dropdownResponse.filter(element => element.LocationCode != Locations[Locations.NTTACentral]);
        }
      });
  }

  deleteTagRequest(tagRequestId: number) {
    let userEvents = <IUserEvents>{};
    userEvents.ActionName = Actions[Actions.DELETE];
    this.userEventsCalling(userEvents);
    var tagRequest = <ITagsDistributionRequest>{};
    tagRequest.TagReqId = tagRequestId;
    tagRequest.UserId = this.sessionContextResponse.userId;
    tagRequest.LoginId = this.sessionContextResponse.loginId;
    tagRequest.UserName = this.sessionContextResponse.userName;
    tagRequest.CreatedUser = this.sessionContextResponse.userName;
    tagRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
    tagRequest.Subsystem = SubSystem[SubSystem.IMC];
    this.distributionServices.deleteTagLocationRequest(tagRequest, userEvents).subscribe(res => {
      $('#confirm-dialog').modal('hide');
      if (res) {
        this.successMessageBlock("Tag request cancelled successfully");
        this.getTagsDistributionMethods();
      }
      else {
        this.errorMessageBlock("Error while deleting request");
      }
    },
      (err) => {
        this.errorMessageBlock(err.statusText.toString());
      },
      () => {
      });
  }

  onlyNumberKey(event) {
    return (event.charCode == 8 || event.charCode == 0) ? null : event.charCode >= 48 && event.charCode <= 57;
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

  cancelTagRequest(TagReqId) {
    this.TagReqId = TagReqId;
    this.fulfillVisible = false;
    this.confirmationBlock("Are you sure you want to cancel tag request ?");
  }

  confirmationBlock(alertMsg) {
    this.msgType = 'alert';
    this.msgFlag = true;
    this.msgDesc = alertMsg;
  }

  userAction(event) {
    if (event) {
      this.deleteTagRequest(this.TagReqId)
    }
  }

  onCancelClicked(status: boolean): void {
    this.childFlag = status;
   
    
  }

  onDistributeClicked(message: string): void {
    this.successMessageBlock(message);
    this.currentPage = 1;
    this.getTagsDistributionMethods();
    this.childFlag = false;
  }

  descEvent(event: any) {
    this.commentTextLength = 255 - event.target.value.length;
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  onDateRangeFieldChanged(event: IMyInputFieldChanged) {
    let date = this.tagDistributionLocationForm.controls["daterange"].value;
    if (!event.valid && event.value != "") {
      this.invalidDate = true;
      return;
    }
    else
      this.invalidDate = false;
  }
}
