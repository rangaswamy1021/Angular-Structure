import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { CashManagementService } from "./services/cashmanagement.service";
import { IaddCashDetailsResponse } from "./models/addcashdetailsresponse";
import { IaddCashDetailsRequest } from "./models/addcashdetailsrequest";
import { AccountingService } from "../accounting/services/accounting.service";
import { SessionService } from "../../shared/services/session.service";
import { IcashDenominationRequest } from "./models/objcashdenominationrequest";
import { IcreatedUserRequest } from "./models/objchangefundRequest";
import { IUserEvents } from "../../shared/models/userevents";
import { IUserresponse } from '../../shared/models/userresponse';
import { Router } from '@angular/router';
import { Actions, LookupTypeCodes, ActivitySource, Features } from '../../shared/constants';
import { CommonService } from "../../shared/services/common.service";
@Component({
    selector: 'app-add-cash-details',
    templateUrl: './add-cash-details.component.html',
    styleUrls: ['./add-cash-details.component.scss']
})
export class AddCashDetailsComponent implements OnInit {
    msgDesc: string;
    msgType: string;
    msgFlag: boolean;
    ddenomPenny: any;
    ddenomDime: any;
    ddenomNickel: any;
    ddenomHalf: any;
    ddenom1: any;
    ddenom2: any;
    ddenomQuater: any;
    ddenom5: any;
    ddenom20: any;
    ddenom10: any;
    ddenom50: any;
    ddenom100: any;
    totalAmount: any;
    beginAmount: any;
    assignChangeFundtResponse: IaddCashDetailsResponse;
    BeginofAmount: any;
    endAmount: any;
    beginAmountResponse: IaddCashDetailsResponse;
    objAddCashDetailsRequest: IaddCashDetailsRequest;
    objcreatedUser: IcreatedUserRequest;
    objCashDenomination: IcashDenominationRequest;
    alert: boolean;
    denom100: any;
    denom50: any;
    denom20: any;
    denom10: any;
    denom5: any;
    denom2: any;
    denom1: any;
    denomHalf: any;
    denomQuater: any;
    denomDime: any;
    denomNickel: any;
    denomPenny: any;
    disableSubmit: boolean;
    sessionContextResponse: IUserresponse;
    locations = [];
    constructor(private objcashManagement: CashManagementService, private sessionService: SessionService, private commonService: CommonService, private router: Router) { }

    ngOnInit() {
        this.alert = true;
        this.sessionContextResponse = this.sessionService.customerContext;
        let userEvents = <IUserEvents>{};
        userEvents.FeatureName = Features[Features.CASHMANAGEMENT];
        userEvents.ActionName = Actions[Actions.VIEW];
        userEvents.PageName = this.router.url;
        userEvents.CustomerId = 0;
        userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
        userEvents.UserName = this.sessionContextResponse.userName;
        userEvents.LoginId = this.sessionContextResponse.loginId;
        this.sessionContextResponse = this.sessionService.customerContext;
        this.commonService.getLocations(userEvents).subscribe(res => { });
        this.disableSubmit = !this.commonService.isAllowed(Features[Features.CASHMANAGEMENT], Actions[Actions.CREATE], "");
        this.amountReset();
        this.getBeginAmountForCashManagement();
        this.calculateTotal();
    }
    
    raiseAlertError() {
        this.msgType = "alert";
        this.msgFlag = true;
        this.msgDesc = "  Are you sure you want to close the alert?";
    }
   

    calculateTotal() {
        this.assignMultipliedAmount();
        this.totalAmount = (this.ddenom100 * 100 + this.ddenom50 * 50 +
            this.ddenom20 * 20 + this.ddenom10 * 10 + this.ddenom5 * 5
            + this.ddenom2 * 2 + this.ddenom1 * 1 + this.ddenomHalf * 0.5
            + this.ddenomQuater * 0.25 + this.ddenomDime * 0.1 +
            this.ddenomNickel * 0.05 + this.ddenomPenny * 0.01);
        this.totalAmount = (this.totalAmount == 0 ? '' : this.totalAmount);
    }

    assignMultipliedAmount() {
        this.ddenom100 = (this.denom100 == '' ? 0 : this.denom100);
        this.ddenom50 = (this.denom50 == '' ? 0 : this.denom50);
        this.ddenom20 = (this.denom20 == '' ? 0 : this.denom20);
        this.ddenom10 = (this.denom10 == '' ? 0 : this.denom10);
        this.ddenom5 = (this.denom5 == '' ? 0 : this.denom5);
        this.ddenom2 = (this.denom2 == '' ? 0 : this.denom2);
        this.ddenom1 = (this.denom1 == '' ? 0 : this.denom1);
        this.ddenomHalf = (this.denomHalf == '' ? 0 : this.denomHalf);
        this.ddenomQuater = (this.denomQuater == '' ? 0 : this.denomQuater);
        this.ddenomDime = (this.denomDime == '' ? 0 : this.denomDime);
        this.ddenomNickel = (this.denomNickel == '' ? 0 : this.denomNickel);
        this.ddenomPenny = (this.denomPenny == '' ? 0 : this.denomPenny);
    }

    amountReset() {

        this.totalAmount = ''; this.denom100 = ''; this.denom50 = ''; this.denom20 = '';
        this.denom10 = ''; this.denom5 = ''; this.denom2 = '';
        this.denom1 = ''; this.denomHalf = ''; this.denomQuater = '';
        this.denomDime = ''; this.denomNickel = ''; this.denomPenny = '';
        this.ddenom100 = 0; this.ddenom50 = 0; this.ddenom20 = 0;
        this.ddenom10 = 0; this.ddenom5 = 0; this.ddenom2 = 0;
        this.ddenom1 = 0; this.ddenomHalf = 0; this.ddenomQuater = 0;
        this.ddenomDime = 0; this.ddenomNickel = 0; this.ddenomPenny = 0;

    }

    getBeginAmountForCashManagement(): void {
        this.objcashManagement.getBeginAmountForCashManagement().subscribe(
            res => {
                this.beginAmountResponse = res;
                this.endAmount = res[0].EndofAmount;
                this.beginAmount = res[0].BeginofAmount;

            });
    }

    assignChangeFund(): void {
        if (this.totalAmount == '') {
            this.errorMessageBlock("Quantity is required for any one of the denomination.")
        } else {
            this.denom100 = (this.denom100 == '' ? 0 : this.denom100);
            this.denom50 = (this.denom50 == '' ? 0 : this.denom50);
            this.denom20 = (this.denom20 == '' ? 0 : this.denom20);
            this.denom10 = (this.denom10 == '' ? 0 : this.denom10);
            this.denom5 = (this.denom5 == '' ? 0 : this.denom5);
            this.denom2 = (this.denom2 == '' ? 0 : this.denom2);
            this.denom1 = (this.denom1 == '' ? 0 : this.denom1);
            this.denomHalf = (this.denomHalf == '' ? 0 : this.denomHalf);
            this.denomQuater = (this.denomQuater == '' ? 0 : this.denomQuater);
            this.denomDime = (this.denomDime == '' ? 0 : this.denomDime);
            this.denomNickel = (this.denomNickel == '' ? 0 : this.denomNickel);
            this.denomPenny = (this.denomPenny == '' ? 0 : this.denomPenny);
            this.objAddCashDetailsRequest = <IaddCashDetailsRequest>{};
            this.objcreatedUser = <IcreatedUserRequest>{};
            this.objCashDenomination = <IcashDenominationRequest>{};
            this.objcreatedUser.CreatedUser = this.sessionService.customerContext.userName;
            this.objcreatedUser.UpdatedUser = this.sessionService.customerContext.userName;
            this.objcreatedUser.LoginId = this.sessionService.customerContext.loginId;
            this.objcreatedUser.CustomerID = this.sessionService.customerContext.userId;
            this.objcreatedUser.Date = new Date();
            this.objcreatedUser.PerformedBy = this.sessionService.customerContext.userName;
            this.objcreatedUser.ActivitySource = ActivitySource[ActivitySource.Internal];
            this.objcreatedUser.ViewFlag = "UPDATE";
            this.objcreatedUser.EndofAmount = this.totalAmount;
            this.objCashDenomination.CreatedUser = this.sessionService.customerContext.userName;
            this.objCashDenomination.UpdatedUser = this.sessionService.customerContext.userName;
            this.objCashDenomination.Hundreds = ((this.denom100 == '' ? 0 : this.denom100) == null ? 0 : this.denom100);
            this.objCashDenomination.Fifties = ((this.denom50 == '' ? 0 : this.denom50) == null ? 0 : this.denom50);//this.denom50;
            this.objCashDenomination.Twenties = ((this.denom20 == '' ? 0 : this.denom20) == null ? 0 : this.denom20);//this.denom20;
            this.objCashDenomination.Tens = ((this.denom10 == '' ? 0 : this.denom10) == null ? 0 : this.denom10);//this.denom10;
            this.objCashDenomination.Fives = ((this.denom5 == '' ? 0 : this.denom5) == null ? 0 : this.denom5);//this.denom5;
            this.objCashDenomination.Twos = ((this.denom2 == '' ? 0 : this.denom2) == null ? 0 : this.denom2);//this.denom2;
            this.objCashDenomination.Ones = ((this.denom1 == '' ? 0 : this.denom1) == null ? 0 : this.denom1);//this.denom1;
            this.objCashDenomination.Halfs = ((this.denomHalf == '' ? 0 : this.denomHalf) == null ? 0 : this.denomHalf);//this.denomHalf;
            this.objCashDenomination.Quarters = ((this.denomQuater == '' ? 0 : this.denomQuater) == null ? 0 : this.denomQuater);//this.denomQuater;
            this.objCashDenomination.Dimes = ((this.denomDime == '' ? 0 : this.denomDime) == null ? 0 : this.denomDime);//this.denomDime;
            this.objCashDenomination.Nickles = ((this.denomNickel == '' ? 0 : this.denomNickel) == null ? 0 : this.denomNickel);//this.denomNickel;
            this.objCashDenomination.Pennies = ((this.denomPenny == '' ? 0 : this.denomPenny) == null ? 0 : this.denomPenny);//this.denomPenny;
            this.objCashDenomination.Type = "Float";
            this.objCashDenomination.User = this.sessionService.customerContext.userName;
            this.objAddCashDetailsRequest.objChangeFund = this.objcreatedUser;
            this.objAddCashDetailsRequest.objCashDenomination = this.objCashDenomination;
            this.sessionContextResponse = this.sessionService.customerContext;
            let userEvents = <IUserEvents>{};
            userEvents.FeatureName = Features[Features.CASHMANAGEMENT];
            userEvents.ActionName = Actions[Actions.CREATE];
            userEvents.PageName = this.router.url;
            userEvents.CustomerId = 0;
            userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
            userEvents.UserName = this.sessionContextResponse.userName;
            userEvents.LoginId = this.sessionContextResponse.loginId;
            this.objcashManagement.assignChangeFund(this.objAddCashDetailsRequest, userEvents).subscribe(
                res => {
                    this.assignChangeFundtResponse = res;
                    this.successMessageBlock("Change Fund Details are created successfully");
                    this.amountReset();
                },

                err => {
                    this.errorMessageBlock(err.statusText.toString());
                }
            );
        }
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
    btnYesClick(event) {
        if (event) {
            this.alert = false;
        }
    }

}
