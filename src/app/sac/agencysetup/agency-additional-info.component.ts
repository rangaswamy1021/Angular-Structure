import { Component, OnInit } from '@angular/core';
import { IAgencyRequest } from "./models/agencyrequest";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { SessionService } from "../../shared/services/session.service";
import { IUserresponse } from "../../shared/models/userresponse";
import { Router, ActivatedRoute } from "@angular/router";
import { ActivitySource, Features, Actions, PhoneType } from "../../shared/constants";
import { AgencySetupService } from "./services/agencysetup.service";
import { ICommonResponse } from "../../shared/models/commonresponse";
import { CommonService } from "../../shared/services/common.service";
import { IAgencyResponse } from "./models/agencyresponse";
import { IUserEvents } from "../../shared/models/userevents";
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-agency-additional-info',
  templateUrl: './agency-additional-info.component.html',
  styleUrls: ['./agency-additional-info.component.scss']
})
export class AgencyAdditionalInfoComponent implements OnInit {
  ispreview: boolean = false;
  msgDesc: string;
  msgTitle: string;
  msgType: string;
  msgFlag: boolean;
  isUpdate: boolean = false;
  isCreate: boolean = false;
  firstName: string;
  lastName: string;
  middleName: string;
  successMessage: string;
  isPreview: boolean = false;
  phone: string = 'N/A';
  mobile: string = 'N/A';
  address: string;
  email: string;
  gender: string;
  userName: string;
  name: string;
  suffix: string;
  title: string;
  isActive: string;
  agencyCode: string;
  agencyName: string;
  previewAgency: IAgencyResponse;
  add: boolean;
  update: boolean;
  ifscCode: string;
  bankName: string;
  accType: string;
  accountName: string;
  accountNum: string;
  bankDetails: IAgencyResponse;
  agencyId: number;
  accountType: ICommonResponse[];
  lookupType: ICommonResponse;
  activity: string;
  agencyInfo: FormGroup;
  addBank: IAgencyRequest;
  sessionContextResponse: IUserresponse;
  constructor(private sessionService: SessionService, private router: Router, private route: ActivatedRoute,
    private agencySetupService: AgencySetupService, private commonService: CommonService, private materialscriptService: MaterialscriptService) { }

  ngOnInit() {
    let a = this;
    setTimeout(function () {
      a.materialscriptService.material()
    }, 100); this.materialscriptService.material();
    this.lookupType = <ICommonResponse>{};
    this.lookupType.LookUpTypeCode = "BankAccountTypes";
    this.commonService.getLookUpByParentLookupTypeCode(this.lookupType).subscribe(
      res => {
        this.accountType = res;
      });
    this.activity = ActivitySource[ActivitySource.Internal];
    this.route.queryParams.subscribe(params => {
      this.agencyId = params['id'];
    });
    console.log(this.agencyId);
    this.agencyInfo = new FormGroup({
      'accountNo': new FormControl('', [Validators.required]),
      'accountType': new FormControl('', [Validators.required]),
      'accountName': new FormControl('', [Validators.required]),
      'bankName': new FormControl('', [Validators.required]),
      'ifscCode': new FormControl('', [Validators.required])
    });
    this.sessionContextResponse = this.sessionService.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }
    this.getAgencyBankDetails();
    if (!this.commonService.isAllowed(Features[Features.AGENCY], Actions[Actions.VIEW], "")) {
      //error page;
    }
    this.isCreate = !this.commonService.isAllowed(Features[Features.AGENCY], Actions[Actions.CREATE], "");
    this.isUpdate = !this.commonService.isAllowed(Features[Features.AGENCY], Actions[Actions.UPDATE], "");
    this.ispreview = !this.commonService.isAllowed(Features[Features.AGENCY], Actions[Actions.PREVIEW], "");
  }
  setOutputFlag(e) {
    this.msgFlag = e;
  }
  saveDetails() {
    if (this.agencyInfo.valid) {
      this.addBank = <IAgencyRequest>{};
      this.addBank.AgencyId = this.agencyId;//this.agencyId;
      this.addBank.AccountNumber = this.agencyInfo.controls['accountNo'].value;
      this.addBank.AccountType = this.agencyInfo.controls['accountType'].value;
      this.addBank.AccountName = this.agencyInfo.controls['accountName'].value;
      this.addBank.BankName = this.agencyInfo.controls['bankName'].value;
      this.addBank.IFSCCode = this.agencyInfo.controls['ifscCode'].value;
      this.addBank.PerformedBy = this.sessionContextResponse.userName;
      this.addBank.UserId = this.sessionContextResponse.userId
      this.addBank.LoginId = this.sessionContextResponse.loginId
      this.addBank.ActivitySource = ActivitySource[this.activity];
      this.addBank.UserType = "Agency";
      this.addBank.CreatedDate = new Date(Date.now());
      this.addBank.UpdatedDate = new Date(Date.now());
      this.addBank.CreatedUser = this.sessionContextResponse.userName;
      this.addBank.UpdatedUser = this.sessionContextResponse.userName;
      let userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.AGENCY];
      if (this.add) {
        userEvents.ActionName = Actions[Actions.CREATE];
      }
      else {
        userEvents.ActionName = Actions[Actions.UPDATE];
      }
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;
      this.agencySetupService.updateAgencyOtherInfo(this.addBank, userEvents).subscribe(res => {
        if (res) {
        }
      }, (err) => {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgTitle = '';
        this.msgDesc = err.statusText.toString();
      }, () => {
        this.successMessage = "Agency details has been updated successfully";
        this.router.navigate(['/sac/agencysetup/manage-agency'], { queryParams: { flag: 4 } });
      })
    }
    else {
      this.validateAllFormFields(this.agencyInfo);
    }
  }
  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(controlName => {
      const control = formGroup.get(controlName);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }
  updateDetails() {

    this.saveDetails();
  }
  getAgencyBankDetails() {
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.AGENCY];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;

    this.agencyId = this.agencyId;//this.agencyId;9000000002
    this.agencySetupService.getAgencyBankDetails(this.agencyId, userEvents).subscribe(res => {
      this.bankDetails = res;
      if (this.bankDetails.AccountNumber == '') {
        this.update = false;
        this.add = true;
      }
      else {
        this.agencyInfo.controls['accountNo'].setValue(this.bankDetails.AccountNumber);
        this.agencyInfo.controls['accountType'].setValue(this.bankDetails.AccountType);
        this.agencyInfo.controls['accountName'].setValue(this.bankDetails.AccountName);
        this.agencyInfo.controls['bankName'].setValue(this.bankDetails.BankName);
        this.agencyInfo.controls['ifscCode'].setValue(this.bankDetails.IFSCCode);
        this.add = false;
        this.update = true;
      }
    })
  }
  previewDetails() {
    this.getAgencyBankDetails();
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.AGENCY];
    userEvents.ActionName = Actions[Actions.PREVIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.agencyId = this.agencyId;//this.agencyId;
    this.agencySetupService.getAgencyById(this.agencyId, userEvents).subscribe(res => {
      this.previewAgency = res;
      console.log("preview");
      console.log(this.previewAgency);
    }, (err) => { }
      , () => {
        this.agencyName = this.previewAgency.AgencyName ? this.previewAgency.AgencyName : 'N/A';
        this.agencyCode = this.previewAgency.AgencyCode ? this.previewAgency.AgencyCode : 'N/A';
        this.isActive = this.previewAgency.IsActive ? "Yes" : "No";
        this.accountNum = this.agencyInfo.controls['accountNo'].value ? this.agencyInfo.controls['accountNo'].value : 'N/A';
        this.accType = this.agencyInfo.controls['accountType'].value ? this.agencyInfo.controls['accountType'].value : 'N/A';
        this.accountName = this.agencyInfo.controls['accountName'].value ? this.agencyInfo.controls['accountName'].value : 'N/A';
        this.bankName = this.agencyInfo.controls['bankName'].value ? this.agencyInfo.controls['bankName'].value : 'N/A';
        this.ifscCode = this.agencyInfo.controls['ifscCode'].value ? this.agencyInfo.controls['ifscCode'].value : 'N/A';
        this.title = this.previewAgency.CustomerDetails.Title ? this.previewAgency.CustomerDetails.Title : 'N/A';
        this.suffix = this.previewAgency.CustomerDetails.Suffix ? this.previewAgency.CustomerDetails.Suffix : 'N/A';
        this.userName = this.previewAgency.CustomerDetails.UserName ? this.previewAgency.CustomerDetails.UserName : 'N/A';
        this.firstName = this.previewAgency.CustomerDetails.FirstName ? this.previewAgency.CustomerDetails.FirstName : '';
        this.middleName = this.previewAgency.CustomerDetails.MiddleName ? this.previewAgency.CustomerDetails.MiddleName : '';
        this.lastName = this.previewAgency.CustomerDetails.LastName ? this.previewAgency.CustomerDetails.LastName : '';
        this.name = this.firstName + '' + this.middleName + '' + this.lastName;
        this.gender = this.previewAgency.CustomerDetails.Gender ? this.previewAgency.CustomerDetails.Gender : 'N/A';
        this.email = this.previewAgency.CustomerDetails.EmailList[0].EmailAddress ? this.previewAgency.CustomerDetails.EmailList[0].EmailAddress : 'N/A';
        this.address = this.previewAgency.CustomerDetails.FullAddress ? this.previewAgency.CustomerDetails.FullAddress : 'N/A';
        if (this.previewAgency.CustomerDetails.PhoneList.length > 0) {
          for (var i = 0; i < this.previewAgency.CustomerDetails.PhoneList.length; i++) {
            switch (this.previewAgency.CustomerDetails.PhoneList[i].Type) {
              case "MobileNo":
                this.mobile = this.previewAgency.CustomerDetails.PhoneList[i].PhoneNumber;
                break;
              case "HomePhone":
                this.phone = this.previewAgency.CustomerDetails.PhoneList[i].PhoneNumber;
                break;
            }
          }
        }
      });
  }
  resetDetails() {
    this.successMessage = '';
    if (this.update) {
      this.getAgencyBankDetails();
    }
    else {
      this.agencyInfo.reset();
      this.agencyInfo.controls['accountNo'].setValue("");
      this.agencyInfo.controls['accountType'].setValue("");
      this.agencyInfo.controls['accountName'].setValue("");
      this.agencyInfo.controls['bankName'].setValue("");
      this.agencyInfo.controls['ifscCode'].setValue("");
    }

  }
  cancel() {
    this.router.navigate(['/sac/agencysetup/manage-agency']);
  }
  back() {
    this.router.navigate(['/sac/agencysetup/agency-registration'], { queryParams: { id: this.agencyId } });
  }
  cancelPreview() {
    this.isPreview = false;
  }
}