import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CreateAccountService } from '../../shared/services/createaccount.service';
import { IMakePaymentrequest } from '../../payment/models/makepaymentrequest';
import { CustomerAccountsService } from './services/customeraccounts.service';
import { IPlanResponse } from '../../sac/plans/models/plansresponse';
import { IUserresponse } from '../../shared/models/userresponse';
import { SessionService } from '../../shared/services/session.service';
import { ISearchVehicle } from '../../vehicles/models/vehiclecrequest';
import { IVehicleResponse } from '../../vehicles/models/vehicleresponse';
import { VehicleService } from '../../vehicles/services/vehicle.services';
import { ICustomerResponse } from '../../shared/models/customerresponse';
import { CommonService } from '../../shared/services/common.service';
import { IUserEvents } from '../../shared/models/userevents';
import { SubFeatures, Actions, Features } from '../../shared/constants';
import { MaterialscriptService } from "../../shared/materialscript.service";
declare var $: any;
@Component({
  selector: 'app-create-account-vehicle-information',
  templateUrl: './create-account-vehicle-information.component.html',
  styleUrls: ['./create-account-vehicle-information.component.css']
})
export class CreateAccountVehicleInformationComponent implements OnInit {
  makepaymentrequest: IMakePaymentrequest = <IMakePaymentrequest>{};
  plansResponse: IPlanResponse[] = <IPlanResponse[]>{};
  vehicles: IVehicleResponse[];
  searchVehicle: ISearchVehicle;

  //set this value to true if business customer 
  isBusinessCustomer: boolean = false;

  //Set this valaue to false if componenet is using in create account
  isManageVehicle: boolean = false;

  // Seetings for create account
  isCreateAccount: boolean = true;
  accountID: number;
  sessionContextResponse: IUserresponse

  planID: number = 5;
  planName: string = "No Plan";
  fee: string;
  discount: string;
  isTagRequired: boolean;
  isTagMessage: string;
  txnAmount: number = 0;

  msgFlag: boolean = false;
  msgType: string
  msgTitle: string;
  msgDesc: string;

  isVehicleAvailable: boolean = false;


  constructor(private router: Router,
    private createAccountService: CreateAccountService,
    private customerAccountsService: CustomerAccountsService,
    private sessionService: SessionService,
    private vehicleService: VehicleService, private commonService: CommonService, private sessionContext: SessionService, private materialscriptService: MaterialscriptService) {
  }

  ngOnInit() {

    this.sessionContextResponse = this.sessionContext.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }

    this.createAccountService.currentContext
      .subscribe(customerContext => { this.makepaymentrequest = customerContext; }
      );
    if (this.makepaymentrequest == undefined) {
      let link = ['/csc/customerAccounts/create-account/'];
      this.router.navigate(link);
    }
    else {
      this.accountID = this.makepaymentrequest.CustomerId;
      this.planID = this.makepaymentrequest.PlanID;
      this.txnAmount = this.makepaymentrequest.TxnAmount;
      this.isBusinessCustomer = false;
      //console.log('this.makepaymentrequest.AccoutName-' + this.makepaymentrequest.AccoutName);
    }

    this.customerAccountsService.getAllPlansWithFees().subscribe(res => {
      this.plansResponse = res
      this.planName = this.plansResponse.filter(x => x.PlanId == this.planID)[0].Name;
      this.isTagRequired = this.plansResponse.filter(x => x.PlanId == this.planID)[0].IsTagRequired;
      this.fee = this.plansResponse.filter(x => x.PlanId == this.planID)[0].FeeDesc;
      this.discount = this.plansResponse.filter(x => x.PlanId == this.planID)[0].DiscountDesc;
      if (this.isTagRequired) { this.isTagMessage = "(Transponder Required)"; }
    });
  }
  navigateToPrefrences() {
    let result = false;
    this.searchVehicle = <ISearchVehicle>{};
    this.searchVehicle.vehicleNumber = "";
    this.searchVehicle.SortColumn = "VEHICLENUMBER";
    this.searchVehicle.SortDirection = true;
    this.searchVehicle.PageNumber = 1;
    this.searchVehicle.PageSize = 10;
    this.searchVehicle.accountId = this.accountID;
    this.vehicleService.getVehicles(this.searchVehicle).subscribe(
      res => {
        if (res) {
          this.vehicles = res;
          console.log('vehicles' + this.vehicles);
          this.isVehicleAvailable = true;
        }
        else
          this.isVehicleAvailable = false;
      },
      (err) => { }
      , () => {
        if (!this.isVehicleAvailable && !this.isTagRequired) {
          this.msgFlag = true;
          this.msgType = 'error'
          this.msgDesc = "To create " + this.planName + " account Vehicle Details is mandatory.";
        }
        else {
          let userEvents: IUserEvents;
          userEvents = <IUserEvents>{};
          userEvents.FeatureName = this.makepaymentrequest.FeatureName;
          userEvents.SubFeatureName = SubFeatures[SubFeatures.VEHICLEINFORMATION]
          userEvents.ActionName = Actions[Actions.CREATE];
          userEvents.PageName = this.router.url;
          userEvents.CustomerId = this.accountID;
          userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
          userEvents.UserName = this.sessionContextResponse.userName;
          userEvents.LoginId = this.sessionContextResponse.loginId;
          this.commonService.checkPrivilegeswithAuditLog(userEvents).subscribe();
          this.router.navigateByUrl('csc/customeraccounts/customer-preferences');
          let b=this;
          setTimeout(function() {
            b.materialscriptService.material();
          }, 1000);
        }
      });

  }
  navigateToPlan() {
    this.router.navigateByUrl('csc/customeraccounts/create-account-plan-selection');
  }


  cancel() {
    this.msgFlag = true;
    this.msgType = 'alert'
    this.msgDesc = "Your Information no longer exists, if you cancel your application. Are you sure you want to Cancel?";
  }

  cancelClick(event) {
    if (event) {
      this.makepaymentrequest.CustomerId = 0;
      this.createAccountService.changeResponse(this.makepaymentrequest);
      let link = ['/csc/customeraccounts/create-account-personal-information/'];
      this.router.navigate(link);
    }
    else {
      this.msgFlag = false;
    }

  }
  setOutputFlag(e) {
    this.msgFlag = e;
  }
}
