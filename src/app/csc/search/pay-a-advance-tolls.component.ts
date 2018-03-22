import { DatePickerFormatService } from './../../shared/services/datepickerformat.service';
import { ViewChild } from '@angular/core';
import { IUserresponse } from './../../shared/models/userresponse';
import { SessionService } from './../../shared/services/session.service';
import { Actions } from './../../shared/constants';
import { IUserEvents } from './../../shared/models/userevents';
import { CommonService } from './../../shared/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { IPayAdvanceTollResponse } from './models/payadvancetollsresponse';
import { IPayAdvanceTollRequest } from './models/payadvancetollsrequest';
import { CustomerSearchService } from './services/customer.search';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, ValidationErrors } from '@angular/forms';
import { Features } from "../../shared/constants";
import { MaterialscriptService } from "../../shared/materialscript.service";
//import { IMyDrpOptions } from "mydaterangepicker";
import { IMyDrpOptions, IMyInputFieldChanged } from "mydaterangepicker";
import { ICalOptions } from "../../shared/models/datepickeroptions";
declare var $: any;
@Component({
  selector: 'app-pay-a-advance-tolls',
  templateUrl: './pay-a-advance-tolls.component.html',
  styleUrls: ['./pay-a-advance-tolls.component.scss']
})
export class PayAAdvanceTollsComponent implements OnInit {
  invalidDateRange: boolean;
  msgFlag: boolean;
  disableButton: boolean;
  @ViewChild('datepicker') dp;
  sessionContextResponse: IUserresponse;
  searchObj: IPayAdvanceTollRequest;
  pageId: any;
  dateRange: any;
  msgDesc: string;
  msgType: string;
  errorMsg: boolean;
  warningMsg: boolean;
  payAdvanceTollForm: FormGroup;
  customerDetails: IPayAdvanceTollResponse[];
  transactionDetails: IPayAdvanceTollResponse[];
  pageItemNumber: number = 6;
  startItemNumber: number = 1;
  endItemNumber: number;
  dataLength: number;
  p: number;
  mp: number;
  modalStartItemNumber: number = 1;
  modalEndItemNumber: number;
  modalDataLength: number;
  oldVal = [];
  userEvents = <IUserEvents>{};
  //myDateRangePickerOptions: IMyDrpOptions = { dateFormat: 'mm/dd/yyyy', firstDayOfWeek: 'mo', sunHighlight: true, height: '34px', width: '260px', inline: false, alignSelectorRight: false, indicateInvalidDateRange: true };
 // myDateRangePickerOptions: IMyDrpOptions = { dateFormat: 'mm/dd/yyyy', firstDayOfWeek: 'mo', sunHighlight: true, height: '34px', width: '260px', inline: false, alignSelectorRight: false, indicateInvalidDateRange: true };

  myDateRangePickerOptions: ICalOptions = {
    dateFormat: 'mm/dd/yyyy',
    firstDayOfWeek: 'mo',
    sunHighlight: false,
    height: '34px',
    width: '260px',
    inline: false,
    alignSelectorRight: false,
    indicateInvalidDateRange: true,
    showClearBtn: false,
    showApplyBtn: false,
    showClearDateRangeBtn: false

  };

  constructor(private customerSearchService: CustomerSearchService, private datePickerFormat:DatePickerFormatService, private commonService: CommonService, private sessionData: SessionService, private router: Router, private route: ActivatedRoute, private materialscriptService:MaterialscriptService) { }
  bsValueChange(value){
  if(value==null || value[0]==null){
  this.payAdvanceTollForm.controls['dateRange'].setValue(void 0);
  }
  }
ngOnInit() {
    this.materialscriptService.material();
    this.sessionContextResponse = this.sessionData.customerContext;

    this.userEvents.FeatureName = Features[Features.PAYADVANCETOLLS];
    this.userEvents.SubFeatureName = "";
    this.userEvents.ActionName = Actions[Actions.VIEW];
    this.userEvents.PageName = this.router.url;
    this.userEvents.CustomerId = 0;
    this.userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    this.userEvents.UserName = this.sessionContextResponse.userName;
    this.userEvents.LoginId = this.sessionContextResponse.loginId;
    this.commonService.checkPrivilegeswithAuditLog(this.userEvents).subscribe(res => {
      console.log("Status", res);
    });
    this.disableButton = !this.commonService.isAllowed(Features[Features.PAYADVANCETOLLS],
      Actions[Actions.SEARCH], "");
    this.payAdvanceTollForm = new FormGroup({
      VehicleNo: new FormControl('', []),
      VoucherNum: new FormControl('', []),
      dateRange: new FormControl(null),
    })
    
    this.route.queryParams
      .subscribe(params => {
        if (params.fromSearch) {

          this.p = this.customerSearchService.pageIndex;
          this.customerDetails = this.customerSearchService.searchResults;
          if (this.customerSearchService.searchData) {
            this.payAdvanceTollForm.patchValue({
              VehicleNo: this.customerSearchService.searchData.VehicleNo,
              VoucherNum: this.customerSearchService.searchData.VoucherNum
            })

            if (this.customerSearchService.searchData.VehicleNo != undefined || this.customerSearchService.searchData.VoucherNum != undefined || this.customerSearchService.searchData.StartEffectiveDate != undefined || this.customerSearchService.searchData.EndEffectiveDate != undefined) {
              this.payAdvanceTollForm.controls['dateRange'].setValue(
                {beginDate:
                  {year:new Date(this.customerSearchService.searchData.StartEffectiveDate).getFullYear(),
                  month:new Date(this.customerSearchService.searchData.StartEffectiveDate).getMonth()+1,
                  day:new Date(this.customerSearchService.searchData.StartEffectiveDate).getDate(),
                },
                endDate:
                  {year:new Date(this.customerSearchService.searchData.EndEffectiveDate).getFullYear(),
                  month:new Date(this.customerSearchService.searchData.EndEffectiveDate).getMonth()+1,
                  day:new Date(this.customerSearchService.searchData.EndEffectiveDate).getDate(),
                  }
              }
              ) 
            }
          }
        }
      });

    // this.payAdvanceTollForm.controls['dateRange'].setValue()
  }
  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.dataLength)
      this.endItemNumber = this.dataLength;
  }
  modalPageChanged(event) {
    debugger;
    this.mp = event;
    this.modalStartItemNumber = (((this.mp) - 1) * this.pageItemNumber) + 1;
    this.modalEndItemNumber = ((this.mp) * this.pageItemNumber);
    if (this.modalEndItemNumber > this.modalDataLength)
      this.modalEndItemNumber = this.modalDataLength;
  }
  getOneTimeTollCustomers() {
    if(!this.invalidDateRange){
    this.userEvents.ActionName = Actions[Actions.SEARCH];
    if (this.payAdvanceTollForm.value.VehicleNo != '' || this.payAdvanceTollForm.value.VoucherNum != '' || this.payAdvanceTollForm.value.dateRange != '') {
      let obj: IPayAdvanceTollRequest = <IPayAdvanceTollRequest>{};
      obj.VehicleNo = this.payAdvanceTollForm.value.VehicleNo;
      obj.VoucherNum = this.payAdvanceTollForm.value.VoucherNum;

      debugger;

     let date = new Date();
      if (this.payAdvanceTollForm.value.dateRange) {
        let date=this.payAdvanceTollForm.value.dateRange;
        let startDate=this.payAdvanceTollForm.value.dateRange.beginDate;
        let endDate=this.payAdvanceTollForm.value.dateRange.endDate;
        if (startDate == null && endDate == '') {
          obj.StartEffectiveDate = new Date(Date.now());
          obj.EndEffectiveDate = new Date(Date.now());
        }
        else {
          let dateArray = this.datePickerFormat.getFormattedDateRange(date);
          obj.StartEffectiveDate = dateArray[0];
          obj.EndEffectiveDate = dateArray[1];
        }
      }
      else {
        obj.StartEffectiveDate = new Date(Date.now());
        obj.EndEffectiveDate = new Date(Date.now());
      }
      this.searchObj = obj;
      this.customerSearchService.getOneTimeTollCustomers(obj, this.userEvents).subscribe(res => {
        if (res) {
          this.msgFlag = false;
      // this.msgType = 'error';
          this.errorMsg = false;
          this.customerDetails = res;
          this.dataLength = this.customerDetails.length;
          if (this.dataLength < this.pageItemNumber) {
            this.endItemNumber = this.dataLength
          }
          else {
            this.endItemNumber = this.pageItemNumber;
          }
        }
        else {
          this.msgFlag = true;
      this.msgType = 'error';
          this.errorMsg = true;
          this.msgDesc = "No Details Found";
        }
      }, (err) => {
          this.msgFlag = true;
      this.msgType = 'error';
        this.errorMsg = true;
        this.msgDesc = "No Details Found";
      })
    }
    else {
      this.msgFlag = true;
      this.msgType = 'error';
      this.errorMsg = true;
      this.msgDesc = "Please fill atleast one field";
    }
  }
}
  setOutputFlag(e) {
    this.msgFlag = e.flag;
    this.msgType = e.type;
  }
  getOneTimeTollTransactions(customerId) {
    this.pageId = customerId;
    this.customerSearchService.getOneTimeTollTransactions(customerId).subscribe(res => {
      this.mp = 1;
      $('#viewTransactions').modal('show');
      this.transactionDetails = res;
      this.modalDataLength = this.transactionDetails.length;
      if (this.modalDataLength < this.pageItemNumber) {
        this.modalEndItemNumber = this.modalDataLength
      }
      else {
        this.modalEndItemNumber = this.pageItemNumber;
      }

    })
  }
  closeModal() {
    $('#viewTransactions').modal('hide');
    this.transactionDetails = null;
  }
  payOrConvert(custDetails) {
    debugger;
    this.customerSearchService.saveSearchData(this.customerDetails, this.searchObj, this.p);
    this.router.navigate(['csc/customeraccounts/pay-a-advance-toll-to-customer', custDetails.CustomerId]);
  }

  onDateRangeChanged(event: IMyInputFieldChanged) {
    if (event.value != "" && !event.valid) {
      this.invalidDateRange = true;
    }
    else
      this.invalidDateRange = false;

  }
}