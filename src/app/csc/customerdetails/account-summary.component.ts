import { ApplicationParameterkey } from './../../shared/applicationparameter';
import { Actions } from './../../shared/constants';
import { IMakePaymentrequest } from '../../payment/models/makepaymentrequest';
import { CreateAccountService } from '../../shared/services/createaccount.service';
import { AccountStatus } from '../search/constants';
import { IActivityRequest } from '../../shared/models/activitesrequest';
import { ICustomerResponse } from '../../shared/models/customerresponse';
import { IBalanceResponse } from './models/balanceresponse';
import { Data, Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';

import { CustomerDetailsService } from './services/customerdetails.service';

import { ITagRequest } from "./models/TagRequest";
import { IProfileRequest } from "./models/profilerequest";
import { IDiscountRequest } from "./models/discountrequest";
import { IDocumentsRequest } from "../documents/models/documentsrequest";
import { ITransactionRequest } from "../../shared/models/transactionrequest";

import { IVehicleResponse } from '../../shared/models/vehicleresponse';
import { IActivityResponse } from '../../shared/models/activitiesresponse';
import { ITagResponse } from "../../shared/models/tagresponse";
import { IComplaintResponse } from "../../shared/models/complaintsresponse";
import { IDiscountResponse } from "./models/discountsresponse";
import { IDocumentsResponse } from "../documents/models/documentsresponse";
import { IPaging } from "../../shared/models/paging";
import { ITransactionResponse } from "../../shared/models/transactionresponse";
import { IAccountSummartRequest } from "./models/accountsummaryrequest";
import { IRecentPaymentRequest } from "./models/recentpaymentRequest";
import { IRecentPaymentsResponse } from "./models/recentpaymentsresponse";
import { ActivitySource, AppSettings, SubSystem, Features } from '../../shared/constants';
import { ICustomerContextResponse } from "../../shared/models/customercontextresponse";
import { CustomerContextService } from "../../shared/services/customer.context.service";
import { ISystemActivities } from "../../shared/models/systemactivitiesrequest";
import { SessionService } from '../../shared/services/session.service';
import { IUserresponse } from '../../shared/models/userresponse';
import { LoginService } from "../../login/services/login.service";
import { IProfileResponse } from "../search/models/ProfileResponse";
import { AccountInfoComponent } from '../../shared/accountprimaryinfo/account-info.component';
import { IUserEvents } from '../../shared/models/userevents';
import { CommonService } from '../../shared/services/common.service';


@Component({
        selector: 'app-account-summary',
        templateUrl: './account-summary.component.html',
        styleUrls: ['./account-summary.component.css']
})
export class AccountSummaryComponent implements OnInit {
        disableContinueButton: boolean = false;
        disableSplitButton: boolean = false;
        accountSummartReq: IAccountSummartRequest;
        tagRequest: ITagRequest;
        profileRequest: IProfileRequest;
        discountRequest: IDiscountRequest;
        documentsRequest: IDocumentsRequest;
        recentPaymentReq: IRecentPaymentRequest;
        defaultCardDetails: any;
        recordCount: number = 5;
        linkSourceName: string = 'internal';
        longAccountId: number = 0;
        tagRes: ITagResponse[];
        complaintsRes: IComplaintResponse[];
        profileResponse: IProfileResponse[];
        discountResponse: IDiscountResponse[];
        documentsResponse: IDocumentsResponse[];
        transactionResponse: ITransactionResponse[];
        activityRes: IActivityResponse[];
        vehicleRes: IVehicleResponse[];
        recentPaymentRes: IRecentPaymentsResponse[];
        rewardbalanceRes: IBalanceResponse
        customerInformationres: ICustomerResponse
        customerResponse: ICustomerResponse;
        //paymentdetailsRes: IRecentPaymentsResponse;
        activityRequest: IActivityRequest;
        sysytemActivities: ISystemActivities;
        tagRequired: boolean;
        IsTagAllowforPostpaid: number = 0;
        allowTags:boolean=false;

        longParentId: number;
        customerContextResponse: ICustomerContextResponse;
        makePaymentRequest: IMakePaymentrequest;
        sessionContextResponse: IUserresponse;
        @ViewChild(AccountInfoComponent) accountSummaryComp;


        constructor(private customerDetailsService: CustomerDetailsService, private customerContext: CustomerContextService,
                private router: Router, private route: ActivatedRoute, private createAccountService: CreateAccountService, private sessionContext: SessionService,
                private loginService: LoginService, private commonService: CommonService, ) {
                this.sessionContextResponse = this.sessionContext.customerContext;


        }

        ngOnInit() {
                //disabled split button if create privileges not exist.
                this.disableSplitButton = !this.commonService.isAllowed(Features[Features.SPLITCUSTOMER], Actions[Actions.CREATE], "");
                this.disableContinueButton = !this.commonService.isAllowed(Features[Features.CREATEACCOUNT], Actions[Actions.CREATE], "");

                //hide account summary button i.e navigation from other pages.
                this.accountSummaryComp.hideAccountSummary();
                this.customerContext.currentContext
                        .subscribe(customerContext => { this.customerContextResponse = customerContext; }
                        );
                if (this.customerContextResponse.AccountId > 0 && this.customerContextResponse.AccountId !== undefined) {
                        //need to pass child customer id.
                        let AccountId = this.customerContextResponse.ParentId > 0 ? this.customerContextResponse.ChildCustomerId : this.customerContextResponse.AccountId;
                        this.bindAccountSummaryInformation(AccountId);
                }
        }

        bindAccountSummaryInformation(accountId: number) {
                this.customerDetailsService.bindCustomerInfoDetails(accountId).subscribe(
                        res => {
                                this.customerInformationres = res;

                        }, (err) => { }
                        , () => {
                                if (this.customerInformationres) {
                                        this.tagRequired = this.customerInformationres.IsTagRequired;
                                        this.longAccountId = this.customerInformationres.ParentId > 0 ? this.customerInformationres.ParentId : this.customerContextResponse.AccountId;
                                        //reassigning AccountId value to the parent Id if parent exist.
                                        this.customerContextResponse.AccountId = this.customerInformationres.ParentId > 0 ? this.customerInformationres.ParentId : this.customerContextResponse.AccountId;
                                        if (this.customerContextResponse.isNavigateFromSearch) {
                                                this.insertActivity();
                                                this.customerContextResponse.isNavigateFromSearch = false;
                                        }
                                        this.getVehicles();
                                        if (!this.tagRequired) {
                                                if (this.customerInformationres.ParentPlanName.toUpperCase() == 'POSTPAID') {
                                                        this.commonService.getApplicationParameterValue(ApplicationParameterkey.VehicleswithTranspondersforPostpaidVideo).subscribe(
                                                                res => {
                                                                        this.IsTagAllowforPostpaid = res;
                                                                        if (this.IsTagAllowforPostpaid == 1) {  
                                                                                this.allowTags=true;                                                                     
                                                                                this.getTagDetails();
                                                                        }
                                                                });
                                                }
                                        }
                                        else {
                                                this.allowTags=true;
                                                this.getTagDetails();
                                        }
                                        this.getComplaintByAccount();
                                        this.bindAdditionalContactInSummary();
                                        this.getActiveDiscounts();
                                        this.getOutBoundDetailsByCustomerId();
                                        this.getAutoRebillActivities();
                                        this.getActivities();
                                }
                        });
        }


        getActivities() {
                this.accountSummartReq = <IAccountSummartRequest>{};
                this.accountSummartReq.AccountId = this.longAccountId;
                this.accountSummartReq.ActivityCount = this.recordCount;
                this.accountSummartReq.LinkSourceName = this.linkSourceName;
                this.customerDetailsService.getActivities(this.accountSummartReq)
                        .subscribe(res => {
                                this.activityRes = res
                        });
        }

        getVehicles() {
                this.accountSummartReq = <IAccountSummartRequest>{};
                this.accountSummartReq.AccountId = this.longAccountId;
                this.accountSummartReq.SortColumn = "VEHICLENUMBER";
                this.accountSummartReq.CurrentDateTime = new Date();
                this.accountSummartReq.SortDirection = true;
                this.accountSummartReq.PageSize = 5;
                this.accountSummartReq.PageNumber = 1;
                this.customerDetailsService.getVehicles(this.accountSummartReq)
                        .subscribe(res => {
                                this.vehicleRes = res
                        });
        }


        getTagDetails() {
                this.tagRequest = <ITagRequest>{};
                this.tagRequest.CustomerId = this.longAccountId;
                this.tagRequest.SortColumn = "SERIALNO";
                this.tagRequest.CurrentDateTime = new Date();
                this.tagRequest.SortDirection = true;
                this.tagRequest.PageSize = 5;
                this.tagRequest.PageNumber = 1;
                this.tagRequest.ActivitySource = this.linkSourceName;
                this.customerDetailsService.getTagsByAccount(this.tagRequest)
                        .subscribe(res => {
                                this.tagRes = res
                        });
        }

        getComplaintByAccount() {
                this.customerDetailsService.getComplaintByAccount(this.longAccountId)
                        .subscribe(res => {
                                this.complaintsRes = res
                        });
        }

        bindAdditionalContactInSummary() {
                this.profileRequest = <IProfileRequest>{};
                this.profileRequest.AccountId = this.longAccountId;
                this.profileRequest.SortColumn = "CUSTOMERID";
                this.profileRequest.SortDirection = true;
                this.profileRequest.PageSize = 5;
                this.profileRequest.PageNumber = 1;
                this.customerDetailsService.bindAdditionalContactInSummary(this.profileRequest)
                        .subscribe(res => {
                                this.profileResponse = res
                        });
        }

        getActiveDiscounts() {
                this.discountRequest = <IDiscountRequest>{};
                this.discountRequest.CustomerId = this.longAccountId;
                this.discountRequest.SortColumn = "CUSTOMERID";
                this.discountRequest.SortDirection = 1;
                this.discountRequest.PageSize = 5;
                this.discountRequest.PageNumber = 1;
                this.customerDetailsService.getActiveDiscounts(this.discountRequest)
                        .subscribe(res => {
                                this.discountResponse = res
                        });
        }


        getOutBoundDetailsByCustomerId() {
                this.documentsRequest = <IDocumentsRequest>{};
                this.documentsRequest.CustomerId = this.longAccountId;
                this.documentsRequest.BoundType = "OutBound";
                this.documentsRequest.DocumentType = "Statement" + "," + "Invoices" + "," + "PrintInterface" + "," + "PaymentReceipt" + "," + "BusinessDocument" + "," + "AdHocStatements" + "," + "CloseAccountReq";
                this.documentsRequest.Paging = <IPaging>{};
                this.documentsRequest.Paging.PageNumber = 1;
                this.documentsRequest.Paging.PageSize = 5;
                this.documentsRequest.Paging.SortColumn = "GENERATEDDATE";
                this.documentsRequest.Paging.SortDir = 1;
                this.documentsRequest.DocumentStatus = "ALL";
                this.customerDetailsService.getOutBoundDetailsByCustomerId(this.documentsRequest)
                        .subscribe(res => {
                                this.documentsResponse = res

                        });
        }

        getAutoRebillActivities() {
                this.recentPaymentReq = <IRecentPaymentRequest>{};
                this.recentPaymentReq.PageNumber = 1;
                this.recentPaymentReq.PageSize = 5;
                this.recentPaymentReq.SortColumn = "CUSTOMERID";
                this.recentPaymentReq.SortDir = 1;
                this.recentPaymentReq.IsProtected = true;
                this.recentPaymentReq.AccountId = this.longAccountId;
                this.customerDetailsService.getAutoRebillActivities(this.recentPaymentReq).subscribe(
                        res => {
                                this.recentPaymentRes = res
                        });
        }

        insertActivity() {
                this.activityRequest = <IActivityRequest>{};
                this.activityRequest.CustomerId = this.longAccountId;
                this.activityRequest.Type = "ACOUNTACCESS";
                this.activityRequest.Activity = "Account has been accessed";
                this.activityRequest.Linkid = this.longAccountId;
                this.activityRequest.Subsystem = SubSystem[SubSystem.CSC];
                this.activityRequest.LinkSourceName = "CUSTOMERS";
                this.activityRequest.PerformedBy = this.sessionContextResponse.userId.toString();
                this.activityRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
                this.activityRequest.User = this.sessionContextResponse.userName;

                this.sysytemActivities = <ISystemActivities>{};
                this.sysytemActivities.UserId = this.sessionContextResponse.userId; // need to change
                this.sysytemActivities.FeaturesCode = "ACCOUNT";
                this.sysytemActivities.ActionCode = "SEARCH";
                this.sysytemActivities.LoginId = this.sessionContextResponse.loginId; // need to change
                this.sysytemActivities.KeyValue = "0";
                this.sysytemActivities.CustomerId = this.longAccountId; // need to change
                this.sysytemActivities.User = this.sessionContextResponse.userName;
                this.sysytemActivities.ActivityTypeDescription = "Account has  been accessed";
                this.sysytemActivities.ActivitySource = ActivitySource[ActivitySource.Internal];
                this.activityRequest.SystemActivities = this.sysytemActivities;
                this.customerDetailsService.insertActivity(this.activityRequest).subscribe();

        }

        // exitClick() {
        //         const context: ICustomerContextResponse = <ICustomerContextResponse>{};
        //         this.customerContext.changeResponse(context);
        //         // let link =;

        //         // this.sessionContext.changeResponse(null);
        //         this.loginService.setCustomerContext(null);
        //         this.router.navigate( ['csc/search/advance-csc-search']);
        //        console.log(this.route.queryParams)
        // }

        continueButtonClick() {

                // let userEvents = <IUserEvents>{};
                // userEvents.FeatureName = Features[Features.CREATEACCOUNT];
                // userEvents.ActionName = Actions[Actions.VIEW];
                // userEvents.PageName = this.router.url;
                // userEvents.CustomerId = 0;
                // userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
                // userEvents.UserName = this.sessionContextResponse.userName;
                // userEvents.LoginId = this.sessionContextResponse.loginId;
                // this.commonService.checkPrivilegeswithAuditLog(userEvents).subscribe();

                this.makePaymentRequest = <IMakePaymentrequest>{};
                this.makePaymentRequest.CustomerId = this.longAccountId;
                this.makePaymentRequest.FeatureName = Features[Features.CREATEACCOUNT];
                this.createAccountService.changeResponse(this.makePaymentRequest);
                let link = ['/csc/customeraccounts/create-account-plan-selection/'];
                this.router.navigate(link);
        }

        splitCustomerClick() {
                let link = ['/csc/customeraccounts/split-account/'];
                this.router.navigate(link);
        }

}


