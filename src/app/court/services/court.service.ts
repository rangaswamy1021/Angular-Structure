import { Injectable } from '@angular/core';
import { HttpService } from '../../shared/services/http.service';
import { IUserEvents } from "../../shared/models/userevents";
import { Observable } from "rxjs/Observable";


@Injectable()
export class CourtService {

  constructor(private http: HttpService) { }
  private courtURL = 'Court/';
  private customerDetailsUrl = 'CustomerDetails/';

  searchPreCourtCustomerDetails(precourtrequest: any, userEvents?: IUserEvents): Observable<any[]> {
    return this.http.postHttpMethod(this.courtURL + 'SerachPreCourtCustomerDetails', JSON.stringify(precourtrequest), userEvents);
  }

  getPreCourtCustRespHistory(precourtrequest: any, userEvents?: IUserEvents): Observable<any[]> {
    return this.http.postHttpMethod(this.courtURL + 'GetPreCourtCustRespHistory', JSON.stringify(precourtrequest), userEvents);
  }

  getPreCourtCustomersDetails(precourtrequest: any, userEvents?: IUserEvents): Observable<any[]> {
    return this.http.postHttpMethod(this.courtURL + 'GetPreCourtCustomersDetails', JSON.stringify(precourtrequest), userEvents);
  }

  // insertCustRespnseDocuments(precourtrequest: any): Observable<boolean> {
  //   return this.http.postHttpMethod(this.courtURL + 'InsertCustomerResponseDocuments', JSON.stringify(precourtrequest));
  // }

  insertActiveCollectionDetails(precourtrequest: any[]): Observable<boolean> {
    return this.http.postHttpMethod(this.courtURL + 'InsertActiveCollectionDetails', JSON.stringify(precourtrequest));
  }

  intiateOffCycleLetter(precourtrequest: any[]): Observable<boolean> {
    return this.http.postHttpMethod(this.courtURL + 'IntiateOffCycleLetter', JSON.stringify(precourtrequest));
  }


  getCourtEligibleCustomers(collectionReq: any): Observable<any[]> {
    return this.http.postHttpMethod(this.courtURL + 'SearchCustomersForCourtSelection', JSON.stringify(collectionReq));
  }

  //bind trip details for trip selection
  getTripDetails(tripSelectionRequest: any): Observable<any[]> {
    return this.http.postHttpMethod(this.courtURL + 'GetTripDetails', JSON.stringify(tripSelectionRequest));
  }

  //bind trip details for trip selection
  getSSNandDOB(longCustomerId: any): Observable<any[]> {
    return this.http.postHttpMethod(this.courtURL + 'GetSsnDob', JSON.stringify(longCustomerId));
  }

  getImagePath(longTripId: number, userEvents?: IUserEvents): Observable<any[]> {
    return this.http.postHttpMethod(this.customerDetailsUrl + 'GetImage', JSON.stringify(longTripId));
  }

  createCourtDocket(preCourtCustomers: any): Observable<any> {
    return this.http.postHttpMethod(this.courtURL + 'CreateCourtDocket', JSON.stringify(preCourtCustomers));
  }


  getActiveCollectionResponseHistoryByCollectionCustId(PreCourtCustomerReqObjet: any, userEvents?: IUserEvents): Observable<any[]> {
    return this.http.postHttpMethod(this.courtURL + 'GetActiveCollectionResponseHistoryByCollectionCustId', JSON.stringify(PreCourtCustomerReqObjet));
  }


  getEvidenceDocuments(courtAttachments: any, userEvents?: IUserEvents): Observable<any[]> {
    return this.http.postHttpMethod(this.courtURL + 'GetEvidenceDocuments', JSON.stringify(courtAttachments), userEvents);
  }

  createAffidavitDocument(courtCustomers: any, userEvents?: IUserEvents): Observable<any> {
    return this.http.postHttpMethod(this.courtURL + 'CreateAffidavitDocument', JSON.stringify(courtCustomers), userEvents);
  }

  createAccountSummaryDocument(courtCustomers: any, userEvents?: IUserEvents): Observable<boolean> {
    return this.http.postHttpMethod(this.courtURL + 'CreateAccountSummaryDocument', JSON.stringify(courtCustomers), userEvents);
  }

  deleteDocumentType(courtAttachments: any, userEvents?: IUserEvents): Observable<boolean> {
    return this.http.postHttpMethod(this.courtURL + 'DeleteDocuments', JSON.stringify(courtAttachments), userEvents);
  }

  uploadEvidenceFile(formData: FormData): Observable<any> {
    return this.http.postHttpMethodwithoutOptions(this.courtURL + 'UploadEvidenceFile', formData);

  }

  searchCourtTracking(objCourtTracking: any): Observable<any[]> {
    return this.http.postHttpMethod(this.courtURL + 'SearchCourtCustomers', JSON.stringify(objCourtTracking));
  }

  updateCaseNo(objCourtTracking: any): Observable<boolean> {
    return this.http.postHttpMethod(this.courtURL + 'UpdateCaseNo', JSON.stringify(objCourtTracking));
  }

  updateCaseStatus(objCourtTracking: any): Observable<boolean> {
    return this.http.postHttpMethod(this.courtURL + 'UpdateCaseStatus', JSON.stringify(objCourtTracking));
  }

  updateDispositionStatus(objCourtTracking: any): Observable<boolean> {
    return this.http.postHttpMethod(this.courtURL + 'UpdateDispositionStatus', JSON.stringify(objCourtTracking));
  }

  updateNonGuiltyStatus(objCourtTracking: any): Observable<boolean> {
    return this.http.postHttpMethod(this.courtURL + 'UpdateNonGuiltyStatus', JSON.stringify(objCourtTracking));
  }

  tripPayment(objCourtTracking: any): Observable<boolean> {
    return this.http.postHttpMethod(this.courtURL + 'TripPayment', JSON.stringify(objCourtTracking));
  }

  updateCourtPaymentStatus(objCourtTracking: any): Observable<boolean> {
    return this.http.postHttpMethod(this.courtURL + 'UpdateCourtPaymentStatus', JSON.stringify(objCourtTracking));
  }

  insertCustomerResponse(objPreCourtTracking: any): Observable<any[]> {
    return this.http.postHttpMethod(this.courtURL + 'InsertCustomerResponse', JSON.stringify(objPreCourtTracking));
  }

  getPomisetoPayStatus(objPreCourtTracking: any): Observable<any[]> {
    return this.http.postHttpMethod(this.courtURL + 'GetPomisetoPayStatus', JSON.stringify(objPreCourtTracking));
  }

  getPaymentPlan(customerId: number): Observable<any[]> {
    return this.http.postHttpMethod(this.courtURL + 'GetPaymentPlan', customerId);
  }

  deleteFile(courtAttachments: any): Observable<boolean> {
    return this.http.postHttpMethod(this.courtURL + 'DeleteFile', JSON.stringify(courtAttachments));
  }

  insertCourtDocuments(courtAttachments: any): Observable<boolean> {
    return this.http.postHttpMethod(this.courtURL + 'InsertCourtDocuments', JSON.stringify(courtAttachments));
  }

  mergeDocuments(courtAttachments: any): Observable<boolean> {
    return this.http.postHttpMethod(this.courtURL + 'MergeDocuments', JSON.stringify(courtAttachments));
  }

  moveToCourt(courtCustomer: any): Observable<boolean> {
    return this.http.postHttpMethod(this.courtURL + 'MoveToCourt', JSON.stringify(courtCustomer));
  }

  updateEvidencePacket(courtAttachmentslst: any[]): Observable<boolean> {
    return this.http.postHttpMethod(this.courtURL + 'UpdateEvidencePacket', JSON.stringify(courtAttachmentslst));
  }

  uploadFile(formData: FormData): Observable<any> {
    return this.http.postHttpMethodwithoutOptions(this.courtURL + 'UploadFile', formData);
  }



}
