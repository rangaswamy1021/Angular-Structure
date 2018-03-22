import { Component, OnInit } from "@angular/core";
import { PopoverModule } from "ngx-bootstrap/popover";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ActivitySource, Features, Actions } from "./../../shared/constants";
import { SessionService } from "./../../shared/services/session.service";
import { ICostCenterCodeResponse } from "./models/costcentercodesresponse";
import { ICostCenterCodeRequest } from "./models/costcentercodesrequest";
import { IPaging } from "../../shared/models/paging";
import { ConfigurationService } from "./services/configuration.service";
import { ISystemActivities } from "../../shared/models/systemactivitiesrequest";
import { Router } from "@angular/router";
import { CommonService } from "../../shared/services/common.service";
import { IUserresponse } from "../../shared/models/userresponse";
import { IUserEvents } from "../../shared/models/userevents";
import { MaterialscriptService } from "../../shared/materialscript.service";
@Component({
  selector: 'app-cost-center-codes',
  templateUrl: './cost-center-codes.component.html',
  styleUrls: ['./cost-center-codes.component.scss']
})
export class CostCenterCodesComponent implements OnInit {
  msgDesc: string;
  msgType: string;
  msgFlag: boolean;
  sessionContextResponse: IUserresponse;
  disableUpdateButton: boolean;
  disableCreateButton: boolean;
  dupdescription: any;
  costCentercodeId: any;
  constructor(private configurationService: ConfigurationService, private router: Router, private commonService: CommonService, private context: SessionService, private materialscriptService: MaterialscriptService) { }
  systemActivities: ISystemActivities;
  costCenterCodeReq: ICostCenterCodeRequest;
  costCenterCodeRes: ICostCenterCodeResponse[];
  costCenterCodeForm: FormGroup;
  //for disable and enable
  enterNewDetails: boolean;
  addNewCostCenterCodeDetails: boolean = true;
  updateDetails: boolean;
  addDetails: boolean;
  //paging
  p: number;
  pageItemNumber: number = 10;
  startItemNumber: number = 1;
  endItemNumber: number;
  totalRecordCount: number;

  //request
  objCostCenterCodeRequest: ICostCenterCodeRequest = <ICostCenterCodeRequest>{};
  //create (or) Add and Update
  successMessage: string;
  errorMessage: string;
  //Validations
  validateAlphabetsPattern: any = "[A-Za-z]*";
  //focus

  ngOnInit() {
    this.materialscriptService.material();
    this.sessionContextResponse = this.context.customerContext;
    this.costCenterCodeForm = new FormGroup({
      code: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(100), Validators.pattern(this.validateAlphabetsPattern)]),
      description: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(500)])
    });
    this.p = 1;
    this.endItemNumber = this.pageItemNumber;
    this.getCostCenterCodeDetails(this.p);
    this.disableCreateButton = !this.commonService.isAllowed(Features[Features.COSTCENTERCODES], Actions[Actions.CREATE], "");
    this.disableUpdateButton = !this.commonService.isAllowed(Features[Features.COSTCENTERCODES], Actions[Actions.UPDATE], "");
  }
  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    this.getCostCenterCodeDetails(this.p);
  }
  userEventsCalling(userEvents) {
    // let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.COSTCENTERCODES];
    userEvents.ActionName = userEvents.ActionName;
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
  }
  cancelNew() {
    this.enterNewDetails = false;
    this.addNewCostCenterCodeDetails = true;
    this.updateDetails = false;
    this.addDetails = false;
    this.costCenterCodeForm.reset();
    this.errorMessage = "";
    this.successMessage = "";
  }
  addNewCostCenterCode() {
    this.enterNewDetails = true;
    this.addNewCostCenterCodeDetails = false;
    this.addDetails = true;
    this.updateDetails = false;
    this.successMessage = "";
    this.errorMessage = "";
    this.costCenterCodeForm.get('code').enable();
    this.costCenterCodeForm.reset();
  }
  closeSuccessMessage() {
    this.enterNewDetails = false;
    this.addNewCostCenterCodeDetails = true;
    this.successMessage = "";
    this.errorMessage = "";
  }
  closeErrorMessage() {
    this.enterNewDetails = true;
    this.addNewCostCenterCodeDetails = false;
    this.successMessage = "";
    this.errorMessage = "";
  }
  populateCostCenter(costCenter) {
    this.dupdescription = costCenter.Description;
    this.enterNewDetails = true;
    this.updateDetails = true;
    this.addDetails = false;
    this.addNewCostCenterCodeDetails = false;
    this.costCentercodeId = costCenter.CostCenterCodeId;
    this.costCenterCodeForm.controls["code"].setValue(costCenter.CostCenterCode);
    this.costCenterCodeForm.controls["description"].setValue(costCenter.Description);
    this.successMessage = "";
    this.errorMessage = "";
    this.costCenterCodeForm.get('code').disable();
    this.materialscriptService.material();

  }
  getCostCenterCodeDetails(PageNo: number): void {
    let userEvents = <IUserEvents>{};
    userEvents.ActionName = Actions[Actions.VIEW];
    this.userEventsCalling(userEvents);
    this.costCenterCodeReq = <ICostCenterCodeRequest>{};
    this.costCenterCodeReq.pageSize = 10;
    this.costCenterCodeReq.pageNumber = PageNo;
    this.costCenterCodeReq.sortDir = 1;
    this.costCenterCodeReq.sortColumn = "CostCentreCode";
    this.systemActivities = <ISystemActivities>{};
    this.systemActivities.LoginId = this.context.customerContext.loginId;
    this.systemActivities.UserId = this.context.customerContext.userId;
    this.systemActivities.User = this.context.customerContext.userName;
    this.systemActivities.IsViewed = true;
    this.systemActivities.ActivitySource = ActivitySource.Internal.toString();
    this.costCenterCodeReq.systemActivities = this.systemActivities;
    this.configurationService.getCostcentercodes(this.costCenterCodeReq, userEvents).subscribe(
      res => {
        this.costCenterCodeRes = res;
        this.totalRecordCount = this.costCenterCodeRes[0].ReCount;
        if (this.totalRecordCount < this.pageItemNumber) {
          this.endItemNumber = this.totalRecordCount;
        }
        else {
          this.endItemNumber = ((this.p) * this.pageItemNumber);
          if (this.endItemNumber > this.totalRecordCount) {
            this.endItemNumber = this.totalRecordCount
          }
        }
      }
    )
  }
  createCostCenterCodeDetails() {
    let userEvents = <IUserEvents>{};
    userEvents.ActionName = Actions[Actions.CREATE];
    this.userEventsCalling(userEvents);
    this.successMessage = "";
    this.errorMessage = "";

    if (this.costCenterCodeForm.valid) {
      this.costCenterCodeReq.costCenterCode = this.costCenterCodeForm.controls['code'].value;
      this.costCenterCodeReq.description = this.costCenterCodeForm.controls['description'].value;
    }
    this.systemActivities.LoginId = this.context.customerContext.loginId;
    this.systemActivities.UserId = this.context.customerContext.userId;
    this.systemActivities.User = this.context.customerContext.userName;
    this.systemActivities.IsViewed = true;
    this.systemActivities.ActivitySource = ActivitySource.Internal.toString();
    this.costCenterCodeReq.systemActivities = this.systemActivities;
    if (this.costCenterCodeForm.valid) {
      this.configurationService.createCostCenterCodes(this.costCenterCodeReq, userEvents).subscribe(
        res => {
          if (res) {
            this.msgFlag = true;
            this.msgType = 'success'
            //this.msgTitle = 'Success Message'
            this.msgDesc = 'Cost Center Code has been added successfully.'

            this.getCostCenterCodeDetails(this.p);
            this.enterNewDetails = false;
            this.addNewCostCenterCodeDetails = true;
            this.updateDetails = false;
            this.addDetails = false;
          }
        }
        , err => {
          this.msgFlag = true;
          this.msgType = 'error'
          //this.msgTitle = 'Success Message'
          this.msgDesc = 'Cost Center Code Already Exists.'


        });
    }
    else {
      //this.errorMessage = "Enter all mandatory fields";
      this.validateAllFormFields(this.costCenterCodeForm);
    }
  }
  updateCostCenter() {

    this.errorMessage = "";
    this.successMessage = "";
    if (this.costCenterCodeForm.controls['description'].value == "") {
      this.costCenterCodeForm.controls["description"].markAsTouched({ onlySelf: true });
    }
    else if (this.costCenterCodeForm.controls['description'].value == this.dupdescription) {
      this.msgFlag = true;
      this.msgType = 'error'
      //this.msgTitle = 'Success Message'
      this.msgDesc = 'No changes to update.'

    }
    else {
      this.updateCostCenterDetails();
    }
  }

  updateCostCenterDetails() {
    let userEvents = <IUserEvents>{};
    userEvents.ActionName = Actions[Actions.UPDATE];
    this.userEventsCalling(userEvents);
    this.enterNewDetails = false;
    this.addNewCostCenterCodeDetails = true;
    this.updateDetails = false;
    this.addDetails = false;
    if (this.costCenterCodeForm.valid) {
      this.costCenterCodeReq.costCenterCodeId = this.costCentercodeId;
      this.costCenterCodeReq.costCenterCode = this.costCenterCodeForm.controls['code'].value;
      this.costCenterCodeReq.description = this.costCenterCodeForm.controls['description'].value;
    }
    this.systemActivities.LoginId = this.context.customerContext.loginId;
    this.systemActivities.UserId = this.context.customerContext.userId;
    this.systemActivities.User = this.context.customerContext.userName;
    this.systemActivities.IsViewed = true;
    this.systemActivities.ActivitySource = ActivitySource.Internal.toString();
    this.costCenterCodeReq.systemActivities = this.systemActivities;
    if (this.costCenterCodeForm.valid) {
      this.configurationService.updateCostCenterCode(this.costCenterCodeReq, userEvents).subscribe(
        res => {
          if (res) {
            this.msgFlag = true;
            this.msgType = 'success'
            //this.msgTitle = 'Success Message'
            this.msgDesc = 'Cost Center Code has been updated successfully.'

            this.getCostCenterCodeDetails(this.p);
            this.costCenterCodeForm.reset();
          }
        }
        , err => {
          this.msgFlag = true;
          this.msgType = 'error'
          //this.msgTitle = 'Success Message'
          this.msgDesc = 'Error occurred while updating the Cost Center Code.'

        });
    }
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
  setOutputFlag(e) { this.msgFlag = e; }
}
