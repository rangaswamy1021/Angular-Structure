import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { ImcReportsService } from "./services/report.service";
import { ITagSummaryRequest } from "./models/tagummaryrequest";
import { SessionService } from "../../shared/services/session.service";
import { IUserresponse } from "../../shared/models/userresponse";
import { ActivitySource, SubSystem, Features, Actions, defaultCulture } from "../../shared/constants";
import { CalendarComponent } from 'ng-fullcalendar';
import { Options } from 'fullcalendar';
import { concat } from 'rxjs/observable/concat';
import { IUserEvents } from "../../shared/models/userevents";
import { IOperationalLocationsRequest } from "../../sac/usermanagement/models/operationallocationsrequest";
import { IPaging } from "../../shared/models/paging";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { DistributionService } from "../distribution/services/distribution.service";
import { IOperationalLocationsResponse } from "../../sac/usermanagement/models/operationallocationsresponse";
import { MaterialscriptService } from "../../shared/materialscript.service";
declare var $: any;
@Component({
  selector: 'app-view-expiring-tags',
  templateUrl: './view-expiring-tags.component.html',
  styleUrls: ['./view-expiring-tags.component.scss']
})
export class ViewExpiringTagsComponent implements OnInit {
  showCalender: boolean = false;
  dropdownResponse: IOperationalLocationsResponse[];
  paging: any;
  getLocationRequest: IOperationalLocationsRequest = <IOperationalLocationsRequest>{};
  tagsData = [];
  totalTagCount = 0;
  calendarOptions: Options;
  // success and error block
  msgFlag: boolean;
  msgType: string;
  msgTitle: string;
  msgDesc: string;
  @ViewChild(CalendarComponent) ucCalendar: CalendarComponent;
  sessionContextResponse: IUserresponse;
  userEvents = <IUserEvents>{};
  tagToExpireCountResponse: any;
  eventsData = [];
  todayDate = new Date();
  getMonth = [{ id: 1, month: "January" }, { id: 2, month: "February" }, { id: 3, month: "March" }, { id: 4, month: "April" }, { id: 5, month: "May" }, { id: 6, month: "June" }, { id: 7, month: "July" }, { id: 8, month: "August" }, { id: 9, month: "September" }, { id: 10, month: "October" }, { id: 11, month: "November" }, { id: 12, month: "December" }];
  currentYear = new Date().getFullYear();
  getYear = [{ year: this.currentYear - 2 }, { year: this.currentYear - 1 }, { year: this.currentYear }, { year: this.currentYear + 1 }, { year: this.currentYear + 2 }]
  tagDistributionForm: FormGroup;
  constructor(private tagService: ImcReportsService, private materialscriptService: MaterialscriptService, private sessionContext: SessionService, private distributionServices: DistributionService,
    private router: Router) {

  }

  ngOnInit() {
    this.materialscriptService.material();
    this.tagDistributionForm = new FormGroup({
      "location": new FormControl("", [Validators.required]),
      "month": new FormControl("", [Validators.required]),
      "year": new FormControl("", [Validators.required])
    });
    this.tagDistributionForm.controls['location'].setValue("");
    this.tagDistributionForm.controls['month'].setValue(new Date().getMonth() + 1);
    this.tagDistributionForm.controls['year'].setValue(new Date().getFullYear());
    this.sessionContextResponse = this.sessionContext.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);

    }
    this.getLocations();
    this.calendarOptions = {
      editable: false,
      eventLimit: false,
      height: 500,
      header: {
        left: 'prev',
        center: 'title',
        right: 'next'
      }
    }
    this.getUserEvents();
  }
  searchClick() {
    if (!this.tagDistributionForm.valid) {
      this.validateAllFormFields(this.tagDistributionForm);
      return;
    }
    else {
      this.showCalender = true;
      this.getUserEvents();
      this.tagsData = [];
      this.totalTagCount=0;
      let date = this.tagDistributionForm.controls['month'].value + "/" + 1 + "/" + this.tagDistributionForm.controls['year'].value;
      let requestedDate = new Date(date);
      this.calendarOptions.defaultDate = requestedDate;
      if (this.ucCalendar) {
        this.ucCalendar.fullCalendar('gotoDate', requestedDate)
      }
      this.getTagToExpireCount(requestedDate, this.userEvents);

    }
  }
  resetData() {

    if (this.ucCalendar) {
        this.ucCalendar.fullCalendar('destroy');
    }

    this.showCalender = false;
    this.tagDistributionForm.reset();
    this.tagDistributionForm.controls['month'].setValue(new Date().getMonth() + 1);
    this.tagDistributionForm.controls['location'].setValue("");
    this.tagDistributionForm.controls['year'].setValue(new Date().getFullYear());
  }
  getTagToExpireCount(day: any, userEvents) {
    this.eventsData = [];
    this.calendarOptions.events = [];
    let iTagSummaryRequest: ITagSummaryRequest = <ITagSummaryRequest>{};
    let activitySource: string = ActivitySource[ActivitySource.Internal];
    iTagSummaryRequest.UserName = this.sessionContextResponse.userName;
    iTagSummaryRequest.UserId = this.sessionContextResponse.userId;
    iTagSummaryRequest.LoginId = this.sessionContextResponse.loginId;
    iTagSummaryRequest.ActivitySource = activitySource;
    iTagSummaryRequest.SubSystem = SubSystem[SubSystem.IMC];
    iTagSummaryRequest.IsSearch = true;
    iTagSummaryRequest.IsSearchEventFired = true;
    iTagSummaryRequest.TagReqDate = (day).toLocaleString(defaultCulture).replace(/\u200E/g,"");
    iTagSummaryRequest.LocationId = this.tagDistributionForm.controls['location'].value;
    $('#pageloader').modal('show');
    this.tagService.getTagToExpireCount(iTagSummaryRequest, userEvents).subscribe(res => {
      this.tagToExpireCountResponse = res;
      $('#pageloader').modal('hide');
      this.ucCalendar.fullCalendar('removeEvents');

      this.tagToExpireCountResponse.forEach(el => {
        let object = {
          title: '',
          start: new Date(),
          count: '',
          name: ''
        };
        const dateObj = new Date(el.TagReqDate);
        const yearMonth = dateObj.getFullYear() + '-' + (dateObj.getMonth() + 1) + '-' + (dateObj.getDate());
        object.start = new Date(yearMonth);
        object.title = el.TagType + ":" + el.ResultCount;
        object.count = el.ResultCount;
        object.name = el.TagType;
        this.totalTagCount = this.totalTagCount + el.ResultCount;
        this.ucCalendar.fullCalendar('renderEvent', object);
        this.eventsData.push(object);
      });
      this.calendarOptions.events = this.eventsData;
      if (this.tagToExpireCountResponse != null && this.tagToExpireCountResponse != "") {
        this.eventsData.forEach(el => {
          let object = {
            title: '',
            count: ''
          };

          let flag = true;
          for (var i = 0; i < this.tagsData.length; i++) {
            if (this.tagsData[i].title == el.name) {
              this.tagsData[i].count = this.tagsData[i].count + el.count;
              flag = false;
            }

          }
          if (flag) {
            object.title = el.name;
            object.count = el.count;
            this.tagsData.push(object);
          }

        });
      }
      return;
    },
      (err) => {
        $('#pageloader').modal('hide');
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText.toString();
        this.msgTitle = '';
      });

  }

  eventClick(details) {
    console.log("details is : " + details);
  }

  updateEvent(updateEvent) {
    console.log("details is : " + updateEvent);
  }

  clickButton(clickButton) {
    this.eventsData = [];
    this.totalTagCount = 0;
    this.tagsData = [];
    let requestDateObject = clickButton.data._d;
    let date1 = new Date(requestDateObject);
    this.getTagToExpireCount(date1, null);

  }
  windowResize(events) {
    return true;
  }
  ngOnDestroy() {
    if (this.ucCalendar) {
      this.ucCalendar.fullCalendar('destroy');
    }


  }
  getUserEvents() {
    this.userEvents.FeatureName = Features[Features.VIEWEXPIRINGTAGS];
    this.userEvents.ActionName = Actions[Actions.VIEW];
    this.userEvents.PageName = this.router.url;
    this.userEvents.CustomerId = 0;
    this.userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    this.userEvents.UserName = this.sessionContextResponse.userName;
    this.userEvents.LoginId = this.sessionContextResponse.loginId;
  }
  setOutputFlag(e) {
    this.msgFlag = e;
  }

  getLocations(userEvents?: IUserEvents) {
    this.getLocationRequest.LocationCode = '';
    this.getLocationRequest.LocationName = '';
    this.paging = <IPaging>{};
    this.paging.PageNumber = 1;
    this.paging.PageSize = 100;
    this.paging.SortColumn = "LOCATIONCODE";
    this.paging.SortDir = 1;
    this.getLocationRequest.Paging = this.paging;
    this.getLocationRequest.viewFlag = "VIEW";
    this.getLocationRequest.UserId = this.sessionContext.customerContext.userId;
    this.getLocationRequest.LoginId = this.sessionContext.customerContext.loginId;
    this.getLocationRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.getLocationRequest.PerformedBy = this.sessionContext.customerContext.userName;
    this.distributionServices.getOperationalLocations(this.getLocationRequest, userEvents).subscribe(
      res => {
        this.dropdownResponse = res;
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
}
