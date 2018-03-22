import { Router } from '@angular/router';
import { IUserEvents } from './../models/userevents';
import { PhoneType, Features, Actions, defaultCulture } from './../constants';
import { IPhoneResponse } from './../models/phoneresponse';
import { ISMSRequest } from './../models/smsrequest';
import { IPhoneRequest } from './../models/phonerequest';
import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { ICommonResponse } from './../../shared/models/commonresponse';
import { IaddAddressInputs } from './../../shared/address/add-address.component';
import { IAddressRequest } from './../../shared/models/addressrequest';
import { ICommon } from './../../tags/models/tagshipmentaddressresponse';
import { CommonService } from './../../shared/services/common.service';
import { IActivityResponse } from './../../shared/models/activitiesresponse';
import { IAddressResponse } from './../../shared/models/addressresponse';
import { FormControl, FormGroup, Validators, ValidationErrors } from '@angular/forms';
import { IPaging } from "../../shared/models/paging";
import { CustomerContextService } from "../services/customer.context.service";
import { ICustomerContextResponse } from "../models/customercontextresponse";
import { IUserresponse } from "../models/userresponse";
import { SessionService } from "../services/session.service";
import { IBlocklistresponse } from "../../shared/models/blocklistmessageresponse";
import { MaterialscriptService } from "../materialscript.service";

declare var $: any;
@Component({
  selector: 'app-phone',
  templateUrl: './phone.component.html',
  styleUrls: ['./phone.component.scss']
})
export class PhoneComponent implements OnInit {
  disableDeletebtn: boolean = false;
  disableVerifybtn: boolean = false;
  disableHistorybtn: boolean = false;
  disableButton: boolean = false;
  verifyStrOTPNumber: boolean;
  isShowResend: any;
  otpErrorMessage: string;
  otpRequest: any;
  phoneFormToggle: Boolean = false;
  historyToggle: Boolean = false;
  phoneForm: FormGroup;
  title: string;
  formType: string;
  paging: IPaging;
  accountId:number;
  countries = [];
  userEvents = <IUserEvents>{};
  p: number = 1;
  totalRecordCount: number;
  pageItemNumber: number = 10;
  dataLength: number;
  startItemNumber: number = 1;
  endItemNumber: number;

  msgFlag: boolean;
  msgType: string;
  msgDesc: string;


  preferredPhone;
  verifyOtpObject: ISMSRequest = <ISMSRequest>{};
  phoneObject: IPhoneRequest = <IPhoneRequest>{};
  phoneArray: IPhoneRequest[] = [];
  resPhoneArray;
  phoneHistory: IPhoneResponse[];
  phoneHistoryReqObj: IPhoneRequest = <IPhoneRequest>{};
  UserInputs: IaddAddressInputs = <IaddAddressInputs>{};
  showPhoneHistoryFlag: boolean;
  customerContextResponse: ICustomerContextResponse;
  sessionContextResponse: IUserresponse;
  blockListPhoneDetails: IBlocklistresponse[] = [];

  strOTPNumber:string;

  validatePhonePattern = "\\(([0-9]{3})\\)[ ]([0-9]{3})[-]([0-9]{4})";
   validateNumberPattern = "[0-9]*";

   @Output() PhoneblockListArray: EventEmitter<IBlocklistresponse[]> = new EventEmitter<IBlocklistresponse[]>();
   @Input() PhoneblockListStatus;


  phoneTypes = {
    DayPhone: "",
    EveningPhone: "",
    MobileNo: "",
    WorkPhone: "",
    Fax: "",
  };
  checkPhoneChanges = ["DayPhone", "EveningPhone", "MobileNo", "WorkPhone", "Fax"];
  
  constructor(private commonService: CommonService, private customerContext: CustomerContextService,private router:Router,private sessionContext: SessionService, 
  private materialscriptService:MaterialscriptService) { }
  ngOnInit() {
    this.materialscriptService.material();
    this.sessionContextResponse = this.sessionContext.customerContext;
    this.UserInputs.loginId =  this.sessionContextResponse.loginId;
    this.UserInputs.userId = this.sessionContextResponse.userId;
    this.UserInputs.userName =this.sessionContextResponse.userName;
    this.customerContext.currentContext
      .subscribe(customerContext => { this.customerContextResponse = customerContext; }
      , (err) => {
        this.showErrorMsg(err.statusText.toString());
      }
      );
    if (this.customerContextResponse.AccountId > 0) {
      this.accountId = this.customerContextResponse.AccountId;

  this.userEvents.FeatureName = Features[Features.PHONE];
  this.userEvents.PageName = this.router.url;
  this.userEvents.CustomerId = 0;
  this.userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
  this.userEvents.UserName = this.sessionContextResponse.userName;
  this.userEvents.LoginId = this.sessionContextResponse.loginId;
      this.getAllPhonesById();
      this.checkRolesandPrivileges();
   }
  }

  checkRolesandPrivileges(){
    this.disableHistorybtn = !this.commonService.isAllowed(Features[Features.PHONE], Actions[Actions.HISTORY], "");
    this.disableButton = !this.commonService.isAllowed(Features[Features.PHONE],Actions[Actions.UPDATE], "");
    this.disableVerifybtn = !this.commonService.isAllowed(Features[Features.PHONE],Actions[Actions.VERIFY], "");
    this.disableDeletebtn = !this.commonService.isAllowed(Features[Features.PHONE],Actions[Actions.DELETE], "");
    
 }

  editDetails(infoType, functionType) {
    this.phoneFormToggle = true;
    this.title = functionType + ' ' + infoType;
    this.formType = infoType;
    
    this.phoneFormGenerate();
    $('#phoneEdit').modal('show');
    this.phoneForm.patchValue({ DayPhone: this.phoneTypes.DayPhone['PhoneNumber'], EveningPhone: this.phoneTypes.EveningPhone['PhoneNumber'], 
    MobileNo: this.phoneTypes.MobileNo['PhoneNumber'], WorkPhone: this.phoneTypes.WorkPhone['PhoneNumber'], Fax: this.phoneTypes.Fax['PhoneNumber'], 
    phonePreference: this.preferredPhone.Type, extn: this.phoneTypes.WorkPhone['Extension']})
    let rootSele=this;
setTimeout(function(){
rootSele.materialscriptService.material();
},0)
    this.phoneForm.controls[this.preferredPhone.Type].setValidators(Validators.required);
    this.materialscriptService.material();
  }
  phoneFormGenerate() {
    this.phoneForm = new FormGroup({
      DayPhone: new FormControl('', [Validators.pattern(this.validatePhonePattern)]),
      EveningPhone: new FormControl('', Validators.pattern(this.validatePhonePattern)),
      MobileNo: new FormControl('', Validators.pattern(this.validatePhonePattern)),
      WorkPhone: new FormControl('', Validators.pattern(this.validatePhonePattern)),
      extn:new FormControl('', Validators.compose([Validators.maxLength(5), Validators.pattern(this.validateNumberPattern)])),
      Fax: new FormControl('', Validators.pattern(this.validatePhonePattern)),
      phonePreference: new FormControl(''),
    })
  }

  getAllPhonesById() {

    this.commonService.getAllPhonesByCustomerId(this.accountId).subscribe(res => {
      //console.log(res); 
      this.parsePhone(res), this.resPhoneArray = res;
    }
      , (err) => {
        this.showErrorMsg(err.statusText.toString());
      });
  }

  parsePhone(phone) {
    this.phoneTypes = {
      DayPhone: "",
      EveningPhone: "",
      MobileNo: "",
      WorkPhone: "",
      Fax: "",
    };
    phone.forEach(element => {
      this.phoneTypes[element.Type] = element;

      if (element.IsCommunication) {
        this.preferredPhone = element;
      }
    });
  }

  prefferedPhoneTypeChange(val) {
    this.phoneForm.controls['DayPhone'].clearValidators();
    this.phoneForm.controls['EveningPhone'].clearValidators();
    this.phoneForm.controls['MobileNo'].clearValidators();
    this.phoneForm.controls['WorkPhone'].clearValidators();
    this.phoneForm.controls[val].setValidators([Validators.required, Validators.pattern(this.validatePhonePattern)]);
     for (var i = 0; i < this.checkPhoneChanges.length; i++) {
        if (this.checkPhoneChanges[i]!=val) {
          this.phoneForm.controls[this.checkPhoneChanges[i]].setValidators([Validators.pattern(this.validatePhonePattern)]);
        }
      }
  }

  formatPhone(event) {
    var phone = event.target.value;
    var target = event.target || event.srcElement || event.currentTarget;
    var objId = target.attributes.formcontrolname.value;
    //console.log(objId);
    if (phone.match(/^\d{3}$/)) {
      phone = phone.replace(/^(\d{3})/, '($1) ');
      this.phoneForm.controls[objId].setValue(phone);
    }
    else if (phone.match(/^\(\d{3}\)\s?(\d{3,})$/)) {
      // console.log(phone);
      phone = phone.replace(/(\d{3})\s?(\d)$/, '$1-$2');
      this.phoneForm.controls[objId].setValue(phone);
    }
  }

  changePhone(isBlockListCheck) {
    this.phoneArray = [];
    let oldVal = this.resPhoneArray;
    if (this.phoneForm.valid) {
      for (var i = 0; i < this.checkPhoneChanges.length; i++) {
        if (this.phoneTypes[this.checkPhoneChanges[i]]) {
          // console.log(this.phoneTypes[this.checkPhoneChanges[i]].PhoneNumber);
          if (this.phoneTypes[this.checkPhoneChanges[i]].PhoneNumber != this.phoneForm.controls[this.phoneTypes[this.checkPhoneChanges[i]].Type].value 
          || this.preferredPhone.Type!=this.phoneForm.controls["phonePreference"].value ) {
            //update
            this.phoneTypes[this.checkPhoneChanges[i]].PhoneNumber = this.phoneForm.controls[this.phoneTypes[this.checkPhoneChanges[i]].Type].value;
            this.phoneTypes[this.checkPhoneChanges[i]]["IsPhoneNumberChanged"] = true;
            this.phoneTypes[this.checkPhoneChanges[i]]["UpdatedUser"] = this.UserInputs.userName;
            this.phoneTypes[this.checkPhoneChanges[i]]["UserName"] = this.UserInputs.userName;
            this.phoneTypes[this.checkPhoneChanges[i]]["CheckBlockList"] = isBlockListCheck;
            //  console.log(this.phoneForm.controls['phonePreference'].value);

            if(this.checkPhoneChanges[i] == "WorkPhone"){
              this.phoneTypes[this.checkPhoneChanges[i]]["Extension"] = this.phoneForm.controls["extn"].value;
            }
           // alert(this.phoneTypes[this.checkPhoneChanges[i]]["Type"]);
           // alert(this.phoneForm.controls['phonePreference'].value);
            //  console.log(this.phoneTypes[this.checkPhoneChanges[i]]);
            if (this.phoneTypes[this.checkPhoneChanges[i]]["Type"] != this.phoneForm.controls['phonePreference'].value) {
             // console.log(this.phoneForm.controls['phonePreference'].value);
             // alert(this.phoneForm.controls['phonePreference'].value);
              this.phoneTypes[this.checkPhoneChanges[i]]["IsCommunication"] = false;
            
              
            }
            else {
             // this.phoneTypes[this.checkPhoneChanges[i]]["IsCommunication"] = true;
              this.phoneTypes[this.preferredPhone.Type]["IsCommunication"] = false;
              this.phoneTypes[this.checkPhoneChanges[i]]["IsCommunication"] = true;
             // alert(this.phoneForm.controls['phonePreference'].value);
              //  console.log(this.phoneTypes[this.checkPhoneChanges[i]]);
            }
            this.phoneArray.push(this.phoneTypes[this.checkPhoneChanges[i]]);
           // console.log(this.phoneArray);
          }
        }
        else {
          //add new phone
          if (this.phoneForm.controls[this.checkPhoneChanges[i]].value) {
            this.phoneObject.PhoneId = 0;
            this.phoneObject.PhoneNumber = this.phoneForm.controls[this.checkPhoneChanges[i]].value;
            this.phoneObject.UserName = this.UserInputs.userName;
            this.phoneObject.CustomerId = this.accountId;
            this.phoneObject.Type = this.checkPhoneChanges[i];

             if(this.checkPhoneChanges[i] == "WorkPhone"){
              this.phoneObject.Extension = this.phoneForm.controls["extn"].value;
            }

            if (this.phoneObject.Type != this.phoneForm.controls['phonePreference'].value) {
              //console.log(this.phoneForm.controls['phonePreference'].value);
              this.phoneObject.IsCommunication = false;
              
            }
            else {
             this.phoneObject.IsCommunication = true;
            //  this.phoneTypes[this.preferredPhone.Type]["IsCommunication"] = false;
              //  console.log(this.phoneTypes[this.checkPhoneChanges[i]]);
            }

            this.phoneObject.CheckBlockList = true;
            this.phoneArray.push(this.phoneObject);

          }
        }

      }
      if (this.phoneArray.length > 0) {
        this.userEvents.ActionName = Actions[Actions.UPDATE];
        this.commonService.updatePhone(this.phoneArray,this.userEvents).subscribe(res => {
          // console.log(res);
          if (res) {
            this.showSucsMsg("Phone(s) has been updated");
          }
          $('#phoneEdit').modal('hide'); this.getAllPhonesById()
        }, (err) => { 
          if (err.error) {
           // console.log(err._body);
            this.blockListPhoneDetails = err.error;
           // console.log(this.blockListPhoneDetails);
            this.PhoneblockListArray.emit(this.blockListPhoneDetails);
          }
          else {
          this.showErrorMsg(err.statusText.toString()); 
          }
          this.phoneTypes = {
            DayPhone: "",
            EveningPhone: "",
            MobileNo: "",
            WorkPhone: "",
            Fax: "",
          };
          this.getAllPhonesById() 
        });
      }
      else{
          this.showErrorMsg("No phone information to update");
      }
    }
    this.materialscriptService.material();
  }
//@Input isblocklist = false;

  // blockListPopup(isBlockListCheck) {
  //   this.changePhone(isBlockListCheck);
  // }

  ngOnChanges():void{  
   // console.log('phone false');
    if(this.PhoneblockListStatus){
      this.changePhone(false);
    }
  }

  deletePhone(phoneDetails) {
    phoneDetails.UpdatedUser = this.UserInputs.userName;
    this.userEvents.ActionName = Actions[Actions.DELETE];
    this.commonService.deletePhone(phoneDetails,this.userEvents).subscribe(res => {
      if (res) {
        this.showSucsMsg("Phone Number has been deleted");
        this.getAllPhonesById();
      }
    }, (err) => {
      this.showErrorMsg(err.statusText.toString());
    })
  }

  phoneHistoryPageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.dataLength)
      this.endItemNumber = this.dataLength;
      this.getPhoneHistory(this.p);
  }

  showPhoneHistory() {
    this.p =1;
    this.userEvents.ActionName = Actions[Actions.HISTORY];
    this.getPhoneHistory(this.p, this.userEvents);
    this.showPhoneHistoryFlag = true;
    $('#phoneHistory').modal('show');
  }

  getPhoneHistory(pageNumber: number, userEvents?: IUserEvents) {
    this.paging = <IPaging>{};
    this.paging.PageNumber = pageNumber;
    this.paging.PageSize = 10;
    this.paging.SortColumn = "";
    this.paging.SortDir = 1;
    this.phoneHistoryReqObj.CustomerId = this.accountId;
    this.phoneHistoryReqObj.Paging = this.paging;
    this.commonService.getPhoneHistoryByAccountId(this.phoneHistoryReqObj, userEvents)
      .subscribe(res => {
        this.phoneHistory = res;
        if(this.phoneHistory.length > 0){
          // console.log(res);
          this.totalRecordCount = this.phoneHistory[0].RecordCount;
         if (this.totalRecordCount < this.pageItemNumber) {
           this.endItemNumber = this.totalRecordCount;
         } else {
           this.endItemNumber = this.pageItemNumber;
         }
         // console.log(this.accountAdjustmentDetails);
         this.dataLength = this.phoneHistory.length
       }
      }, (err) => {
        this.showErrorMsg(err.statusText.toString());
      });
  }

  intMinutes = 0;
  verifyNumber(phoneDetails,resendFlag) {
    this.isShowResend = true;
    this.verifyOtpObject.CustomerId = this.accountId;
    this.verifyOtpObject.MobileNumber = phoneDetails.PhoneNumber;
    this.verifyOtpObject.UpdatedDate = new Date(Date.now())
    this.verifyOtpObject.UserName = phoneDetails.UserName;
    this.userEvents.ActionName = Actions[Actions.VERIFY];
    this.commonService.verifyPhone(this.verifyOtpObject, this.userEvents).subscribe(res => {
      if (res) {
        this.intMinutes = res;
        if (this.intMinutes > 0) {
         // this.successMessage = "One Time Password(OTP) has been sent to " + phoneDetails.PhoneNumber + "<br /> One Time Password (OTP) is valid for " + this._intMinutes + " minute(s)";
         if(!resendFlag){
          this.otpErrorMessage = "";
          this.strOTPNumber='';
          $('#verifyOtp').modal('show');
         }
          else{
            this.isShowResend = false;
          }
        }
      }
      // console.log(res);
    }, (err) => {
      this.showErrorMsg(err.statusText.toString());
    })
  }

  verifyOTP(){
    if(this.strOTPNumber){
      this.verifyStrOTPNumber=false;
    this.otpRequest = <any>{};
    this.otpRequest.OTPNumber = this.strOTPNumber;
    this.otpRequest.ExpiryDate = new Date().toLocaleString(defaultCulture).replace(/\u200E/g,"");
    this.otpRequest.CustomerId = this.accountId;
    this.otpRequest.AlertChannel = "SMS";
    this.otpRequest.MobileNumber = this.verifyOtpObject.MobileNumber;
    this.otpRequest.UpdatedUser = this.UserInputs.userName;
    this.commonService.verifyOTP(this.otpRequest).subscribe(res => {
      if (res) {
        if (res == 1) {
          //success
          this.getAllPhonesById();
          this.showSucsMsg("Mobile number verification has been done");
          $('#verifyOtp').modal('hide');
        }
        else{
          if (res == 2) {
            this.otpErrorMessage = "Mobile number verification has been done";
          }
          else if (res == 3) {
            this.otpErrorMessage = "Invalid OTP. Enter valid OTP";
          }
        }
      }
    },(err)=>{
      this.otpErrorMessage = err.statusText.toString();
    });
  }
  else{
    this.verifyStrOTPNumber=true;
  }
  }

 


  resetForm(){  
    this.phoneForm.patchValue({ DayPhone: this.phoneTypes.DayPhone['PhoneNumber'], EveningPhone: this.phoneTypes.EveningPhone['PhoneNumber'], 
    MobileNo: this.phoneTypes.MobileNo['PhoneNumber'], WorkPhone: this.phoneTypes.WorkPhone['PhoneNumber'], Fax: this.phoneTypes.Fax['PhoneNumber'], 
    phonePreference: this.preferredPhone.Type, extn: this.phoneTypes.WorkPhone['Extension']})
    let rootSele=this;
setTimeout(function(){
rootSele.materialscriptService.material();
},0)

  }

  showErrorMsg(msg: string): void {
    this.msgFlag = true;
    this.msgType = 'error';
    this.msgDesc = msg;
  }

  showSucsMsg(msg: string): void {
    this.msgFlag = true;
    this.msgType = 'success';
    this.msgDesc = msg;
  }

 setOutputFlag(e) {
    this.msgFlag = e;
  }


}
