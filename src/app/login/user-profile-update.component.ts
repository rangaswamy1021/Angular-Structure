import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { SessionService } from "../shared/services/session.service";
import { ICommonResponse } from "../shared/models/commonresponse";
import { LoginService } from "./services/login.service";
import { LookupTypeCodes, Features, Actions, SubFeatures } from "../shared/constants";
import { IUserresponse } from "../shared/models/userresponse";
import { IUserRequest } from "../shared/models/userrequest";
import { CommonService } from "../shared/services/common.service";
import { IUserEvents } from "../shared/models/userevents";
import { Router } from "@angular/router";
import { IManageUserRequest } from "../sac/usermanagement/models/manageuser.request";
import { IManageUserResponse } from "../sac/usermanagement/models/manageuser.response";
import { MaterialscriptService } from "../shared/materialscript.service";


@Component({
  selector: 'app-user-profile-update',
  templateUrl: './user-profile-update.component.html',
  styleUrls: ['./user-profile-update.component.scss']
})
export class UserProfileUpdateComponent implements OnInit {
  locationResponse: IManageUserResponse[];
  locationsRequest: IManageUserRequest;
  msgDesc: string;
  msgType: string;
  msgFlag: boolean;
  sessionContextResponse: IUserresponse;
  disableUpdateButton: boolean;
  disableCreateButton: boolean;
  globalizationRes: any;
  updateResponse: boolean;
  updateProfileRequest: IUserRequest;
  errorBlock: boolean;
  successBlock: boolean;
  longCustomerId: number;
  errorMessage: string;
  successMessage: string;
  isInvalidPassword: boolean;
  strongPass: boolean;
  goodPass: boolean;
  badPass: boolean;
  shortPass: boolean;
  currentPasswordPattern: any;  
  emailAddressPattern: any = "^[A-Za-z0-9]([_\\.\\-\\+]?[a-zA-Z0-9])*@([A-Za-z0-9]+)([\\.\\-]?[a-zA-Z0-9])*\\.([A-Za-z]{2,6})$";
  lastNamePattern: any = "[A-Za-z]*";
  profileUpdateForm: FormGroup;
  globalForm: FormGroup;
  firstNamePattern: any = "[A-Za-z]*";
  profileResponse: IUserresponse;
  showAlldata: boolean;
  updatesettings: boolean;
  updatepassword: boolean;
  showProfile: boolean;
  contextResponse: IUserresponse;
  language: ICommonResponse[];
  theme: ICommonResponse[];
  title: string;
  constructor(private materialscriptService: MaterialscriptService,private loginService: LoginService,private router: Router, private context: SessionService, private commonService: CommonService,) { }
  ngOnInit() {
      this.materialscriptService.material();
    this.sessionContextResponse = this.context.customerContext;
    this.contextResponse = this.context.customerContext;
    this.longCustomerId = this.contextResponse.userId;
    console.log("context");
    console.log(this.contextResponse);
    this.profileUpdateForm = new FormGroup({
      'firstName': new FormControl("", [Validators.required, Validators.maxLength(50), Validators.minLength(2), Validators.pattern(this.firstNamePattern)]),
      'lastName': new FormControl("", [Validators.required, Validators.maxLength(50), Validators.minLength(2), Validators.pattern(this.lastNamePattern)]),
      'emailAddress': new FormControl("", [Validators.required, Validators.maxLength(50), Validators.minLength(2), Validators.pattern(this.emailAddressPattern)]),
      'location': new FormControl("", [Validators.required])
  });
    //  this.disableCreateButton = !this.commonService.isAllowed(Features[Features.PROFILE], Actions[Actions.CREATE], "");
    this.disableUpdateButton = !this.commonService.isAllowed(Features[Features.PROFILE], Actions[Actions.UPDATE], "");


    this.globalForm = new FormGroup({
      'language': new FormControl("", [Validators.required]),
      'theme': new FormControl("", [Validators.required]),
    });

    this.getprofile();
    this.getGlobalizationDetails();
    this.loadGlobalizationDropDowns();
    this.getLocations();
  }
  getLocations(){
    this.materialscriptService.material();
    debugger;
        this.locationsRequest=<IManageUserRequest>{};
        this.locationsRequest.LocationCode='';
        this.locationsRequest.LocationName='';
        this.locationsRequest.SortColumn='LOCATIONCODE';
        this.locationsRequest.SortDir=1;
        this.locationsRequest.PageNumber=1;
        this.locationsRequest.PageSize=10;
        this.loginService.getLocations(this.locationsRequest).subscribe(res=>{
            this.locationResponse=res;
            console.log(this.locationResponse)
        })
    }
  getprofile() {
    this.materialscriptService.material();
    let userEvents = <IUserEvents>{};
    userEvents.ActionName = Actions[Actions.VIEW];
    this.userEventsCalling(userEvents);
    this.loginService.getProfileByCustomerId(this.longCustomerId,userEvents).subscribe(res => {
      this.profileResponse = res;
      console.log(this.profileResponse);
    })
  }

  editProfile(profileResponse) {
    let a=this;
    setTimeout(function() {
      a.materialscriptService.material();
    }, 100);
    setTimeout(function () { window.scrollTo(0, document.body.scrollHeight) }, 100);
    this.title = "Update Profile";
    this.showProfile = true;
    this.updatesettings = false;
    this.updatepassword = false;
    this.showAlldata = true;
    this.profileResponse.userId = this.longCustomerId;
    this.profileUpdateForm.controls['firstName'].setValue(profileResponse.FirstName);
    this.profileUpdateForm.controls['lastName'].setValue(profileResponse.LastName);
    this.profileUpdateForm.controls['emailAddress'].setValue(profileResponse.Email);
    console.log(profileResponse.LocationName);
    this.profileUpdateForm.controls['location'].setValue(profileResponse.LocationName);
    
    

  }

  updateProfile() {
    this.materialscriptService.material();
    let userEvents = <IUserEvents>{};
     userEvents.SubFeatureName = SubFeatures[SubFeatures.PROFILEINFO];     
    userEvents.ActionName = Actions[Actions.UPDATE];
    this.userEventsCalling(userEvents);

    if (this.profileUpdateForm.invalid) {
      return;
    }

    if (this.profileUpdateForm.controls['firstName'].value === this.profileResponse.FirstName &&
      this.profileUpdateForm.controls['lastName'].value === this.profileResponse.LastName &&
      this.profileUpdateForm.controls['emailAddress'].value === this.profileResponse.Email &&
      this.profileUpdateForm.controls['location'].value === this.profileResponse.LocationName) {
     this.msgFlag = true;
            this.msgType = 'error'            
            this.msgDesc = 'No profile information to update.';
     
      return;
    }
    // this.materialscriptService.material();
    this.updateProfileRequest = <IUserRequest>{};
    this.updateProfileRequest.FirstName = this.profileUpdateForm.controls['firstName'].value;
    this.updateProfileRequest.LastName = this.profileUpdateForm.controls['lastName'].value;
    this.updateProfileRequest.Email = this.profileUpdateForm.controls['emailAddress'].value;
    this.updateProfileRequest.UserName = this.contextResponse.userName;
    this.updateProfileRequest.UserId = this.longCustomerId;
    this.updateProfileRequest.RoleName = this.contextResponse.rolename;
    this.updateProfileRequest.LoginId = this.contextResponse.loginId;
    this.updateProfileRequest.NameType = "Primary";
    this.updateProfileRequest.ActivitySource = "Internal";
    let locationCode = this.locationResponse.filter(item => item.LocationName == this.profileUpdateForm.controls['location'].value)[0].LocationCode;
    this.updateProfileRequest.LocationCode=locationCode;
    this.loginService.updateProfileService(this.updateProfileRequest,userEvents).subscribe(res => {
      this.updateResponse = res;
     
      if (res) {
        this.msgFlag = true;
            this.msgType = 'success'          
            this.msgDesc = 'User Profile has been updated successfully..';
       
        this.getprofile();
        //  this.materialscriptService.material();
      }
    }, (err) => {
        this.msgFlag = true;
            this.msgType = 'error'            
            this.msgDesc = 'Error while  has been updated User Profile.';

    }
    )
    this.materialscriptService.material();
  }

  getGlobalizationDetails() {
 let userEvents = <IUserEvents>{};
    userEvents.ActionName = Actions[Actions.VIEW];
    this.userEventsCalling(userEvents);
    this.loginService.getGlobalizationServices(this.longCustomerId,userEvents).subscribe(res => {
      this.globalizationRes = res;
      
    });

  }


  loadGlobalizationDropDowns() {
    let userEvents = <IUserEvents>{};
    userEvents.ActionName = Actions[Actions.VIEW];
    this.userEventsCalling(userEvents);
    let obj = <ICommonResponse>{};
    obj.LookUpTypeCode = "Languages";
    this.loginService.getLookUpByParentLookupTypeCodeServices(obj,userEvents).subscribe(res => {
      this.language = res;
    
    });

    obj = <ICommonResponse>{};
    obj.LookUpTypeCode = "Themes";
    this.loginService.getLookUpByParentLookupTypeCodeServices(obj,userEvents).subscribe(res => {
      this.theme = res;
     
    });

  }

  editSettings(settings) {
  this.materialscriptService.material();
    this.title = "Edit Personalization Details";
    this.updatesettings = true;
    this.updatepassword = false;
    this.showProfile = false;
    this.showAlldata = true;
    this.profileResponse.userId = this.longCustomerId;
    this.globalForm.controls['language'].setValue(settings.Value);
    this.globalForm.controls['theme'].setValue(settings.Key);
      
  }

  resetSettingsClick() {
    this.globalForm.controls['language'].setValue(this.globalizationRes.Value);
    this.globalForm.controls['theme'].setValue(this.globalizationRes.Key);
    // this.materialscriptService.material();
  }

  updateSettings() {
    this.materialscriptService.material();
    let userEvents = <IUserEvents>{};
   userEvents.SubFeatureName = SubFeatures[SubFeatures.PERSONALIZATIONINFO];
    userEvents.ActionName = Actions[Actions.UPDATE];
    this.userEventsCalling(userEvents);
    
    if (this.globalForm.invalid) {
      return;
    }

    if (this.globalForm.controls['theme'].value == this.globalizationRes.Key
      && this.globalForm.controls['language'].value == this.globalizationRes.Value) {
     this.msgFlag = true;
            this.msgType = 'error'            
            this.msgDesc = "No personalization information to update";
      
      return;
    }


    let obj = {
      'Theme': this.globalForm.controls['theme'].value,
      'Language': this.globalForm.controls['language'].value,
      'UserId': this.contextResponse.userId,
      'UpdatedUser': this.contextResponse.userName,
      'LoginId': this.contextResponse.loginId

    };
    this.loginService.updateGlobalization(obj,userEvents).subscribe(res => {

      if (res) {
      this.msgFlag = true;
            this.msgType = 'success'         
            this.msgDesc = 'Globalization has been updated successfully.';
        
        this.getGlobalizationDetails();
      }
    }, (err) => {
      this.msgFlag = true;
            this.msgType = 'error'            
            this.msgDesc = err.status.tostring();


    })

  }

  removeVal() {
    this.errorBlock = false;
    this.successBlock = false;
    this.errorMessage = '';
    this.successMessage = '';
  }
  updatePassword() {
    this.materialscriptService.material();
    this.title = "Update Password";
    this.updatepassword = true;
    this.showProfile = false;
    this.updatesettings = false;
    this.showAlldata = true;

  }


  cancelBtn() {
    this.showProfile = false;
    this.errorBlock = false;
    this.successBlock = false;
    this.updatesettings = false;
    this.showAlldata = false;
    this.successMessage = "";
    this.errorMessage = "";
    this.updatepassword = false;
  }
  userEventsCalling(userEvents) {
    // let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.PROFILE];
    userEvents.ActionName = userEvents.ActionName;
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
  }


  profileReset() {
    this.materialscriptService.material();
    this.editProfile(this.profileResponse);
  }



  checkRetypePassword() {
    if (this.profileUpdateForm.controls['newPassWord'].value == "" || this.profileUpdateForm.controls['newPassWord'].value == null) {
      this.shortPass = false;
      this.badPass = false;
      this.goodPass = false;
      this.strongPass = false;
    }
    this.profileUpdateForm.controls['newPassWord'].setValidators([Validators.required, Validators.maxLength(20), Validators.minLength(7), , Validators.pattern(this.currentPasswordPattern)]);
    this.profileUpdateForm.controls['retypePassWord'].setValidators([Validators.required, Validators.maxLength(20), Validators.minLength(7), , Validators.pattern(this.currentPasswordPattern)]);
    if (this.profileUpdateForm.controls['newPassWord'].valid && this.profileUpdateForm.controls['retypePassWord'].valid) {
      if (this.profileUpdateForm.controls['newPassWord'].value == this.profileUpdateForm.controls['retypePassWord'].value) {
        this.isInvalidPassword = false;

      }
      else {
        this.isInvalidPassword = true;
      }
    }
    this.passwordStrength();
  }
  passwordStrength() {
    let score = 0

    this.shortPass = false;
    this.badPass = false;
    this.goodPass = false;
    this.strongPass = false;
    if (this.profileUpdateForm.controls.newPassWord.value.length > 0 || this.profileUpdateForm.controls.newPassWord.value.length != null || this.profileUpdateForm.controls.newPassWord.value.length != "") {
      var password = this.profileUpdateForm.controls.newPassWord.value;
      if (password.length < 7 && password.length != 0) { return this.shortPass = true }
      // if (password.toLowerCase() == newPassWord.toLowerCase()) { return this.badPass = true }
      score += password.length * 4
      score += (this.checkRepetition(1, password).length - password.length) * 1
      score += (this.checkRepetition(2, password).length - password.length) * 1
      score += (this.checkRepetition(3, password).length - password.length) * 1
      score += (this.checkRepetition(4, password).length - password.length) * 1
      //password has 3 numbers
      if (password.match(/(.*[0-9].*[0-9].*[0-9])/)) {
        score += 5
      }

      //password has 2 sybols
      if (password.match(/(.*[!,@,#,$,%,^,&,*,?,_,~].*[!,@,#,$,%,^,&,*,?,_,~])/)) {
        score += 5
      }

      //password has Upper and Lower chars
      if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) {
        score += 10
      }

      //password has number and chars
      if (password.match(/([a-zA-Z])/) && password.match(/([0-9])/)) {
        score += 10
      }
      //
      //password has number and symbol
      if (password.match(/([!,@,#,$,%,^,&,*,?,_,~])/) && password.match(/([0-9])/)) {
        score += 10
      }

      //password has char and symbol
      if (password.match(/([!,@,#,$,%,^,&,*,?,_,~])/) && password.match(/([a-zA-Z])/)) {
        score += 10
      }

      //password is just a nubers or chars
      if (password.match(/^\w+$/) || password.match(/^\d+$/)) {
        score -= 10
      }

      //verifing 0 < score < 100
      if (score < 0) {
        score = 0
      }
      if (score > 100) {
        score = 100

        return this.strongPass = true;
      }

      if (score < 34 && password.length != 0) {
        return this.badPass = true
      }
      if (score < 80 && password.length != 0) {
        return this.goodPass = true
      }
      if (score >= 80 && score <= 100) {

        return this.goodPass = true
      }

      if (password == "" || password == null) {
        this.shortPass = false;
        this.badPass = false;
        this.goodPass = false;
        this.strongPass = false;
      }
    }
    else {
      this.shortPass = false;
      this.badPass = false;
      this.goodPass = false;
      this.strongPass = false;
    }



  }
  checkRepetition(pLen, str) {
    let res = "";
    for (var i = 0; i < str.length; i++) {
      let repeated = true;
      for (var j = 0; j < pLen && (j + i + pLen) < str.length; j++)
        repeated = repeated && (str.charAt(j + i) == str.charAt(j + i + pLen))
      if (j < pLen) repeated = false
      if (repeated) {
        i += pLen - 1
        repeated = false
      }
      else {
        res += str.charAt(i)
      }
    }
    return res;
  }

  pwdChangeCanclClick() {
    this.materialscriptService.material();
    this.updatepassword = false;
    this.showAlldata = false;
  }
  setOutputFlag(e) { this.msgFlag = e; }
}
