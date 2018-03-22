
import { Injectable } from "@angular/core";
import { Http, RequestOptions } from "@angular/http";
import { Observable } from "rxjs";
import { HttpService } from "../../../shared/services/http.service";
import { ICustomerResponse } from "../../../shared/models/customerresponse";
import { ICNDetailsRequest } from "../../icn/models/icndetailsrequest";
import { ICNReportsRequest } from "../models/icnreportsrequest";
import { IVehicleRequest } from "../../../vehicles/models/vehiclecrequest";
import { ISearchCustomerRequest } from "../../search/models/searchcustomerrequest";
import { IVehicleResponse } from "../../../vehicles/models/vehicleresponse";
import { IUserEvents } from "../../../shared/models/userevents";
import { IManageUserRequest } from "../../../sac/usermanagement/models/manageuser.request";
import { IManageUserResponse } from "../../../sac/usermanagement/models/manageuser.response";


@Injectable()
export class CSCReportsService {
      constructor(private http: HttpService) { }
      data: any;
      private cscReportsUrl = 'reports/';
      private userManagementUrl = 'UserManagement/';
      GetPaymentReversalReports(objICnReportsReq: ICNReportsRequest, userevents?: IUserEvents) {
            this.data = { 'objICnReportsReq': objICnReportsReq }
            return this.http.postHttpMethod(this.cscReportsUrl + 'GetPaymentReversalReports', JSON.stringify(this.data), userevents);
      }
      GetAccountStatusDetails(longAccountId: number, objReqCustomerSearch: any, userevents?: IUserEvents): Observable<ISearchCustomerRequest> {
            this.data = { 'AccountId': longAccountId, 'ReqCustomerSearch': objReqCustomerSearch }
            return this.http.postHttpMethod(this.cscReportsUrl + 'GetAccountStatusDetails', JSON.stringify(this.data), userevents);
      }
      GetVehiclesByAccountId(longAccountId: number, objReqVehicle: any, userEvents?: IUserEvents): Observable<IVehicleResponse[]> {
            this.data = { 'AccountId': longAccountId, 'ReqVehicle': objReqVehicle }
            return this.http.postHttpMethod(this.cscReportsUrl + 'GetVehiclesByAccountId', JSON.stringify(this.data), userEvents);
      }
      GetICNHistoryReports(longICNId: number, dtRevenueDate: any, dtEndDate: any, ICNStatus: string, LocationCode: string, objPaging: any, objSystemActivities: any, userEvent?: IUserEvents) {
            this.data = { 'ICNId': longICNId, 'dtRevenueDate': dtRevenueDate, 'dtEndDate': dtEndDate, 'ICNStatus': ICNStatus, 'LocationCode': LocationCode, 'Paging': objPaging, 'SystemActivities': objSystemActivities }
            return this.http.postHttpMethod(this.cscReportsUrl + 'GetICNHistoryReports', JSON.stringify(this.data), userEvent);
      }
      GetTagsbyAccountId(longAccountId: number, objType: any, userEvents?: IUserEvents) {
            this.data = { 'AccountId': longAccountId, 'Type': objType }
            return this.http.postHttpMethod(this.cscReportsUrl + 'GetTagsbyAccountId', JSON.stringify(this.data), userEvents);
      }
      updateOutBoundTransactionsById(objServiceOutBoundTransactions: any, userEvents?: IUserEvents) {
            return this.http.postHttpMethod(this.cscReportsUrl + 'UpdateOutBoundTransactionsById', objServiceOutBoundTransactions, userEvents);
      }
      getOutboundTransactions(objServiceOutBoundTransactions: any, userEvents?: IUserEvents) {
            return this.http.postHttpMethod(this.cscReportsUrl + 'GetOutboundTransactions', objServiceOutBoundTransactions, userEvents);
      }
      GetICNPaymentDetails(objICnReportsReq: ICNReportsRequest, userEvents?: IUserEvents) {
            return this.http.postHttpMethod(this.cscReportsUrl + 'GetICNPaymentDetails', objICnReportsReq, userEvents);
      }
      getPaymentModetTypes(userEvents?: IUserEvents): Observable<any> {
            return this.http.getHttpWithoutParams(this.cscReportsUrl + 'GetPaymentModes', userEvents);
      }
      GetPaymentAdjustmentsReports(objIcnAdjReportReq: any, userevents?: IUserEvents) {
            return this.http.postHttpMethod(this.cscReportsUrl + 'GetPaymentAdjustmentsReports', objIcnAdjReportReq, userevents);
      }
      GetTransactionsbyICNId(longICNId: number, objSystemActivities: any) {
            this.data = { 'ICNId': longICNId, 'SystemActivities': objSystemActivities }
            return this.http.postHttpMethod(this.cscReportsUrl + 'GetTransactionsbyICNId', JSON.stringify(this.data));
      }
      GetIcnDetailsByIcnId(longIcnId: number, objSystemActivities: any) {
            this.data = { 'ICNId': longIcnId, 'SystemActivities': objSystemActivities }
            return this.http.postHttpMethod(this.cscReportsUrl + 'GetIcnDetailsByIcnId', JSON.stringify(this.data));
      }

      GetICNTxnDetailsBYICNId(longICNId: number, objTxnType: any, objPaging: any, objSystemActivities: any) {
            this.data = { 'ICNId': longICNId, 'TxnType': objTxnType, 'Paging': objPaging, 'SystemActivities': objSystemActivities }
            return this.http.postHttpMethod(this.cscReportsUrl + 'GetICNTxnDetailsBYICNId', JSON.stringify(this.data));
      }

      GetICNItemTxns(longICNId: number, objTxnType: any, objPaging: any, objSystemActivities: any) {
            this.data = { 'ICNId': longICNId, 'Paging': objPaging, 'SystemActivities': objSystemActivities }
            return this.http.postHttpMethod(this.cscReportsUrl + 'GetICNItemTxns', JSON.stringify(this.data));
      }

      getCorrectionReasons() {
            return this.http.getHttpWithoutParams(this.cscReportsUrl + 'GetCorrectionReasons');
      }
      getLanesByPlazaCode(plazaname: string) {
            this.data = { 'plazaName': plazaname }
            return this.http.postHttpMethod(this.cscReportsUrl + 'GetLanesByPlazaCode', JSON.stringify(this.data));
      }
      getAllVehicleClasses() {
            return this.http.getHttpWithoutParams(this.cscReportsUrl + 'GetAllVehicleClasses');
      }
      getPlazasDetails() {
            return this.http.getHttpWithoutParams(this.cscReportsUrl + 'GetPlazasDetails');
      }
      getLocations(reqUser: IManageUserRequest): Observable<IManageUserResponse[]> {
            return this.http.postHttpMethod(this.userManagementUrl + 'GetLocations',JSON.stringify(reqUser));
        }


}