import { IAddressResponse } from './../../../shared/models/addressresponse';
import { IActivityRequest } from '../../../shared/models/activitesrequest';
import { Data } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers, URLSearchParams } from '@angular/http';

import { HttpService } from './../../../shared/services/http.service';

import { ITagRequest } from '../models/TagRequest';
import { IProfileRequest } from '../models/profilerequest';
import { IDiscountRequest } from '../models/discountrequest';
import { IDocumentsRequest } from '../../documents/models/documentsrequest';
import { ITransactionRequest } from '../../../shared/models/transactionrequest';
import { IAccountSummartRequest } from '../models/accountsummaryrequest';

import { ITagResponse } from '../../../shared/models/tagresponse';
import { IDiscountResponse } from '../models/discountsresponse';
import { IDocumentsResponse } from '../../documents/models/documentsresponse';
import { ITransactionResponse } from '../../../shared/models/transactionresponse';
import { IRecentPaymentsResponse } from '../models/recentpaymentsresponse';
import { IBalanceResponse } from '../models/balanceresponse';
import { IKYCDocumentResponse } from '../models/kycdocumentsresponse';
import { IVehicleResponse } from '../../../shared/models/vehicleresponse';
import { IComplaintResponse } from '../../../shared/models/complaintsresponse';
import { IActivityResponse } from '../../../shared/models/activitiesresponse';
import { IRecentPaymentRequest } from '../models/recentpaymentRequest';
import { ICustomerResponse } from '../../../shared/models/customerresponse';
import { IEmailRequest } from '../../../shared/models/emailrequest';
import { IPaymentHistoryDetailsRequest } from '../models/PaymentHistoryDetailsRequest';
import { ISearchPaymentResponse } from '../models/SearchPaymentResponse';
import { ICustomerAttributeResponse } from '../../../shared/models/customerattributeresponse';
import { IInvoiceCycle } from '../models/InvoiceCycle';
import { IEmailResponse } from '../../../shared/models/emailresponse';
import { IAlertandCommunicationResponse } from '../models/alertsandcommunicationsresponse';
import { IAlertsAndCommunicationsRequest } from '../models/alertandcommunicationsrequest';
import { ISecurityRequest } from '../models/securityrequest';
import { ICustomerAttributeRequest } from '../../../shared/models/customerattributerequest';
import { IStatementRequest } from '../../documents/models/statementrequest';
import { IVehicleRequest } from '../../../vehicles/models/vehiclecrequest';


import { ITripRequest } from '../models/TripRequest';
import { ITripResponse } from '../models/TripResponse';
import { ImgResponse } from '../../../shared/models/imageresponse';
import { IRequestTranscationAdjustment } from '../models/transcationadjustments';


import { IAccountAdjustmentRequest } from '../models/accountadjustmentrequest';

import { ITransactionActivityRequest } from '../models/transactionactivityrequest';
import { ITransactionActivityResponse } from '../models/transactionactivityresponse';
import { ITripHistoryResponse } from '../models/TripStatusHistoryResponse';
import { IProfileResponse } from '../../search/models/ProfileResponse';
import { IUserEvents } from '../../../shared/models/userevents';
import { ILowBalanceandThresholdAmountsRequest } from "../../../sac/configuration/models/lowbalanceandthresholdamountsrequest";
import { IUnbilledTransactionsRequest } from '../models/unbilledtransactionsrequest';



@Injectable()
export class CustomerDetailsService {
    data: any;
    private activityUrl = 'Activity/';
    private customerDetailsUrl = 'CustomerDetails/';
    private commonUrl = 'Common/';
    private paymentUrl = 'Payment/';
    private conFigUrl = 'Configuration/';
    constructor(private http: HttpService) { }

    getActivities(accountSummaryRequest: IAccountSummartRequest): Observable<IActivityResponse[]> {
        return this.http.postHttpMethod(this.customerDetailsUrl + 'GetNActivities', JSON.stringify(accountSummaryRequest))
            ;
    }
    getVehicles(accountSummaryRequest: IAccountSummartRequest): Observable<IVehicleResponse[]> {
        return this.http.postHttpMethod(this.customerDetailsUrl + 'GetActiveVehicles', JSON.stringify(accountSummaryRequest))
            ;
    }

    getTagsByAccount(tagRequest: ITagRequest): Observable<ITagResponse[]> {
        return this.http.postHttpMethod(this.customerDetailsUrl + 'GetTagDetails', JSON.stringify(tagRequest))
            ;
    }

    getComplaintByAccount(longCustomerId: number): Observable<IComplaintResponse[]> {
        return this.http.postHttpMethod(this.customerDetailsUrl + 'GetComplaintsByAccountId', JSON.stringify(longCustomerId))
            ;
    }

    bindAdditionalContactInSummary(profileRequest: IProfileRequest): Observable<IProfileResponse[]> {
        return this.http.postHttpMethod(this.customerDetailsUrl + 'GetAdditionalContactSummary', JSON.stringify(profileRequest))
            ;
    }

    getActiveDiscounts(discountRequest: IDiscountRequest): Observable<IDiscountResponse[]> {
        return this.http.postHttpMethod(this.customerDetailsUrl + 'GetActiveDiscounts', JSON.stringify(discountRequest))
            ;
    }

    getOutBoundDetailsByCustomerId(discountsRequest: IDocumentsRequest): Observable<IDocumentsResponse[]> {
        return this.http.postHttpMethod(this.customerDetailsUrl + 'GetInboundByCustomerId', JSON.stringify(discountsRequest))
            ;
    }

    getCustomerViolations(transactionRequest: ITransactionRequest): Observable<ITransactionResponse[]> {
        return this.http.postHttpMethod(this.customerDetailsUrl + 'GetTop5CustomerViolations', JSON.stringify(transactionRequest))
            ;
    }

    getAutoRebillActivities(recentPaymentRequest: IRecentPaymentRequest): Observable<IRecentPaymentsResponse[]> {
        return this.http.postHttpMethod(this.customerDetailsUrl + 'GetAutoRebillActivities', JSON.stringify(recentPaymentRequest))
            ;
    }

    bindCustomerInfoDetails(longCustomerId: number, userEvents?: IUserEvents): Observable<ICustomerResponse> {
        return this.http.postHttpMethod(this.customerDetailsUrl + 'BindCustomerInfoDetails', JSON.stringify(longCustomerId), userEvents);
    }

    bindContactInfoBlock(accountSummaryRequest: IAccountSummartRequest): Observable<ICustomerResponse> {
        return this.http.postHttpMethod(this.customerDetailsUrl + 'BindContactInfoDetails', JSON.stringify(accountSummaryRequest))
            ;
    }

    getEarnedRewardPoints(longCustomerId: number, userEvents?: IUserEvents): Observable<IBalanceResponse> {
        return this.http.postHttpMethod(this.customerDetailsUrl + 'GetEarnedRewardPoints', JSON.stringify(longCustomerId), userEvents)
            ;
    }
    getCustomerAllTypesOfBalances(longCustomerId: number): Observable<IBalanceResponse> {
        return this.http.postHttpMethod(this.customerDetailsUrl + 'GetCustomerAllTypesOfBalances', JSON.stringify(longCustomerId))
            ;
    }
    getLastPaymentDetails(longCustomerId: number): Observable<IRecentPaymentsResponse[]> {
        return this.http.postHttpMethod(this.customerDetailsUrl + 'GetLastPaymentDetails', JSON.stringify(longCustomerId))
            ;
    }

    GetListOfDocumentsByAccountId(longCustomerId: number): Observable<IKYCDocumentResponse[]> {
        return this.http.postHttpMethod(this.customerDetailsUrl + 'GetListOfDocumentsByAccountId', JSON.stringify(longCustomerId))
            ;
    }
    getTripTransactions(accountSummaryRequest: IAccountSummartRequest): Observable<ITransactionResponse[]> {
        return this.http.postHttpMethod(this.customerDetailsUrl + 'GetTopNTrips', JSON.stringify(accountSummaryRequest))
            ;
    }
    getParkingTransactions(accountSummaryRequest: IAccountSummartRequest): Observable<ITransactionResponse[]> {
        return this.http.postHttpMethod(this.customerDetailsUrl + 'GetTopNParkingTransactions', JSON.stringify(accountSummaryRequest))
            ;
    }
    getFerryTransactions(accountSummaryRequest: IAccountSummartRequest): Observable<ITransactionResponse[]> {
        return this.http.postHttpMethod(this.customerDetailsUrl + 'GetTopNFerryTransactions', JSON.stringify(accountSummaryRequest))
            ;
    }
    getTransitTransactions(accountSummaryRequest: IAccountSummartRequest): Observable<ITransactionResponse[]> {
        return this.http.postHttpMethod(this.customerDetailsUrl + 'GetTopNTransitTransactions', JSON.stringify(accountSummaryRequest))
            ;
    }


    getTransactionHistory(activityRequest: IPaymentHistoryDetailsRequest, userEvents?: IUserEvents): Observable<ISearchPaymentResponse[]> {
        let obj = JSON.stringify(activityRequest);
        return this.http.postHttpMethod(this.activityUrl + 'GetTransactionHistory', obj, userEvents);
    }

    pagingBasicSearchTripstriphistory(TripActivities: ITripRequest): Observable<ITripResponse[]> {
        return this.http.postHttpMethod(this.customerDetailsUrl + 'PagingBasicSearchTrips', JSON.stringify(TripActivities))
            ;
    }


    getTripActivity(TripActivities: ITripRequest): Observable<ITripResponse> {
        return this.http.postHttpMethod(this.customerDetailsUrl + 'getTripActivity', JSON.stringify(TripActivities))
            ;
    }

    getViolationHistory(TripActivities: ITripRequest): Observable<ITripResponse> {
        let obj = JSON.stringify(TripActivities);
        return this.http.postHttpMethod(this.customerDetailsUrl + 'GetCustomerViolations', obj);
    }

    getTransactionHistoryPDF(activityRequest: IPaymentHistoryDetailsRequest, userEvents?: IUserEvents): Observable<string> {
        let obj = JSON.stringify(activityRequest);
        return this.http.postHttpMethod(this.activityUrl + 'GetTransactionHistoryPDF', obj, userEvents);
    }

    generateEmailVerification(emailRequest: IEmailRequest, userEvents?: IUserEvents): Observable<boolean> {
        return this.http.postHttpMethod(this.customerDetailsUrl + 'GenerateEmailVerificationLink', JSON.stringify(emailRequest), userEvents)
            ;
    }

    insertActivity(activityRequest: IActivityRequest): Observable<any[]> {
        return this.http.postHttpMethod(this.commonUrl + 'CreateActivities', JSON.stringify(activityRequest))
            ;
    }

    getCreditCardsByAccountId(longCustomerId: number): Observable<any[]> {
        return this.http.postHttpMethod(this.customerDetailsUrl + 'GetCreditCardsByAccountId', JSON.stringify(longCustomerId))
            ;
    }

    getCustomerCycle(longCustomerId: number): Observable<string> {
        let obj = JSON.stringify(longCustomerId);
        return this.http.getHttpWithParams(this.customerDetailsUrl + 'getCustomerCycle', 'longCustomerId', obj)
            ;
    }


    getDocPath(): Observable<string> {
        return this.http.getHttpWithoutParams(this.customerDetailsUrl + 'GetDocumentPaths')
            ;
    }
    getImagePath(longTripId: number, userEvents?: IUserEvents): Observable<any> {
        return this.http.postHttpMethod(this.customerDetailsUrl + 'GetImage', JSON.stringify(longTripId));
    }

    getCustomerData(longCustomerId: number): Observable<ICustomerAttributeResponse> {
        let obj = JSON.stringify(longCustomerId);
        return this.http.getHttpWithParams(this.customerDetailsUrl + 'getCustomerData', 'longCustomerId', obj)
            ;
    }

    getApplicationParameterValueByParameterKey(strKey: string): Observable<any> {
        let obj = JSON.stringify(strKey);
        return this.http.getHttpWithParams(this.customerDetailsUrl + 'getApplicationParameterValueByParameterKey', 'strKey', obj)
            ;
    }

    getInvoiceCycle(): Observable<IInvoiceCycle[]> {
        return this.http.getHttpWithoutParams(this.customerDetailsUrl + 'getInvoiceCycle');
    }

    getDefaultEmail(longCustomerId: number): Observable<IEmailResponse[]> {
        let obj = JSON.stringify(longCustomerId);
        return this.http.getHttpWithParams(this.customerDetailsUrl + 'getDefaultEmail', 'longCustomerId', obj)
            ;
    }

    updateStatementDeliveryOption(CustomerAttributesRequest: ICustomerAttributeRequest): Observable<any[]> {
        let obj = JSON.stringify(CustomerAttributesRequest);
        return this.http.postHttpMethod(this.customerDetailsUrl + 'updateStatementDeliveryOption', obj);
    }

    updateTransponderPurchaseMethod(CustomerAttributesRequest: ICustomerAttributeRequest): Observable<any[]> {
        let obj = JSON.stringify(CustomerAttributesRequest);
        return this.http.postHttpMethod(this.customerDetailsUrl + 'updateTransponderPurchaseMethod', obj);
    }
    getDefaultAlerts(): Observable<IAlertandCommunicationResponse[]> {
        return this.http.getHttpWithoutParams(this.customerDetailsUrl + 'getDefaultAlerts');
    }

    getAlertsByCustomerId(longCustomerId: number): Observable<IAlertandCommunicationResponse[]> {
        let obj = JSON.stringify(longCustomerId);
        return this.http.getHttpWithParams(this.customerDetailsUrl + 'getAlertsByCustomerId', 'longCustomerId', obj)
            ;
    }

    alertSettingInsertOrUpdate(AlertsAndCommunicationsRequest: IAlertsAndCommunicationsRequest[]): Observable<any[]> {
        let obj = JSON.stringify(AlertsAndCommunicationsRequest);
        return this.http.postHttpMethod(this.customerDetailsUrl + 'AlertSettingInsertOrUpdate', obj);
    }

    // started methods for security setting component
    getSecurityQuestions(longCustomerId: number): Observable<any[]> {
        return this.http.postHttpMethod(this.customerDetailsUrl + 'GetSecurityQuestions', JSON.stringify(longCustomerId))
            ;
    }

    getChildCustomersByParentAccountId(longCustomerId: number, userEvents?: IUserEvents): Observable<any[]> {
        return this.http.postHttpMethod(this.customerDetailsUrl + 'GetChildCustomersByParentAccountId', JSON.stringify(longCustomerId), userEvents)
            ;
    }

    updateGeneratePassword(securityRequest: ISecurityRequest, userEvents?: IUserEvents): Observable<string> {
        return this.http.postHttpMethod(this.customerDetailsUrl + 'UpdateGeneratedPassword', JSON.stringify(securityRequest), userEvents)
            ;
    }

    updateUsername(securityRequest: ISecurityRequest, userEvents?: IUserEvents): Observable<string> {
        return this.http.postHttpMethod(this.customerDetailsUrl + 'RequestUsername', JSON.stringify(securityRequest), userEvents)
            ;
    }

    updateGeneratedPin(customerAttributeRequest: ICustomerAttributeRequest, userEvents?: IUserEvents): Observable<string> {
        return this.http.postHttpMethod(this.customerDetailsUrl + 'UpdateGeneratedPin', JSON.stringify(customerAttributeRequest), userEvents)
            ;
    }


    getEnumDescriptionByEnum(stringEnumString: string): Observable<string> {
        return this.http.postHttpMethod(this.customerDetailsUrl + 'GetEnumDescription', JSON.stringify(stringEnumString))
            ;
    }
    // ended methods for security setting component

    getCustomerStatements(objCustomerRequest: IDocumentsRequest, userEvents?: IUserEvents): Observable<IDocumentsResponse[]> {
        const obj = JSON.stringify(objCustomerRequest);
        return this.http.postHttpMethod(this.customerDetailsUrl + 'GetCustomerStatements', obj, userEvents)
            ;
    }
    getProfileByCustomerId(longCustomerId: number, userEvents?: IUserEvents): Observable<any> {
        return this.http.postHttpMethod(this.customerDetailsUrl + 'GetProfileByCustomerId', JSON.stringify(longCustomerId), userEvents)
            ;
    }
    saveCustomerStatements(objCustomerRequest: IDocumentsRequest, userEvents?: IUserEvents): Observable<string> {
        const obj = JSON.stringify(objCustomerRequest);
        return this.http.postHttpMethod(this.customerDetailsUrl + 'SaveGeneratedStatement', obj, userEvents)
            ;
    }
    updateProfileByCustomerId(profileRequest: IProfileRequest, userEvents?: IUserEvents): Observable<boolean> {
        return this.http.postHttpMethod(this.customerDetailsUrl + 'UpdateProfile', JSON.stringify(profileRequest), userEvents)
            ;
    }

    generateCustomerStatements(objTransactionRequest: ITransactionRequest, strOptions: IStatementRequest, userEvents?: IUserEvents): Observable<string> {
        this.data = { 'strTransactionObject': objTransactionRequest, 'strOptions': strOptions };
        return this.http.postHttpMethod(this.customerDetailsUrl + 'GenerateStatement', JSON.stringify(this.data), userEvents)
            ;
    }


    getCustomerProfileHistoryByCustomerId(profileRequest: IProfileRequest, userEvents?: IUserEvents): Observable<any[]> {
        return this.http.postHttpMethod(this.customerDetailsUrl + 'GetCustomerProfileHistoryByCustomerId', JSON.stringify(profileRequest), userEvents)
            ;
    }

    getBaseDetailsById(longCustomerId: number): Observable<any[]> {
        return this.http.postHttpMethod(this.customerDetailsUrl + 'GetBaseDetailsById', JSON.stringify(longCustomerId))
            ;
    }

    getDoumentPath(): Observable<string> {
        const obj = JSON.stringify(null);
        return this.http.postHttpMethod(this.customerDetailsUrl + 'GetViewPath', obj)
            ;
    }

    reOpenAccount(vehicle: IVehicleRequest): Observable<boolean> {
        return this.http.postHttpMethod(this.customerDetailsUrl + 'ReOpenAccount', JSON.stringify(vehicle))
            ;
    }
    getLastAdjustmentWithDateTime(longCustomerId: number): Observable<any> {
        return this.http.postHttpMethod(this.customerDetailsUrl + 'GetLastAdjustmentWithDateTime', JSON.stringify(longCustomerId))
            ;
    }

    getAdjustmentDetails(accountAdjustments: any, userEvents?: IUserEvents): Observable<any[]> {
        return this.http.postHttpMethod(this.customerDetailsUrl + 'GetAdjustmentDetails', JSON.stringify(accountAdjustments), userEvents)
            ;
    }

    getAdjustmentType(): Observable<any[]> {
        return this.http.postHttpMethod(this.customerDetailsUrl + 'GetAdjustmentType', null)
            ;
    }



    insertTollLevelAdjustments(accountAdjustments: IRequestTranscationAdjustment): Observable<boolean> {
        return this.http.postHttpMethod(this.customerDetailsUrl + 'InsertTollLevelAdjustment', JSON.stringify(accountAdjustments))
            ;
    }

    //   getTripStatusHistory(lngCustomerTripId:number): Observable<any[]> {
    //     return this.http.postHttpMethod(this.customerDetailsUrl + 'BindTripStatusHistory','', JSON.stringify(lngCustomerTripId))
    //            ;
    //  }

    getTripStatusHistory(lngCustomerTripId: any): Observable<ITripHistoryResponse> {
        return this.http.getHttpWithParams(this.customerDetailsUrl + 'BindTripStatusHistory', 'lngCustomerTripId', lngCustomerTripId);
    }
    insertAdjustments(accountAdjustments: any, userEvents?: IUserEvents): Observable<number> {
        return this.http.postHttpMethod(this.customerDetailsUrl + 'InsertAdjustments', JSON.stringify(accountAdjustments), userEvents)
            ;
    }




    getAdjustmentTypeDetails(accountAdjustments: any): Observable<any[]> {
        return this.http.postHttpMethod(this.customerDetailsUrl + 'GetAdjustmentTypeDetails', JSON.stringify(accountAdjustments))
            ;
    }


    getCustomerAmountAutoPayDetails(longCustomerId: number, userEvents?: IUserEvents): Observable<any> {
        return this.http.postHttpMethod(this.customerDetailsUrl + 'GetCustomerAttributes', JSON.stringify(longCustomerId), userEvents)
            ;
    }

    getAverageMonthlyUsage(longCustomerId: number): Observable<any> {
        return this.http.postHttpMethod(this.customerDetailsUrl + 'GetAverageMonthlyUsage', JSON.stringify(longCustomerId))
            ;
    }

    getChequePayments(checkPayment: any): Observable<any[]> {
        return this.http.postHttpMethod(this.customerDetailsUrl + 'getChequePayments', checkPayment)
            ;
    }
    insertChequeAdjustment(checkAdjustments: any[], userEvents?: IUserEvents): Observable<boolean> {
        return this.http.postHttpMethod(this.customerDetailsUrl + 'insertChequeAdjustment', JSON.stringify(checkAdjustments), userEvents)
            ;
    }
    pagingBasicSearchTrips(transactionActivityRequest: ITransactionActivityRequest, userEvents?: IUserEvents): Observable<ITransactionActivityResponse[]> {
        return this.http.postHttpMethod(this.customerDetailsUrl + 'PagingBasicSearchTrips', JSON.stringify(transactionActivityRequest), userEvents)
            ;
    }

    getBankByAccountID(longCustomerId: number): Observable<any[]> {
        return this.http.postHttpMethod(this.customerDetailsUrl + 'GetBankByAccountID', JSON.stringify(longCustomerId))
            ;
    }

    getDateDetails(): Observable<any> {
        return this.http.postHttpMethod(this.customerDetailsUrl + 'GetDateDetails', JSON.stringify(0))
            ;
    }
    //

    updateAutoReplenishmentType(requestUpdate: ICustomerAttributeRequest): Observable<boolean> {
        this.data = { 'objCustAttRequest': requestUpdate }
        return this.http.postHttpMethod(this.customerDetailsUrl + 'UpdateAutoReplenishmentType', JSON.stringify(this.data));
    }

    updateRebillThresholdAmounts(requestUpdate: ICustomerAttributeRequest, userEvents?: IUserEvents): Observable<boolean> {
        this.data = { 'objCustAttRequest': requestUpdate }
        return this.http.postHttpMethod(this.customerDetailsUrl + 'UpdateRebillThresholdAmounts', JSON.stringify(this.data), userEvents);
    }

    updateAutorebillManualHold(requestUpdate: ICustomerAttributeRequest, userEvents?: IUserEvents): Observable<boolean> {
        this.data = { 'objCustAttRequest': requestUpdate }
        return this.http.postHttpMethod(this.customerDetailsUrl + 'UpdateAutorebillManualHold', JSON.stringify(this.data), userEvents);
    }

    checkCustomerVehicleByCustTripIdCSV(accountId: number, strCustTripId: string): Observable<boolean> {
        this.data = { 'AccountId': accountId, 'strCustTripId': strCustTripId }
        return this.http.postHttpMethod(this.customerDetailsUrl + 'CheckCustomerVehicleByCustTripIdCSV', JSON.stringify(this.data));
    }

    transactionTransfer(accountAdjustmentRequest: IAccountAdjustmentRequest, userEvents: IUserEvents): Observable<boolean> {
        return this.http.postHttpMethod(this.customerDetailsUrl + 'TransactionTransfer', accountAdjustmentRequest, userEvents);
    }

    getBalance(accountId: number, accStatus: string, isPostPaidCustomer: boolean): Observable<IBalanceResponse> {
        this.data = { 'customerid': accountId, 'AccountStatus': accStatus, 'PostPaid': isPostPaidCustomer }
        return this.http.postHttpMethod(this.paymentUrl + 'GetBalance', JSON.stringify(this.data));
    }

    adjustmentRewardBal(accountAdjustmentRequest: IAccountAdjustmentRequest, userEvents?: IUserEvents): Observable<boolean> {
        return this.http.postHttpMethod(this.customerDetailsUrl + 'AdjustmentRewardBal', accountAdjustmentRequest, userEvents);
    }
    GetLowBalanceandThresholdAmounts(): Observable<ILowBalanceandThresholdAmountsRequest[]> {
        return this.http.getHttpWithoutParams(this.conFigUrl + 'GetLowBalanceandThresholdAmounts');
    }

    GetUnbilledTransactions(): Observable<IUnbilledTransactionsRequest[]> {
        return this.http.getHttpWithoutParams(this.customerDetailsUrl + 'GetUnbilledTransactions');
    }

    validTripDisputes(accountAdjustmentRequest: IAccountAdjustmentRequest, userEvents?: IUserEvents): Observable<boolean> {
        return this.http.postHttpMethod(this.customerDetailsUrl + 'ValidTripDisputes', accountAdjustmentRequest, userEvents);
    }
    inValidTripDisputes(accountAdjustmentRequest: IAccountAdjustmentRequest, userEvents?: IUserEvents): Observable<boolean> {
        return this.http.postHttpMethod(this.customerDetailsUrl + 'InValidTripDisputes', accountAdjustmentRequest, userEvents);
    }
   UpdateTimeSpentEvents(timeSpentId: number, strUserName: string): Observable<boolean> {
        this.data = { 'timeSpentId': timeSpentId, 'userName': strUserName }
        return this.http.putHttpMethod(this.customerDetailsUrl + 'UpdateTimeSpentEvents', JSON.stringify(this.data));
    }
}
