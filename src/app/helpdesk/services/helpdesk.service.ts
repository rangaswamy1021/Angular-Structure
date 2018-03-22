import { IComplaintResponse } from './../../shared/models/complaintsresponse';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Http, RequestOptions, Headers, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/map';
import { HttpService } from '../../shared/services/http.service';
import { ISearchRequest } from '../models/searchrequest';
import { ICreatecomplaintrequest } from '../../shared/models/createcomplaintrequest';
import { IAssignStatusRequest } from '../models/assignstatusrequest';
import { IProblemNotesResponse } from '../models/problem-notesresponse';
import { IAttachmentResponse } from '../../shared/models/attachmentresponse';
import { INotesRequest } from '../models/notesrequest';
import { IAttachmentRequest } from '../../shared/models/attachmentrequest';
import { IProblemStatusResponse } from '../models/problem-statusresponse';
import { IStatusupdateRequest } from '../models/statusupdaterequest';
import { IViolatorsearchRequest } from '../models/violatorsearchrequest';
import { ISearchCustomerRequest } from '../../csc/search/models/searchcustomerRequest';
import { IProfileResponse } from '../../csc/search/models/ProfileResponse';
import { ICommonResponse } from '../../shared/models/commonresponse';
import { IGetHistoryRequest } from "../models/gethistoryrequest";
import { IViolatorSearchResponse } from "../../tvc/search/models/violatorsearchresponse";
import { IUserEvents } from "../../shared/models/userevents";


@Injectable()
export class HelpDeskService {

    constructor(private http: HttpService) { }
    private helpdeskUrl = 'HelpDesk/';
    private common = 'Common/';
    reqAssignStatus: IComplaintResponse[];
    private contextSource = new BehaviorSubject<IComplaintResponse[]>(this.reqAssignStatus);
    currentContext = this.contextSource.asObservable();

    changeResponse(context: IComplaintResponse[]) {
        for (let c in context)
            // {
            //     this.contextSource.next(context[c]);
            // }
            this.contextSource.next(context);


    }
    search(objReqSearch: ISearchRequest, userEvents?: IUserEvents): Observable<IComplaintResponse[]> {
        let obj = JSON.stringify(objReqSearch);
        return this.http.postHttpMethod(this.helpdeskUrl + 'Search', objReqSearch, userEvents);
    }

    create(objReqComplaints: ICreatecomplaintrequest, userEvents?: IUserEvents): Observable<[string]> {
        const cmpReq = JSON.stringify(objReqComplaints);
        return this.http.postHttpMethod(this.helpdeskUrl + 'CreateComplaint', cmpReq, userEvents);
    }

    uploadFile(formData: FormData): Observable<any> {
        return this.http.postHttpMethodwithoutOptions(this.helpdeskUrl + 'UploadFile', formData);
    }

    deleteFile(strDbFilePath: string): Observable<[boolean]> {
        let filePath = strDbFilePath;
        return this.http.deleteHttpMethodWithParams(this.helpdeskUrl + 'DeleteFile', 'strDbFilePath', filePath);
    }

    mergeComplaints(reqAssignStatus: IAssignStatusRequest, arrProblemId: number[], userEvents?: IUserEvents): Observable<[boolean]> {
        let obj = { 'ReqAssignStatus': reqAssignStatus, 'ProblemIdList': arrProblemId };
        return this.http.postHttpMethod(this.helpdeskUrl + 'MergeComplaints', JSON.stringify(obj), userEvents);
    }

    getProblemTypeLookups(): Observable<[any]> {
        return this.http.getHttpWithoutParams(this.helpdeskUrl + 'GetProblemTypeLookups');
    }

    getHistoryByComplaintID(objComplaintHistory: IGetHistoryRequest): Observable<IComplaintResponse[]> {
        let obj = JSON.stringify(objComplaintHistory);
        return this.http.postHttpMethod(this.helpdeskUrl + 'GetHistoryByComplaintID', obj);
    }

    getByComplaintId(objReqSearch: ISearchRequest, userEvents?: IUserEvents): Observable<IComplaintResponse> {
        let obj = JSON.stringify(objReqSearch);
        return this.http.postHttpMethod(this.helpdeskUrl + 'GetByComplaintId', obj, userEvents);
    }

    getNotesByProblemId(strProblemId: string): Observable<IProblemNotesResponse[]> {
        return this.http.getHttpWithParams(this.helpdeskUrl + 'GetProblemNotes', "strProblemId", strProblemId);
    }

    getAttachmentsByProblemId(strProblemId: string): Observable<IAttachmentResponse[]> {
        return this.http.getHttpWithParams(this.helpdeskUrl + 'GetAttachmentByProblemId', "strProblemId", strProblemId);
    }

    updateProblemInfo(objReqComplaints: ICreatecomplaintrequest, userEvents?: IUserEvents): Observable<boolean> {
        let obj = JSON.stringify(objReqComplaints);
        return this.http.postHttpMethod(this.helpdeskUrl + 'UpdateProblemInfo', obj, userEvents);
    }

    createProblemNotes(objProblemNotes: INotesRequest, userEvents?: IUserEvents): Observable<boolean> {
        let obj = JSON.stringify(objProblemNotes);
        return this.http.postHttpMethod(this.helpdeskUrl + 'CreateProblemNotes', obj, userEvents);
    }

    updateProblemNotes(objProblemNotes: INotesRequest, userEvents?: IUserEvents): Observable<boolean> {
        let obj = JSON.stringify(objProblemNotes);
        return this.http.postHttpMethod(this.helpdeskUrl + 'UpdateProblemNotes', obj, userEvents);
    }

    getAllowedTicketsForAction(objReqAssignStatus: IAssignStatusRequest): Observable<IProblemStatusResponse[]> {
        return this.http.postHttpMethod(this.helpdeskUrl + 'GetAllowedTicketsForAction', JSON.stringify(objReqAssignStatus));
    }

    getChildIdsByProblemId(strProblemId: string): Observable<[IComplaintResponse[]]> {
        let obj = JSON.stringify(strProblemId);
        return this.http.getHttpWithParams(this.helpdeskUrl + 'GetChildIdsByProblemId', "strProblemId", obj);
    }

    updateProblemStatus(objReqStatusUpdate: IStatusupdateRequest, userEvents?: IUserEvents): Observable<boolean> {
        let obj = JSON.stringify(objReqStatusUpdate);
        return this.http.postHttpMethod(this.helpdeskUrl + 'UpdateProblemStatus', obj, userEvents);
    }

    getInterUserDetails(strSubsystem: string): Observable<any> {
        let obj = JSON.stringify(strSubsystem);
        return this.http.getHttpWithParams(this.helpdeskUrl + 'GetInterUserDetails', "strSubsystem", strSubsystem);
    }

    searchViolator(objReqViolatorSearch: IViolatorsearchRequest): Observable<IViolatorSearchResponse[]> {
        let obj = JSON.stringify(objReqViolatorSearch);
        return this.http.postHttpMethod(this.helpdeskUrl + 'SearchViolator', obj);
    }

    advancedSearchCustomer(objReqCustomerSearch: ISearchCustomerRequest): Observable<IProfileResponse[]> {
        let obj = JSON.stringify(objReqCustomerSearch);
        return this.http.postHttpMethod(this.helpdeskUrl + 'AdvancedSearchCustomer', obj);
    }

    getLookUpByParentLookupTypeCode(lookuptypecode: ICommonResponse, userEvents?: IUserEvents): Observable<ICommonResponse[]> {
        let obj = JSON.stringify(lookuptypecode);
        return this.http.getHttpWithParams(this.common + 'GetLookUpByParentLookupTypeCode', "lookupTypecode", obj, userEvents);
    }

    addAttachment(objattachmentRequest: IAttachmentRequest[], userEvents?: IUserEvents): Observable<boolean> {
        let obj = JSON.stringify(objattachmentRequest);
        return this.http.postHttpMethod(this.helpdeskUrl + 'AddAttachment', obj, userEvents);
    }

    getStatusMatrix(objAssignStatus: IAssignStatusRequest): Observable<IProblemStatusResponse> {
        let obj = JSON.stringify(objAssignStatus);
        return this.http.postHttpMethod(this.helpdeskUrl + 'GetStatusMatrix', obj);
    }

}

