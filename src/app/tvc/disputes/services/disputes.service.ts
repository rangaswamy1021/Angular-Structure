import { ICreateViolatorRequest } from './../models/createviolatorrequest';
import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { HttpService } from "../../../shared/services/http.service";
import 'rxjs/add/operator/map';
import { IAffidavitResponse } from "../models/affidavitresponse";
import { IAffidavitRequest } from "../models/affidavitrequest";
import { IViolatorSearchRequest } from "../../search/models/violatorsearchrequest";
import { IViolatorSearchResponse } from "../../search/models/violatorsearchresponse";
import { IUserEvents } from "../../../shared/models/userevents";

@Injectable()
export class DisputesService {
    private disputesUrl = 'Disputes/';
    private violationSearchUrl = 'ViolatorDetails/';
    private customerUrl = '/CustomerAccounts/';

    constructor(private http: HttpService) { }

    getExistingAffidavit(objAffidavitRequest: IAffidavitRequest, userEvents?: IUserEvents): Observable<IAffidavitResponse> {
        return this.http.postHttpMethod(this.disputesUrl + 'GetExistingAffidavit', JSON.stringify(objAffidavitRequest), userEvents);
    }

    nonLiabilityAffidavit(objAffidavitRequest: IAffidavitRequest, userEvents?: IUserEvents): Observable<boolean> {
        return this.http.postHttpMethod(this.disputesUrl + 'NonLiabilityAffidavit', JSON.stringify(objAffidavitRequest), userEvents);
    }
    //non-liability
    invalidAffidavit(objAffidavitRequest: IAffidavitRequest, userEvents: IUserEvents): Observable<boolean> {
        return this.http.postHttpMethod(this.disputesUrl + 'InvalidAffidavit', JSON.stringify(objAffidavitRequest), userEvents);
    }
    //non-liability
    affidavitForWrongPlate(objAffidavitRequest: IAffidavitRequest, userEvents: IUserEvents): Observable<boolean> {
        return this.http.postHttpMethod(this.disputesUrl + 'AffidavitForWrongPlate', JSON.stringify(objAffidavitRequest), userEvents);
    }
    //non-liability
    getStolenAccount(): Observable<number> {
        var obj = JSON.stringify({});
        return this.http.postHttpMethod(this.disputesUrl + 'GetStolenAccount', obj);
    }

    getViolatorsBySearchRequest(violatorSearchRequest: IViolatorSearchRequest, userEvents?: IUserEvents): Observable<IViolatorSearchResponse[]> {
        return this.http.postHttpMethod(this.violationSearchUrl + 'SearchViolator', JSON.stringify(violatorSearchRequest), userEvents);
    }

    //non-liability
    uploadFile(formData: FormData): Observable<any> {
        return this.http.postHttpMethodwithoutOptions(this.disputesUrl + 'UploadFile', formData);
    }
    //non-liability
    deleteFile(strDbFilePath: string): Observable<[boolean]> {
        let filePath = strDbFilePath;
        return this.http.deleteHttpMethodWithParams(this.disputesUrl + 'DeleteFile', 'strDbFilePath', filePath);
    }
    createViolator(objCreateViolator: ICreateViolatorRequest, userEvents?: IUserEvents): Observable<number> {
        return this.http.postHttpMethod(this.disputesUrl + 'CreateViolator', objCreateViolator, userEvents);
    }
    isEmailExist(strEmailAddress: string): Observable<boolean> {
        var obj = JSON.stringify(strEmailAddress);
        return this.http.postHttpMethod(this.customerUrl + 'IsEmailExist', obj);
    }

    disputeRequest(objAffidavitRequest: IAffidavitRequest, userEvents?: IUserEvents): Observable<boolean> {
        return this.http.postHttpMethod(this.disputesUrl + 'DisputeRequest', JSON.stringify(objAffidavitRequest), userEvents);
    }

    disputeRequestforInvoice(objAffidavitRequest: IAffidavitRequest, userEvents?: IUserEvents): Observable<boolean> {
        return this.http.postHttpMethod(this.disputesUrl + 'DisputeRequestForInvoice', JSON.stringify(objAffidavitRequest), userEvents);
    }

    getDisputeDetails(objAffidavitRequest: IAffidavitRequest, userEvents?: IUserEvents): Observable<any[]> {
        return this.http.postHttpMethod(this.disputesUrl + 'GetDisputeDetails', JSON.stringify(objAffidavitRequest), userEvents);
    }

    getDisputedTripsDetails(longAffidavitId: number, userEvents?: IUserEvents): Observable<any[]> {
        return this.http.postHttpMethod(this.disputesUrl + 'GetDisputedTrips', JSON.stringify(longAffidavitId), userEvents);
    }

    invoiceDisputReject(objAffidavitRequest: IAffidavitRequest, userEvents?: IUserEvents): Observable<boolean> {
        return this.http.postHttpMethod(this.disputesUrl + 'InvoiceInvalidAffidavit', JSON.stringify(objAffidavitRequest), userEvents);
    }
    invoiceDisputeInprocess(objAffidavitRequest: IAffidavitRequest, userEvents?: IUserEvents): Observable<boolean> {
        return this.http.postHttpMethod(this.disputesUrl + 'InvoiceDisputeRequestUpdate', JSON.stringify(objAffidavitRequest), userEvents);
    }

    getDisputeInvoicesDetails(longAffidavitId: number, userEvents?: IUserEvents): Observable<any[]> {
        return this.http.postHttpMethod(this.disputesUrl + 'GetDisputeInvoices',JSON.stringify(longAffidavitId),userEvents);
    }
}
