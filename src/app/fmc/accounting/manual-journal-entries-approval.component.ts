import { Component, OnInit } from "@angular/core";
import { IManualGLtransactionResponse } from "./models/manualgltransactionresponse";
import { IManualGLtransactionRequest } from "./models/manualgltransactionrequest";
import { SessionService } from "../../shared/services/session.service";
import { ActivitySource, Features, Actions } from "../../shared/constants";
import { Router } from "@angular/router";
import { ISystemActivities } from "../../shared/models/systemactivitiesrequest";
import { AccountingService } from "./services/accounting.service";
import { IUserEvents } from "../../shared/models/userevents";
import { CommonService } from "../../shared/services/common.service";
import { IUserresponse } from "../../shared/models/userresponse";
@Component({
    selector: 'app-manual-journal-entries-approval',
    templateUrl: './manual-journal-entries-approval.component.html',
    styleUrls: ['./manual-journal-entries-approval.component.scss']
})
export class ManualJournalEntriesApprovalComponent implements OnInit {
    sessionContextResponse: IUserresponse;
    disableApproveButton: boolean;
    length: number;
    objManualGlTransactionRequest: IManualGLtransactionRequest;
    objManualGlTransactionRequestlst: IManualGLtransactionRequest[];
    objManualGlTransactionResponse: IManualGLtransactionResponse[];
    getManualGlTxnsresponse: IManualGLtransactionResponse[] = [];
    approveData: IManualGLtransactionResponse[];
    getManualGlTxnsLenght: number;
    objApprove: any;
    p: number;
    pageItemNumber: number = 10;
    startItemNumber: number = 1;
    endItemNumber: number;
    totalRecordCount: number;
    msgFlag: boolean;
    msgType: string;
    msgDesc: string;
    constructor(private sessionContext: SessionService, private objAccountingService: AccountingService, private router: Router, private commonService: CommonService) { }

    ngOnInit() {
        this.sessionContextResponse = this.sessionContext.customerContext;
        let userEvents: IUserEvents;
        userEvents = <IUserEvents>{};
        userEvents.ActionName = Actions[Actions.VIEW];
        this.userEventsCalling(userEvents);
        this.commonService.getLocations(userEvents).subscribe(res => { });
        this.disableApproveButton = !this.commonService.isAllowed(Features[Features.MANUALGLTRANSACTIONS], Actions[Actions.APPROVE], "");
        this.p = 1;
        this.endItemNumber = 10;
        this.getManualGlTxns(this.p);
    }

    approvePopup(selectedRow) {
        this.objApprove = selectedRow;
        this.msgType="alert";
        this.msgFlag=true;
        this.msgDesc="Are you sure to Approve the Manual General Journal Transaction?";
    }
    approveManualGLTransactions(): void {
        let items = [];
        this.objManualGlTransactionRequest = <IManualGLtransactionRequest>{};
        this.objManualGlTransactionRequest.SystemActivity = <ISystemActivities>{};
        this.objManualGlTransactionRequest.ManualGLTxnId = this.objApprove.ManualGLTxnId;
        this.objManualGlTransactionRequest.User = this.sessionContext.customerContext.userName;
        this.objManualGlTransactionRequest.IsApproved = true;
        this.objManualGlTransactionRequest.SystemActivity.LoginId = this.sessionContext.customerContext.loginId;
        this.objManualGlTransactionRequest.SystemActivity.UserId = this.sessionContext.customerContext.userId;
        this.objManualGlTransactionRequest.SystemActivity.User = this.sessionContext.customerContext.userName;
        this.objManualGlTransactionRequest.SystemActivity.ActivitySource = ActivitySource[ActivitySource.Internal];
        items.push(this.objManualGlTransactionRequest);
        this.objManualGlTransactionRequestlst = items.map(x => Object.assign({}, x));
        let userEvents: IUserEvents = <IUserEvents>{};
        userEvents.ActionName = Actions[Actions.APPROVE];
        this.userEventsCalling(userEvents);
        this.objAccountingService.approveManualGLTransactions(this.objManualGlTransactionRequestlst, userEvents).subscribe(
            res => {
                if (res) {
                    this.successMessageBlock("Manual General Journal Transactions has been approved successfully");
                    if (this.length == 1) {
                        this.pageChanged(((this.p) - 1));
                    } else {
                        this.getManualGlTxns(this.p);
                    }
                }
                else {
                    this.errorMessageBlock("Error while approving the Manual Journal Transaction.");
                    this.getManualGlTxns(this.p);
                }

            },
            (err) => {
                this.errorMessageBlock(err.statusText.toString());
            }
        );
    }

    getManualGlTxns(pageNo: number): void {
        this.objManualGlTransactionRequest = <IManualGLtransactionRequest>{};
        this.objManualGlTransactionRequest.SystemActivity = <ISystemActivities>{};
        this.objManualGlTransactionRequest.PageNumber = pageNo;
        this.objManualGlTransactionRequest.PageSize = this.pageItemNumber;
        this.objManualGlTransactionRequest.SortColumn = "MANUALGLTXNID";
        this.objManualGlTransactionRequest.SortDir = 1;
        this.objManualGlTransactionRequest.SystemActivity.LoginId = this.sessionContext.customerContext.loginId;
        this.objManualGlTransactionRequest.SystemActivity.UserId = this.sessionContext.customerContext.userId;
        this.objManualGlTransactionRequest.SystemActivity.IsViewed = true;
        this.objManualGlTransactionRequest.SystemActivity.User = this.sessionContext.customerContext.userName;
        this.objManualGlTransactionRequest.SystemActivity.ActivitySource = ActivitySource[ActivitySource.Internal];
        this.objAccountingService.getManualGlTxns(this.objManualGlTransactionRequest).subscribe(
            res => {
                this.getManualGlTxnsresponse = res;
                this.length = res.length;
                if (res.length > 0) {
                    this.totalRecordCount = this.getManualGlTxnsresponse[0].ReCount;
                    if (this.totalRecordCount < this.pageItemNumber) {
                        this.endItemNumber = this.totalRecordCount;
                    }
                    if (this.endItemNumber > this.totalRecordCount)
                        this.endItemNumber = this.totalRecordCount;
                }
            });
    }

    pageChanged(event) {
        this.p = event;
        this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
        this.endItemNumber = ((this.p) * this.pageItemNumber);
        if (this.endItemNumber > this.totalRecordCount)
            this.endItemNumber = this.totalRecordCount;
        this.getManualGlTxns(this.p);
    }
    back() {
        let link = ['/fmc/accounting/general-journal'];
        this.router.navigate(link);

    }

    userEventsCalling(userEvents) {
        userEvents.FeatureName = Features[Features.MANUALGLTRANSACTIONS];
        userEvents.ActionName = userEvents.ActionName;
        userEvents.PageName = this.router.url;
        userEvents.CustomerId = 0;
        userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
        userEvents.UserName = this.sessionContextResponse.userName;
        userEvents.LoginId = this.sessionContextResponse.loginId;
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
    btnYesClickEvent(event) {
        if (event) {
            this.approveManualGLTransactions();
        }
    }
}
