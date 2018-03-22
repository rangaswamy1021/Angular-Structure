import { Observable } from 'rxjs';
import { ICNTxns } from './../models/icntxnsresponse';
import { IPaging } from './../../../shared/models/paging';
import { ICNSysTxns } from './../models/icnsystxns';
import { IItemtDetailsResponse } from './../../../imc/shipment/models/itemdetailsresponse';
import { ICNDetailsRequest } from './../models/icndetailsrequest';
import { Injectable } from "@angular/core";
import { ISystemActivities } from "../../../shared/models/systemactivitiesrequest";
import { HttpService } from "../../../shared/services/http.service";
import { ICNDetailsResponse } from "../models/icndetailsresponse";
import { IItemResponse } from "../../../imc/inventory/models/itemresponse";
import { ICNDetails } from "../models/icndetails";
import { IVarianceDetailsResponse } from "../models/variancedetailsresponse";
import { IICNTxnsResponse } from "../models/icntxnsresponse";
import { IUserEvents } from "../../../shared/models/userevents";

@Injectable()
export class ICNService {
    private icnUrl = '/ICN/';

    constructor(private http: HttpService) { }

    getUsersbyRole(roleName, objSystemActivites): Observable<ICNDetailsResponse[]> {
        var obj = { 'RoleName': roleName, 'SystemActivities': objSystemActivites }
        return this.http.postHttpMethod(this.icnUrl + 'GetUsersbyRole', obj);
    }


    getTagItems(): Observable<IItemResponse[]> {
        return this.http.getHttpWithoutParams(this.icnUrl + 'GetItems').publishReplay().refCount();
    }

    getBeginAmount(): Observable<number> {
        return this.http.getHttpWithoutParams(this.icnUrl + 'GetBeginAmount');
    }

    assignICN(objICNDetails, objICNItems, CashDenomination, userEvents) {
        var obj = { 'objICNDetails': objICNDetails, 'objICNItems': objICNItems, 'CashDenomination': CashDenomination }
        return this.http.postHttpMethod(this.icnUrl + 'AssignICN', obj, userEvents);
    }


    getCountOutUsers(icnRequest: ICNDetailsRequest) {
        var obj = { 'objICNDetails': icnRequest }
        return this.http.postHttpMethod(this.icnUrl + 'BindCountOutUsers', JSON.stringify(obj));
    }

    bindItemTypes(itemType: string): Observable<IItemtDetailsResponse[]> {
        var obj = { 'strItemType': itemType }
        return this.http.postHttpMethod(this.icnUrl + 'BindTagTypes', JSON.stringify(obj));
    }
    bindIcnTagTxns(icnDetReq: ICNDetails, userEvents: IUserEvents): Observable<ICNTxns[]> {
        var obj = { 'objIcnTxn': icnDetReq }
        return this.http.postHttpMethod(this.icnUrl + 'BindItemtransactions', JSON.stringify(obj), userEvents);
    }
    bindBankTxns(icnDetReq: ICNDetails, paging: IPaging): Observable<ICNSysTxns[]> {
        var obj = { 'objIcnTxn': icnDetReq, 'paging': paging }
        return this.http.postHttpMethod(this.icnUrl + 'BindBanktransactions', JSON.stringify(obj));
    }
    bindMOTxns(icnDetReq: ICNDetails, paging: IPaging): Observable<ICNSysTxns[]> {
        var obj = { 'objIcnTxn': icnDetReq, 'paging': paging }
        return this.http.postHttpMethod(this.icnUrl + 'BindMOTransactions', JSON.stringify(obj));
    }
    bindCCTxns(icnDetReq: ICNDetails, paging: IPaging): Observable<ICNSysTxns[]> {
        var obj = { 'objIcnTxn': icnDetReq, 'paging': paging }
        console.log(icnDetReq);
        return this.http.postHttpMethod(this.icnUrl + 'BindCreditTransactions', obj);
    }

    bindCashTxns(icnDetReq: ICNDetails, paging: IPaging): Observable<ICNSysTxns[]> {
        var obj = { 'objIcnTxn': icnDetReq, 'paging': paging }
        return this.http.postHttpMethod(this.icnUrl + 'BindCashtransactions', JSON.stringify(obj));
    }

    bindChequeTxns(icnDetReq: ICNDetails, paging: IPaging): Observable<ICNSysTxns[]> {
        var obj = { 'objIcnTxn': icnDetReq, 'paging': paging }
        return this.http.postHttpMethod(this.icnUrl + 'BindChequeTransactions', JSON.stringify(obj));
    }

    getUsersStatus(revenueDate: Date, endDate: Date, status: string, paging: IPaging, systemActivities: ISystemActivities, userEvents: IUserEvents): Observable<ICNDetailsResponse[]> {
        var obj = { 'revenueDate': revenueDate.toLocaleString(), 'endDate': endDate.toLocaleString(), 'status': status, 'paging': paging, 'systemActivities': systemActivities }
        return this.http.postHttpMethod(this.icnUrl + 'GetUsersStatus', obj, userEvents);
    }

    updateICNStatus(icnId: number, icnStatus: string, updatedUser: string, systemActivities: ISystemActivities, userEvents?: IUserEvents): Observable<boolean> {
        var obj = { 'longICNId': icnId, 'icnStatus': icnStatus, 'updatedUser': updatedUser, 'systemActivities': systemActivities }
        return this.http.postHttpMethod(this.icnUrl + 'UpdateICNStatus', obj, userEvents);
    }
    updateICNotes(icnId: number, icnNotes: string, updatedUser: string): Observable<boolean> {
        var obj = { 'icnId': icnId, 'icnNotes': icnNotes, 'icnUser': updatedUser, }
        return this.http.postHttpMethod(this.icnUrl + 'UpdateICNNotes', JSON.stringify(obj));
    }

    countOutIcn(objICNDetails, icnAsignItems, icnReturnItems, cashdenominations, userEvents?: IUserEvents): Observable<boolean> {
        var obj = { 'objICNDetails': objICNDetails, 'objICNAssignItems': icnAsignItems, 'objICNReturnItems': icnReturnItems, 'CashDenomination': cashdenominations }
        return this.http.postHttpMethod(this.icnUrl + 'CountOutICN', obj, userEvents);
    }

    getIcnDetails(objICNDetails): Observable<ICNDetailsResponse> {
        var obj = { 'objIcndet': objICNDetails }
        return this.http.postHttpMethod(this.icnUrl + 'GetIcnDetailByIcnId', obj);
    }
    icnUsersSearch(icnId: number, revenueDate: Date, endDate: Date, icnStatus: string, paging: IPaging, systemActivities: ISystemActivities, userEvents?: IUserEvents): Observable<ICNDetailsResponse[]> {
        var obj = { 'icnId': icnId, 'revenueDate': revenueDate.toLocaleString(), 'endDate': endDate.toLocaleString(), 'icnStatus': icnStatus, 'paging': paging, 'systemActivities': systemActivities }
        return this.http.postHttpMethod(this.icnUrl + 'ICNUsersSearch', obj, userEvents);
    }

    getTransactionsbyICNId(icnId: number, systemActivities: ISystemActivities): Observable<IVarianceDetailsResponse[]> {
        var obj = { 'icnId': icnId, 'systemActivities': systemActivities }
        return this.http.postHttpMethod(this.icnUrl + 'GetTransactionsbyICNId', obj);
    }

    getTxnsbyICNId(icnId: number, systemActivities: ISystemActivities): Observable<IVarianceDetailsResponse[]> {
        var obj = { 'icnId': icnId, 'systemActivities': systemActivities }
        return this.http.postHttpMethod(this.icnUrl + 'GetTxnsByICNId', obj);
    }

    insertIcnVariance(objICNDetails, userEvents?: IUserEvents): Observable<boolean> {
        var obj = { 'objICNDetails': objICNDetails }
        return this.http.postHttpMethod(this.icnUrl + 'InsertIcnVariance', obj, userEvents);
    }

    getICNItemTxns(icnId: number, paging: IPaging, systemActivities: ISystemActivities): Observable<IICNTxnsResponse[]> {
        var obj = { 'icnId': icnId, 'paging': paging, 'systemActivities': systemActivities }
        return this.http.postHttpMethod(this.icnUrl + 'GetICNItemTxns', obj);
    }

    getICNDetailsByICNId(icnId: number, systemActivities: ISystemActivities): Observable<ICNDetailsResponse[]> {
        var obj = { 'icnId': icnId, 'systemActivities': systemActivities }
        return this.http.postHttpMethod(this.icnUrl + 'GetICNDetailsByICNId', obj);
    }

    bindClerktransactions(icnId, sysActivity): Observable<ICNDetailsResponse> {
        var obj = { 'icnId': icnId, 'systemActivities': sysActivity }
        return this.http.postHttpMethod(this.icnUrl + 'ClerkTxns', obj);
    }
    bindSystransactions(icnId, payMode, paging, sysActivity): Observable<ICNSysTxns[]> {
        var obj = { 'icnId': icnId, 'payMode': payMode, 'paging': paging, 'systemActivities': sysActivity }
        return this.http.postHttpMethod(this.icnUrl + 'SystemTxns', JSON.stringify(obj));
    }
    // bindItemSystransactions(icnId, paging, sysActivity): Observable<ICNTxns[]> {
    //     var obj = { 'icnId': icnId, 'paging': paging, 'systemActivities': sysActivity }
    //     return this.http.postHttpMethod(this.icnUrl + 'GetItemTxnDetails', obj);
    // }
    bindItemSystransactions(icnId, paging, sysActivity, userEvents?: IUserEvents): Observable<ICNTxns[]> {
        var obj = { 'icnId': icnId, 'paging': paging, 'systemActivities': sysActivity }
        return this.http.postHttpMethod(this.icnUrl + 'GetItemTxnDetails', obj, userEvents);
    }

    getICNTxnDetailsBYICNId(icnId: number, paymentMode: string, paging: IPaging, systemActivities: ISystemActivities): Observable<ICNSysTxns[]> {
        var obj = { 'icnId': icnId, 'paymentMode': paymentMode, 'paging': paging, 'systemActivities': systemActivities }
        return this.http.postHttpMethod(this.icnUrl + 'GetICNTxnDetailsBYICNId', obj);
    }
}